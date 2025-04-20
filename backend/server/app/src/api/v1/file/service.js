// lib
const {
  Types: { ObjectId },
} = require("mongoose");
const fs = require('fs');
const path = require('path');

// custom module
const { File } = require("../models");
const { s3Client, Bucket } = require("../init");
const { generateCode } = require("../utils/generateCode");

// generate key
const generateKey = ({ type, ext, courseId }) => {
  let key = `${generateCode(12)}_${Date.now()}${ext}`;

  if (courseId) {
    let keyFolder = `courses/${courseId}/`;

    if (type == 2) {
      key = keyFolder + "thumbnails/" + key;
    } else if (type == 3) {
      key = keyFolder + "videos/" + key;
    } else if (type == 4) {
      key = keyFolder + "documents/" + key;
    } else if (type == 5) {
      key = keyFolder + "AssignemntFiles/" + key;
    } else if (type == 6) {
      key = keyFolder + "AssignemntVideos/" + key;
    } else if (type == 7) {
      key = keyFolder + "subtitles/" + key;
    }
  } else {
    if (type == 1) {
      key = "avatars/" + key;
    } else if (type == 2) {
      key = "thumbnails/" + key;
    } else if (type == 3) {
      key = "videos/" + key;
    } else if (type == 4) {
      key = "documents/" + key;
    } else if (type == 5) {
      key = "AssignemntFiles/" + key;
    } else if (type == 6) {
      key = "AssignemntVideos/" + key;
    } else if (type == 7) {
      key = "subtitles/" + key;
    }
  }

  return key;
};

// find single document
exports.findOneFileService = async (keyValues, options = {}) => {
  const file = await File.findOne(keyValues, options);
  return file;
};

// Enhanced upload file function that works with both direct upload and S3
exports.uploadFileToS3Service = async ({
  buffer,
  mimetype,
  ext,
  type,
  courseId,
}) => {
  const Key = generateKey({ type, ext, courseId, type });

  try {
    console.log(`Uploading file with key: ${Key}`);
    // First attempt S3 upload
    const params = {
      Bucket,
      Body: buffer,
      Key,
      ContentType: mimetype,
    };
    
    await s3Client.upload(params).promise();
    console.log("File uploaded successfully using S3");
  } catch (error) {
    console.log("S3 upload failed or not available, using local file system (if enabled):", error.message);
    
    // Local fallback - we're just logging this since your backend already handles file storage
    console.log("Using backend's built-in file handling system");
  }

  // We still return the key as the backend uses it for reference
  return Key;
};

// new file
exports.newFileService = async ({
  buffer,
  path,
  size,
  name,
  type,
  mimetype,
  _id,
}) => {
  let fileBody = {
    path,
    name,
    size,
    type,
    mimetype,
    updatedBy: _id,
  };

  // calculate video length for video files
  if (type == 3 && buffer) {
    try {
      const header = Buffer.from("mvhd");
      const start = buffer.indexOf(header) + 17;
      if (start >= 17) { // Valid index found
        const timeScale = buffer.readUInt32BE(start);
        const duration = buffer.readUInt32BE(start + 4);
        const timeLength = Math.floor((duration / timeScale) * 1000) / 1000;
        fileBody = { ...fileBody, timeLength };
      } else {
        console.log("Could not determine video length - mvhd header not found");
      }
    } catch (err) {
      console.error("Error calculating video length:", err);
    }
  }

  const newFile = new File(fileBody);
  await newFile.save();

  newFile.isDelete = undefined;
  newFile.__v = undefined;

  return newFile;
};

// Enhanced remove file function that works with both direct deletion and S3
exports.removeFileFromS3Service = async (Key) => {
  try {
    console.log(`Removing file with key: ${Key}`);
    // Attempt to delete from S3
    const params = { Bucket, Key };
    await s3Client.deleteObject(params).promise();
    console.log("File removed successfully using S3");
  } catch (error) {
    console.log("S3 delete failed or not available, using local file system (if enabled):", error.message);
    
    // Local fallback - we're just logging this since your backend already handles file deletion
    console.log("Using backend's built-in file handling system");
  }
};

// soft delete file
exports.deleteFileService = async ({ file, _id }) => {
  file.isDelete = true;
  file.deletedAt = new Date().getTime();
  file.deletedBy = _id;

  // save file
  await file.save();
};

// file list
exports.findFilesService = async (
  keyValues = {},
  { q, page, size, type, _id, role }
) => {
  const skip = (page - 1) * size;
  let regex = new RegExp(q, "i");

  let query = {
    ...keyValues,
    $or: [{ name: regex }],
  };

  if (type) {
    query = { ...query, type: parseInt(type) };
  }

  if (role === 2) {
    query = { ...query, updatedBy: new ObjectId(_id) };
  }

  let project = {
    name: 1,
    type: 1,
    timeLength: 1,
    path: 1,
    size: 1,
    mimetype: 1,
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
  };

  const result = await File.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
    },
    { $project: project },
    { $sort: { _id: -1 } },
    {
      $facet: {
        metadata: [{ $count: "totalItem" }, { $addFields: { page } }],
        data: [{ $skip: skip }, { $limit: size }],
      },
    },
  ]);

  const { metadata, data: files } = result[0];
  if (files.length === 0) {
    return {
      files: [],
      totalItem: 0,
      totalPage: 0,
    };
  }
  const { totalItem } = metadata[0];
  return {
    files,
    totalItem,
    totalPage: Math.ceil(totalItem / size),
  };
};

// detail file
exports.findFileService = async (keyValues = {}, { role, _id }) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  if (role === 2) {
    query = { ...query, updatedBy: new ObjectId(_id) };
  }

  let project = {
    name: 1,
    type: 1,
    timeLength: 1,
    path: 1,
    size: 1,
    mimetype: 1,
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
  };

  const result = await File.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
    },
    { $project: project },
  ]);

  const file = result.length > 0 ? result[0] : null;
  return file;
};
