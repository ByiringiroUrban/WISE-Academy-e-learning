import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  // Other configuration options
});

// API utility functions for various endpoints
export const enrollmentAPI = {
  getUserEnrollments: () => api.get('/enrollments/user'),
  getEnrolledStudents: (courseId: string) => api.get(`/enrollments/course/${courseId}`),
  enrollCourse: (data: { courseId: string }) => api.post('/enrollments', data),
  completeLecture: (enrollmentId: string, lectureId: string) => 
    api.post(`/enrollments/${enrollmentId}/complete`, { lectureId }),
  getEnrollmentDetail: (enrollmentId: string) => api.get(`/enrollments/${enrollmentId}`),
};

export const courseAPI = {
  getCourses: (params?: any) => api.get('/courses', { params }),
  getPublicCourses: (params?: any) => api.get('/courses/public', { params }),
  getCourseDetails: (courseId: string) => api.get(`/courses/${courseId}`),
  getPublicCourseDetails: (courseId: string) => api.get(`/courses/public/${courseId}`),
  createCourse: (data: any) => api.post('/courses', data),
  updateCourse: (courseId: string, data: any) => api.patch(`/courses/${courseId}`, data),
  deleteCourse: (courseId: string) => api.delete(`/courses/${courseId}`),
  publishCourse: (courseId: string) => api.patch(`/courses/${courseId}/publish`),
};

export const userAPI = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUserById: (userId: string) => api.get(`/users/${userId}`),
  getCurrentUser: () => api.get('/users/profile'),
  updateUser: (userId: string, data: any) => api.patch(`/users/${userId}`, data),
  deleteUser: (userId: string) => api.delete(`/users/${userId}`),
};

export const reviewAPI = {
  getCourseReviews: (courseId: string) => api.get(`/reviews/course/${courseId}`),
  createReview: (data: any) => api.post('/reviews', data),
  updateReview: (reviewId: string, data: any) => api.patch(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId: string) => api.delete(`/reviews/${reviewId}`),
};

export const announcementAPI = {
  getCourseAnnouncements: (courseId: string) => api.get(`/announcements/course/${courseId}`),
  createAnnouncement: (data: any) => api.post('/announcements', data),
  updateAnnouncement: (announcementId: string, data: any) => api.patch(`/announcements/${announcementId}`, data),
  deleteAnnouncement: (announcementId: string) => api.delete(`/announcements/${announcementId}`),
};

export const assignmentAPI = {
  getCourseAssignments: (courseId: string) => api.get(`/assignments/course/${courseId}`),
  getAssignmentById: (assignmentId: string) => api.get(`/assignments/${assignmentId}`),
  submitAssignment: (assignmentId: string, data: any) => api.post(`/assignments/${assignmentId}/submit`, data),
  gradeAssignment: (submissionId: string, data: any) => api.post(`/assignments/submissions/${submissionId}/grade`, data),
};

export const quizAPI = {
  getCourseQuizzes: (courseId: string) => api.get(`/quizzes/course/${courseId}`),
  getQuizById: (quizId: string) => api.get(`/quizzes/${quizId}`),
  submitQuiz: (quizId: string, data: any) => api.post(`/quizzes/${quizId}/submit`, data),
};

export const fileAPI = {
  uploadFile: (formData: FormData) => api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteFile: (fileId: string) => api.delete(`/files/${fileId}`),
};

export default api;
