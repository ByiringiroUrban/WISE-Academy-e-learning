
// lib
const router = require("express").Router();

// custom
const {
  isAuthenticated,
  isAdmin,
  validate,
  isStudent,
  isInstructor,
} = require("../middlewares");
const { addValidator, idValidator } = require("./validator");
const {
  add,
  completeLecture,
  remove,
  enrollments,
  enrollment,
  enrollmentsByCourse,
} = require("./controller");

// routes
router.post("/", isAuthenticated, isStudent, addValidator, validate, add);

router.put(
  "/complete/:id",
  isAuthenticated,
  isStudent,
  idValidator,
  validate,
  completeLecture
);

router.delete("/:id", isAuthenticated, isAdmin, idValidator, validate, remove);

router.get("/", isAuthenticated, isStudent, enrollments);

router.get(
  "/:id",
  isAuthenticated,
  isStudent,
  idValidator,
  validate,
  enrollment
);

// New route for getting enrollments by course ID
router.get(
  "/course/:courseId",
  isAuthenticated,
  isInstructor,
  enrollmentsByCourse
);

module.exports = router;
