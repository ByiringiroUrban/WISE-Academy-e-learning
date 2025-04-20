
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "@/components/ui/loader";
import AuthLayout from "@/components/layout/AuthLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import ErrorBoundary from "@/components/errors/ErrorBoundary";

// Lazy-loaded routes
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Home = lazy(() => import("@/pages/Home"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));
const StudentAssignments = lazy(() => import("@/pages/student/StudentAssignments"));
const CourseLearningPage = lazy(() => import("@/pages/student/CourseLearningPage"));
const InstructorDashboard = lazy(() => import("@/pages/instructor/InstructorDashboard"));
const AddCourse = lazy(() => import("@/pages/instructor/AddCourse"));
const EditCourse = lazy(() => import("@/pages/instructor/EditCourse"));
const CourseContent = lazy(() => import("@/pages/instructor/CourseContent"));
const CourseStudents = lazy(() => import("@/pages/instructor/CourseStudents"));
const Homepage = lazy(() => import("@/pages/Homepage"));

// Wrap components with Suspense for lazy loading
const withSuspense = (Component: React.ComponentType<any>) => {
  return (
    <Suspense fallback={<Loader />}>
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    </Suspense>
  );
};

// Create router configuration
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { index: true, element: withSuspense(Homepage) },
      { path: "login", element: withSuspense(Login) },
      { path: "register", element: withSuspense(Register) },
      { path: "home", element: withSuspense(Home) },
      {
        path: "dashboard",
        element: <RequireAuth><Suspense fallback={<Loader />}><Dashboard /></Suspense></RequireAuth>
      },
      {
        path: "student/dashboard",
        element: <RequireAuth><Suspense fallback={<Loader />}><StudentDashboard /></Suspense></RequireAuth>
      },
      {
        path: "student/assignments",
        element: <RequireAuth><Suspense fallback={<Loader />}><StudentAssignments /></Suspense></RequireAuth>
      },
      {
        path: "courses/:courseKey/learn",
        element: <RequireAuth><Suspense fallback={<Loader />}><CourseLearningPage /></Suspense></RequireAuth>
      },
      {
        path: "instructor",
        children: [
          { 
            path: "dashboard", 
            element: <RequireAuth requireRole={2}>{withSuspense(InstructorDashboard)}</RequireAuth>
          },
          { 
            path: "courses/add", 
            element: <RequireAuth requireRole={2}>{withSuspense(AddCourse)}</RequireAuth>
          },
          { 
            path: "courses/edit/:courseId", 
            element: <RequireAuth requireRole={2}>{withSuspense(EditCourse)}</RequireAuth>
          },
          { 
            path: "courses/:courseId/content", 
            element: <RequireAuth requireRole={2}>{withSuspense(CourseContent)}</RequireAuth>
          },
          { 
            path: "courses/:courseId/students", 
            element: <RequireAuth requireRole={2}>{withSuspense(CourseStudents)}</RequireAuth>
          }
        ]
      },
      // Redirect for the instructor root path
      {
        path: "instructor",
        element: <Navigate to="/instructor/dashboard" replace />
      }
    ]
  },
  // Catch-all route - redirect to home
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);
