
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  FilePlus, 
  FileQuestion, 
  ClipboardList,
  MessageSquare,
  Users,
  ListOrdered,
  FileText,
  Bell,
  GraduationCap
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Define navigation items based on user role
  const getNavItems = () => {
    // Common items for all authenticated users
    const commonItems = [
      {
        title: "Dashboard",
        path: user?.role === 1 ? "/admin/dashboard" : 
              user?.role === 2 ? "/instructor/dashboard" : "/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />
      },
      {
        title: "Messages",
        path: "/messages",
        icon: <MessageSquare className="w-5 h-5" />
      }
    ];
    
    // Admin specific items
    const adminItems = [
      {
        title: "Categories",
        path: "/admin/categories",
        icon: <ListOrdered className="w-5 h-5" />
      },
      {
        title: "Users",
        path: "/admin/users",
        icon: <Users className="w-5 h-5" />
      },
      {
        title: "All Courses",
        path: "/admin/courses",
        icon: <BookOpen className="w-5 h-5" />
      }
    ];
    
    // Instructor specific items
    const instructorItems = [
      {
        title: "My Courses",
        path: "/instructor/dashboard",
        icon: <BookOpen className="w-5 h-5" />
      },
      {
        title: "Add Course",
        path: "/instructor/courses/add",
        icon: <FilePlus className="w-5 h-5" />
      },
      {
        title: "Announcements",
        path: "/instructor/announcements",
        icon: <Bell className="w-5 h-5" />
      },
      {
        title: "Quizzes",
        path: "/instructor/quizzes",
        icon: <FileQuestion className="w-5 h-5" />
      },
      {
        title: "Assignments",
        path: "/instructor/assignments",
        icon: <ClipboardList className="w-5 h-5" />
      },
      {
        title: "My Students",
        path: "/instructor/students",
        icon: <GraduationCap className="w-5 h-5" />
      }
    ];
    
    // Student specific items
    const studentItems = [
      {
        title: "My Courses",
        path: "/dashboard",
        icon: <BookOpen className="w-5 h-5" />
      },
      {
        title: "My Assignments",
        path: "/student/assignments",
        icon: <ClipboardList className="w-5 h-5" />
      },
      {
        title: "My Quizzes",
        path: "/student/quizzes",
        icon: <FileQuestion className="w-5 h-5" />
      },
      {
        title: "Notes",
        path: "/student/notes",
        icon: <FileText className="w-5 h-5" />
      }
    ];
    
    // Return items based on user role
    switch (user?.role) {
      case 1: // Admin
        return [...commonItems, ...adminItems];
      case 2: // Instructor
        return [...commonItems, ...instructorItems];
      default: // Student or other
        return [...commonItems, ...studentItems];
    }
  };
  
  const navItems = getNavItems();
  
  return (
    <aside className="bg-white border shadow-sm w-64 h-full min-h-screen">
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold text-primary mb-6">Dashboard</h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-gray-600 rounded-md hover:bg-gray-100 hover:text-primary transition-colors",
                location.pathname === item.path && "bg-gray-100 text-primary font-medium"
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
