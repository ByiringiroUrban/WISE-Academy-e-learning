
// lib
const router = require("express").Router();

// custom
const { isAuthenticated, validate, isInstructor } = require("../middlewares");
const { addValidator, idValidator, updateValidator } = require("./validator");
const {
  add,
  update,
  remove,
  courses,
  course,
  publicCourses,
  publicCourse,
  publishCourse
} = require("./controller");

// routes
router.post("/", isAuthenticated, isInstructor, addValidator, validate, add);

router.put(
  "/:id",
  isAuthenticated,
  isInstructor,
  updateValidator,
  validate,
  update
);

router.delete(
  "/:id",
  isAuthenticated,
  isInstructor,
  idValidator,
  validate,
  remove
);

router.get("/", isAuthenticated, isInstructor, courses);

router.get("/public", publicCourses);

router.get("/public/:key", publicCourse);

router.get("/:key", isAuthenticated, isInstructor, course);

router.put(
  "/:id/publish",
  isAuthenticated,
  isInstructor,
  idValidator,
  validate,
  publishCourse
);

module.exports = router;
