
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { 
  User, 
  LogOut
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Helper function to determine dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    
    switch (user.role) {
      case 1: // Admin
        return "/admin/dashboard";
      case 2: // Instructor
        return "/instructor/dashboard";
      case 3: // Student
      default:
        return "/dashboard";
    }
  };

  return (
    <header className="bg-blue-950 border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
          <img src="/dist/assets/favicon.png" alt="Logo" className="h-8 w-auto" />
          <span className="text-xl font-bold text-primary hidden sm:inline">E-Learning</span>
           </Link>
            <nav className="ml-10 space-x-6 hidden md:flex">
              <Link to="/" className="text-gray-400 hover:text-primary">
                Home
              </Link>
              <Link to="/courses" className="text-gray-400 hover:text-primary">
                Courses
              </Link>
              {isAuthenticated && (
                <Link to={getDashboardLink()} className="text-gray-400 hover:text-primary">
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-400700">Welcome, {user?.name}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {user?.role === 1 ? 'Admin' : user?.role === 2 ? 'Instructor' : 'Student'}
                </span>
                <Separator orientation="vertical" className="h-6" />
                <Link to="/profile">
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
