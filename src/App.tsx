
import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Homepage from '@/pages/Homepage';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import CourseListing from '@/pages/CourseListing';
import CourseDetails from '@/pages/CourseDetails';
import CourseLesson from '@/pages/CourseLesson';
import CourseLearn from '@/pages/CourseLearn';
import Profile from '@/pages/Profile';
import Dashboard from '@/pages/Dashboard';
import Unauthorized from '@/pages/Unauthorized';
import NotesPage from '@/pages/notes/NotesPage';
import QuizPage from '@/pages/quizzes/QuizPage';
import QAndAPage from '@/pages/qAndA/QAndAPage';
import Messages from '@/pages/messaging/Messages';
import ReviewForm from '@/pages/student/ReviewForm';
import QAFeedback from '@/pages/student/QAFeedback';
import StudentAssignments from '@/pages/student/StudentAssignments';
import AssignmentSubmissionForm from '@/pages/student/AssignmentSubmissionForm';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import CategoryManagement from '@/pages/admin/CategoryManagement';
import UserManagement from '@/pages/admin/UserManagement';
import CourseManagement from '@/pages/admin/CourseManagement';
import InstructorDashboard from '@/pages/instructor/InstructorDashboard';
import AddCourse from '@/pages/instructor/AddCourse';
import EditCourse from '@/pages/instructor/EditCourse';
import CourseContentUpload from '@/pages/instructor/CourseContentUpload';
import QuizManagement from '@/pages/instructor/QuizManagement';
import AssignmentManagement from '@/pages/instructor/AssignmentManagement';
import AnnouncementManagement from '@/pages/instructor/AnnouncementManagement';
import StudentManagement from '@/pages/instructor/StudentManagement';
import RoleGuard from '@/components/RoleGuard';
import { Toaster } from '@/components/ui/toaster'; // Fix: Use named import instead of default import
import PaymentPage from "@/pages/payment/PaymentPage";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<CourseListing />} />
          <Route path="/courses/:key" element={<CourseDetails />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route
            path="/courses/:courseKey/learn"
            element={
              <RoleGuard allowedRoles={[1, 2, 3]}>
                <CourseLearn />
              </RoleGuard>
            }
          />
          <Route
            path="/courses/:courseKey/lessons/:lessonId"
            element={
              <RoleGuard allowedRoles={[1, 2, 3]}>
                <CourseLesson />
              </RoleGuard>
            }
          />
          <Route 
            path="/dashboard" 
            element={
              <RoleGuard allowedRoles={[1, 2, 3]}>
                <Dashboard />
              </RoleGuard>
            }
          />
          <Route 
            path="/profile" 
            element={
              <RoleGuard allowedRoles={[1, 2, 3]}>
                <Profile />
              </RoleGuard>
            }
          />
          <Route 
            path="/courses/:courseKey/lessons/:lectureId/notes" 
            element={
              <RoleGuard allowedRoles={[1, 2, 3]}>
                <NotesPage />
              </RoleGuard>
            } 
          />
          <Route 
            path="/courses/:courseKey/quizzes/:quizId" 
            element={
              <RoleGuard allowedRoles={[1, 2, 3]}>
                <QuizPage />
              </RoleGuard>
            } 
          />
          <Route 
            path="/courses/:courseId/lessons/:lectureId/qa" 
            element={
              <RoleGuard allowedRoles={[1, 2, 3]}>
                <QAndAPage />
              </RoleGuard>
            } 
          />
          <Route 
            path="/student/assignments"
            element={
              <RoleGuard allowedRoles={[1, 2, 3]}>
                <StudentAssignments />
              </RoleGuard>
            }
          />
          <Route 
            path="/courses/:key/review" 
            element={
              <RoleGuard allowedRoles={[1, 2, 3]}>
                <ReviewForm />
              </RoleGuard>
            } 
          />
          <Route 
            path="/courses/:courseId/lessons/:lectureId/feedback" 
            element={
              <RoleGuard allowedRoles={[1, 2, 3]}>
                <QAFeedback />
              </RoleGuard>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <RoleGuard allowedRoles={[1, 2, 3]}>
                <Messages />
              </RoleGuard>
            } 
          />
          <Route 
            path="/courses/:courseId/assignments/:assignmentId/submit" 
            element={
              <RoleGuard allowedRoles={[1, 2, 3]}>
                <AssignmentSubmissionForm />
              </RoleGuard>
            } 
          />
          <Route
            path="/admin/dashboard"
            element={
              <RoleGuard allowedRoles={[1]}>
                <AdminDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <RoleGuard allowedRoles={[1]}>
                <CategoryManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleGuard allowedRoles={[1]}>
                <UserManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <RoleGuard allowedRoles={[1]}>
                <CourseManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/instructor/dashboard"
            element={
              <RoleGuard allowedRoles={[1, 2]}>
                <InstructorDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/instructor/courses/add"
            element={
              <RoleGuard allowedRoles={[1, 2]}>
                <AddCourse />
              </RoleGuard>
            }
          />
          <Route
            path="/instructor/courses/edit/:id"
            element={
              <RoleGuard allowedRoles={[1, 2]}>
                <EditCourse />
              </RoleGuard>
            }
          />
          <Route
            path="/instructor/courses/:courseId/content"
            element={
              <RoleGuard allowedRoles={[1, 2]}>
                <CourseContentUpload />
              </RoleGuard>
            }
          />
          <Route
            path="/instructor/quizzes"
            element={
              <RoleGuard allowedRoles={[1, 2]}>
                <QuizManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/instructor/assignments"
            element={
              <RoleGuard allowedRoles={[1, 2]}>
                <AssignmentManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/instructor/announcements"
            element={
              <RoleGuard allowedRoles={[1, 2]}>
                <AnnouncementManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/instructor/students"
            element={
              <RoleGuard allowedRoles={[1, 2]}>
                <StudentManagement />
              </RoleGuard>
            }
          />
        </Routes>
      </main>
      <footer className="bg-blue-950 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600">© 2023 E-Learning Platform. All rights reserved.</p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

export default App;
