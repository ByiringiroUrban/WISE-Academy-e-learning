
// custom
const { createActivityLog } = require('../utils/createActivityLog');
const { NotFound } = require('../utils/errors');
const {
  findOneEnrollmentService,
  completeLectureService,
  deleteEnrollmentService,
  findEnrollmentsService,
  findEnrollmentService,
  newEnrollmentService,
} = require('./service');
const { findOneLectureService } = require('../lecture/service');

// new enrollment
exports.add = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const { courseId } = req.body;
  const { _id } = req.user;

  try {
    // find enrollment
    const enrollment = await findOneEnrollmentService(
      {
        courseId,
        updatedBy: _id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (enrollment) {
      throw new NotFound(req.__('enrollmentExistErr'));
    }

    const newEnrollment = await newEnrollmentService({
      body: { courseId },
      _id,
    });
    // save activity log
    await createActivityLog({
      title: `New enrollment`,
      desc: `${newEnrollment._id} enrollment id is created`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: 'success',
      message: req.__('enrollmentAddSucc'),
      data: { enrollment: newEnrollment },
    });
  } catch (error) {
    console.error("Enrollment add error:", error);
    next(error, req, res);
  }
};

// complete lecture
exports.completeLecture = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { lectureId } = req.body;
  const { _id, role } = req.user;

  try {
    if (!id || !lectureId) {
      return res.status(400).json({
        code: 400,
        status: 'error',
        message: 'Missing enrollment ID or lecture ID',
      });
    }

    // find enrollment
    const enrollment = await findOneEnrollmentService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!enrollment) {
      throw new NotFound(req.__('enrollmentNotFoundErr'));
    }

    // find lecture
    const lecture = await findOneLectureService({
      _id: lectureId,
      isDelete: false,
    });
    if (!lecture) {
      throw new NotFound(req.__('lectureNotFoundErr'));
    }

    // update enrollment
    const updatedEnrollment = await completeLectureService({
      enrollment,
      lectureId,
      role,
      _id,
    });

    // save activity log
    await createActivityLog({
      title: `Update enrollment`,
      desc: `${enrollment._id} enrollment id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: 'success',
      message: req.__('enrollmentUpdateSucc'),
      data: { enrollment: updatedEnrollment },
    });
  } catch (error) {
    console.error("Complete lecture error:", error);
    next(error, req, res);
  }
};

// remove enrollment
exports.remove = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find enrollment
    const enrollment = await findOneEnrollmentService({
      _id: id,
      isDelete: false,
    });
    if (!enrollment) {
      throw new NotFound(req.__('enrollmentNotFoundErr'));
    }

    // soft delete enrollment
    await deleteEnrollmentService({ enrollment, _id });

    // save activity log
    await createActivityLog({
      title: `Delete enrollment`,
      desc: `${enrollment._id} enrollment id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: 'success',
      message: req.__('enrollmentDeleteSucc'),
    });
  } catch (error) {
    console.error("Remove enrollment error:", error);
    next(error, req, res);
  }
};

// list enrollment
exports.enrollments = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { q, page, size } = req.query;
  const query = {
    isDelete: false
  };
  let options = {
    q: q !== 'undefined' && q !== undefined ? q : '',
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
    _id,
  };

  try {
    // list
    const enrollments = await findEnrollmentsService(query, options);

    // save activity log
    await createActivityLog({
      title: `List enrollment`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: 'success',
      message: res.__('enrollmentListSucc'),
      data: { ...enrollments },
    });
  } catch (error) {
    console.error("List enrollments error:", error);
    next(error, req, res);
  }
};

// enrollment detail
exports.enrollment = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    if (!id) {
      return res.status(400).json({
        code: 400,
        status: 'error',
        message: 'Missing enrollment ID',
      });
    }

    // list
    const enrollment = await findEnrollmentService(keyValues);
    if (!enrollment) {
      throw new NotFound(req.__('enrollmentNotFoundErr'));
    }

    // save activity log
    await createActivityLog({
      title: `Detail enrollment`,
      desc: `Get detail enrollment by "${enrollment._id}" id `,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: 'success',
      message: res.__('enrollmentDetailSucc'),
      data: { enrollment },
    });
  } catch (error) {
    console.error("Enrollment detail error:", error);
    next(error, req, res);
  }
};

// enrollments by course
exports.enrollmentsByCourse = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { courseId } = req.params;
  const { q, page, size } = req.query;
  const query = {
    isDelete: false,
    courseId
  };
  let options = {
    q: q !== 'undefined' && q !== undefined ? q : '',
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
    _id,
  };

  try {
    // list
    const enrollments = await findEnrollmentsService(query, options);

    // save activity log
    await createActivityLog({
      title: `List course enrollments`,
      desc: `Get enrollments for course ${courseId}`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: 'success',
      message: res.__('enrollmentListSucc'),
      data: { ...enrollments },
    });
  } catch (error) {
    console.error("List enrollments by course error:", error);
    next(error, req, res);
  }
};
