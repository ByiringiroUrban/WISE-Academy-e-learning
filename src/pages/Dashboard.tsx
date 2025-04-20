
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import StudentDashboard from "./student/StudentDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is an instructor, redirect to instructor dashboard
    if (user && user.role === 2) {
      navigate('/instructor/dashboard');
    }
    
    // If user is an admin, redirect to admin dashboard
    if (user && user.role === 1) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  // If no user or loading, show a placeholder
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  // Student role (3)
  if (user.role === 3) {
    return <StudentDashboard />;
  }

  // Default case - shouldn't happen due to redirects
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="text-center py-8">
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
