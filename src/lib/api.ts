
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
  getEnrollments: (params?: any) => api.get('/enrollments', { params }),
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
  getAllCourses: (params?: any) => api.get('/courses/all', { params }),
  getCourseByKey: (courseKey: string) => api.get(`/courses/key/${courseKey}`),
  getInstructorCourses: () => api.get('/courses/instructor'),
};

export const userAPI = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUserById: (userId: string) => api.get(`/users/${userId}`),
  getCurrentUser: () => api.get('/users/profile'),
  updateUser: (userId: string, data: any) => api.patch(`/users/${userId}`, data),
  deleteUser: (userId: string) => api.delete(`/users/${userId}`),
  getAllUsers: (params?: any) => api.get('/users/all', { params }),
};

export const reviewAPI = {
  getCourseReviews: (courseId: string) => api.get(`/reviews/course/${courseId}`),
  createReview: (data: any) => api.post('/reviews', data),
  updateReview: (reviewId: string, data: any) => api.patch(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId: string) => api.delete(`/reviews/${reviewId}`),
  getReviews: (params?: any) => api.get('/reviews', { params }),
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
  createAssignment: (data: any) => api.post('/assignments', data),
  updateAssignment: (assignmentId: string, data: any) => api.patch(`/assignments/${assignmentId}`, data), 
  getAssignments: (params?: any) => api.get('/assignments', { params }),
  getAssignmentSubmissions: (assignmentId: string) => api.get(`/assignments/${assignmentId}/submissions`),
  gradeSubmission: (submissionId: string, data: any) => api.post(`/assignments/submissions/${submissionId}/grade`, data),
};

export const quizAPI = {
  getCourseQuizzes: (courseId: string) => api.get(`/quizzes/course/${courseId}`),
  getQuizById: (quizId: string) => api.get(`/quizzes/${quizId}`),
  submitQuiz: (quizId: string, data: any) => api.post(`/quizzes/${quizId}/submit`, data),
  getQuizzes: (params?: any) => api.get('/quizzes', { params }),
  createQuiz: (data: any) => api.post('/quizzes', data),
  updateQuiz: (quizId: string, data: any) => api.patch(`/quizzes/${quizId}`, data),
};

export const fileAPI = {
  uploadFile: (formData: FormData) => api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteFile: (fileId: string) => api.delete(`/files/${fileId}`),
  getFileById: (fileId: string) => api.get(`/files/${fileId}`),
};

export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  getCategoryById: (categoryId: string) => api.get(`/categories/${categoryId}`),
  createCategory: (data: any) => api.post('/categories', data),
  updateCategory: (categoryId: string, data: any) => api.patch(`/categories/${categoryId}`, data),
  deleteCategory: (categoryId: string) => api.delete(`/categories/${categoryId}`),
};

export const subcategoryAPI = {
  getSubcategories: (categoryId?: string) => api.get('/subcategories', { params: { categoryId } }),
  getSubcategoryById: (subcategoryId: string) => api.get(`/subcategories/${subcategoryId}`),
  createSubcategory: (data: any) => api.post('/subcategories', data),
  updateSubcategory: (subcategoryId: string, data: any) => api.patch(`/subcategories/${subcategoryId}`, data),
  deleteSubcategory: (subcategoryId: string) => api.delete(`/subcategories/${subcategoryId}`),
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: any) => api.patch('/profile', data),
  changePassword: (data: any) => api.post('/profile/change-password', data),
};

export const authAPI = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
};

export const chatAPI = {
  getChats: () => api.get('/chats'),
  getChatById: (chatId: string) => api.get(`/chats/${chatId}`),
  createChat: (data: any) => api.post('/chats', data),
  sendMessage: (chatId: string, data: any) => api.post(`/chats/${chatId}/messages`, data),
  getMessages: (chatId: string) => api.get(`/chats/${chatId}/messages`),
};

export default api;
