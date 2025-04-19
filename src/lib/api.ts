
import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Required to send cookies with requests
  timeout: 10000, // Add timeout to prevent hanging requests
});

// Track if a token refresh is in progress
let isRefreshing = false;
// Queue of requests that should be retried after token refresh
type QueueItem = {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
};
let failedQueue: QueueItem[] = [];

// Process the queue of failed requests
const processQueue = (error: Error | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  
  failedQueue = [];
};

// ✅ Enhanced interceptor to handle 401 errors globally with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Log all API errors with details
    console.error(`API Error: ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${error.config?.url || 'UNKNOWN'}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isLoginPage = window.location.pathname.includes('/login');
      const isAuthCheck = originalRequest.url?.includes('/auth/current');
      
      if (isLoginPage || isAuthCheck) {
        return Promise.reject(error);
      }
      
      // If a refresh is not already in progress
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;
        
        try {
          // Attempt to refresh the token
          await axios.get('/api/v1/auth/refresh-token', { withCredentials: true });
          
          // Token refreshed successfully, retry the original request
          processQueue(null);
          isRefreshing = false;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          processQueue(refreshError as Error);
          isRefreshing = false;
          console.log("API: Token refresh failed — redirecting to login");
          window.location.href = '/login'; // Uncomment this line to enable auto-redirect
          return Promise.reject(refreshError);
        }
      } else {
        // If a refresh is already in progress, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
    }
    
    // Handle 500 errors specifically (server errors)
    if (error.response?.status === 500) {
      console.error('Server error details:', error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

// ✅ Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/signup', userData),
  login: (credentials: any) => api.post('/auth/signin', credentials),
  logout: () => api.get('/auth/signout'),
  getCurrentUser: () => api.get('/auth/current'),
  refreshToken: () => api.get('/auth/refresh-token'),
};

// ✅ Course API
export const courseAPI = {
  getAllCourses: (params: any) => api.get('/courses/public', { params }),
  getCourseByKey: (key: string) => api.get(`/courses/public/${key}`),
  getCourseDetails: (key: string) => api.get(`/courses/${key}`),
  getInstructorCourses: () => api.get('/courses'),
  createCourse: (courseData: any) => api.post('/courses', courseData),
  updateCourse: (id: string, courseData: any) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id: string) => api.delete(`/courses/${id}`),
  publishCourse: (id: string) => api.put(`/courses/${id}/publish`),
};

// ✅ Category API
export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  getCategoryById: (id: string) => api.get(`/categories/${id}`),
  createCategory: (categoryData: any) => api.post('/categories', categoryData),
  updateCategory: (id: string, categoryData: any) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};

// ✅ Subcategory API
export const subcategoryAPI = {
  getSubcategories: (params: any) => api.get('/sub-categories', { params }),
  getSubcategoryById: (id: string) => api.get(`/sub-categories/${id}`),
  createSubcategory: (subcategoryData: any) => api.post('/sub-categories', subcategoryData),
  updateSubcategory: (id: string, subcategoryData: any) => api.put(`/sub-categories/${id}`, subcategoryData),
  deleteSubcategory: (id: string) => api.delete(`/sub-categories/${id}`),
};

// ✅ Enrollment API
export const enrollmentAPI = {
  enrollCourse: (enrollmentData: any) => api.post('/enrollments', enrollmentData),
  getUserEnrollments: () => api.get('/enrollments'),
  getEnrollmentDetails: (id: string) => api.get(`/enrollments/${id}`),
  getEnrolledStudents: (courseId: string) => api.get(`/enrollments/course/${courseId}`),
  completeLecture: (enrollmentId: string, lectureId: string) => 
    api.put(`/enrollments/complete/${enrollmentId}`, { lectureId }),
  getAllEnrollments: () => api.get('/enrollments/all'),
  getEnrollmentsByMonth: () => api.get('/enrollments/monthly'),
};

// ✅ Profile API
export const profileAPI = {
  getProfile: () => api.get('/profiles'),
  updateProfile: (profileData: any) => api.put('/profiles', profileData),
  uploadAvatar: (formData: FormData) => api.post('/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// ✅ Quiz API
export const quizAPI = {
  getQuizzes: () => api.get('/quizs'),
  getQuizById: (id: string) => api.get(`/quizs/${id}`),
  createQuiz: (quizData: any) => api.post('/quizs', quizData),
  updateQuiz: (id: string, quizData: any) => api.put(`/quizs/${id}`, quizData),
  deleteQuiz: (id: string) => api.delete(`/quizs/${id}`),
  getQuizQuestions: (quizId: string) => api.get(`/quizs/${quizId}/questions`),
  createQuestion: (questionData: any) => api.post('/quizs/questions', questionData),
  updateQuestion: (id: string, questionData: any) => api.put(`/quizs/questions/${id}`, questionData),
  deleteQuestion: (id: string) => api.delete(`/quizs/questions/${id}`),
  submitQuizAnswer: (answerData: any) => api.post('/quiz-answer', answerData),
};

// ✅ Assignment API
export const assignmentAPI = {
  getAssignments: () => api.get('/assignments'),
  getAssignmentById: (id: string) => api.get(`/assignments/${id}`),
  createAssignment: (assignmentData: any) => api.post('/assignments', assignmentData),
  updateAssignment: (id: string, assignmentData: any) => api.put(`/assignments/${id}`, assignmentData),
  deleteAssignment: (id: string) => api.delete(`/assignments/${id}`),
  getAssignmentSubmissions: (assignmentId: string) => api.get(`/assignment-answers/assignment/${assignmentId}`),
  submitAssignment: (submissionData: any) => api.post('/assignment-answers', submissionData),
  updateSubmission: (id: string, submissionData: any) => api.put(`/assignment-answers/${id}`, submissionData),
  gradeSubmission: (id: string, gradeData: any) => api.put(`/assignment-answers/${id}/grade`, gradeData),
};

// ✅ Review API
export const reviewAPI = {
  getReviews: (params: any) => api.get('/reviews', { params }),
  createReview: (reviewData: any) => api.post('/reviews', reviewData),
  updateReview: (id: string, reviewData: any) => api.put(`/reviews/${id}`, reviewData),
  getEnrollments: () => api.get('/enrollments'),
};

// ✅ Q&A API
export const qAndAAPI = {
  getQuestions: (courseId: string) => api.get(`/qas/course/${courseId}`),
  getQuestionsByLecture: (lectureId: string) => api.get(`/qas/lecture/${lectureId}`),
  createQuestion: (questionData: any) => api.post('/qas', questionData),
  replyToQuestion: (id: string, replyData: any) => api.post(`/qas/${id}/reply`, replyData),
  markAsSolution: (id: string) => api.put(`/qas/${id}/mark-solution`),
};

// ✅ Announcement API
export const announcementAPI = {
  getAnnouncements: (courseId?: string) => api.get('/announcements', { params: courseId ? { courseId } : {} }),
  getAnnouncementById: (id: string) => api.get(`/announcements/${id}`),
  createAnnouncement: (data: any) => api.post('/announcements', data),
  updateAnnouncement: (id: string, data: any) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id: string) => api.delete(`/announcements/${id}`),
};

// ✅ User API (for admin)
export const userAPI = {
  getAllUsers: (params?: any) => api.get('/auth/list', { params }),
  getUserById: (id: string) => api.get(`/auth/user/${id}`),
  updateUser: (id: string, userData: any) => api.put(`/auth/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/auth/user/soft/${id}`),
  changeUserRole: (id: string, role: number) => api.put(`/auth/users/${id}/role`, { role }),
};

// ✅ Lecture API
export const lectureAPI = {
  getLectures: () => api.get('/lectures'),
  getLectureById: (id: string) => api.get(`/lectures/${id}`),
  createLecture: (lectureData: any) => api.post('/lectures', lectureData),
  updateLecture: (id: string, lectureData: any) => api.put(`/lectures/${id}`, lectureData),
  deleteLecture: (id: string) => api.delete(`/lectures/${id}`),
};

// ✅ File API
export const fileAPI = {
  getFiles: (params?: any) => api.get('/files', { params }),
  getFileById: (id: string) => api.get(`/files/${id}`),
  uploadFile: (formData: FormData) => api.post('/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteFile: (id: string) => api.delete(`/files/${id}`),
};

// ✅ Chat API
export const chatAPI = {
  getConversations: () => api.get('/chats/conversations'),
  getMessages: (conversationId: string) => api.get(`/chats/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, content: string) => 
    api.post(`/chats/conversations/${conversationId}/messages`, { content }),
  startConversation: (userId: string) => api.post('/chats/conversations', { userId }),
  createConversation: (data: any) => api.post('/chats/conversations', data),
};

// ✅ Payment API
export const paymentAPI = {
  createOrder: (paymentData: any) => api.post('/payments/pay', paymentData),
  capturePayment: (orderId: string, paymentData: any) => 
    api.post(`/payments/pay/${orderId}/capture`, paymentData),
  getPayments: () => api.get('/payments'),
  getPaymentById: (id: string) => api.get(`/payments/${id}`),
};

// Export default API instance
export default api;
