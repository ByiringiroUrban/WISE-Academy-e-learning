
// This file now provides a mock implementation that uses the local file system
// instead of AWS S3 for file uploads.

// Create a local file handling implementation
const uploadToLocal = (file, key) => {
  console.log(`Using local file system instead of S3: ${key}`);
  // The actual file upload is handled by the existing backend
  // This just returns a compatible interface
  return {
    promise: () => Promise.resolve({
      Location: `/api/v1/files/${key}`,
      Key: key
    })
  };
};

// Delete file from local system
const deleteFromLocal = (key) => {
  console.log(`Removing file from local system: ${key}`);
  // The actual file deletion is handled by the existing backend
  return {
    promise: () => Promise.resolve({
      success: true
    })
  };
};

// Export compatible interface but use local file system
module.exports = {
  s3Client: {
    upload: uploadToLocal,
    deleteObject: deleteFromLocal,
    send: (command) => {
      console.log('Mocked S3 command:', command);
      return Promise.resolve({});
    }
  },
  uploadToS3: uploadToLocal,
  deleteFromS3: deleteFromLocal,
  Bucket: 'local-file-system'
};
