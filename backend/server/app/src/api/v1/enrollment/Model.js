
// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const enrollmentSchema = Schema(
  {
    courseId: { type: ObjectId, ref: "course", required: true },
    paymentId: { type: ObjectId },
    complete: [
      {
        lectureId: { type: ObjectId, ref: "lecture" },
        completedAt: { type: Date, default: Date.now },
        // todo
        notes: [
          {
            title: String,
            desc: String,
            createdAt: Date,
            updatedAt: Date,
          },
        ],
      },
    ],
    lastLectureCompleted: { type: ObjectId, ref: "lecture" },
    updatedBy: { type: ObjectId, ref: "user", required: true },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// Add a virtual property for completedLectures
enrollmentSchema.virtual('completedLectures').get(function() {
  return this.complete ? this.complete.map(item => item.lectureId) : [];
});

// Ensure virtual fields are included when converting to JSON
enrollmentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.completedLectures = doc.complete ? doc.complete.map(item => item.lectureId) : [];
    return ret;
  }
});

// Ensure virtual fields are included when converting to Object
enrollmentSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.completedLectures = doc.complete ? doc.complete.map(item => item.lectureId) : [];
    return ret;
  }
});

// reference
module.exports = model("enrollment", enrollmentSchema);
