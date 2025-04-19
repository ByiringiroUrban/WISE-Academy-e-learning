import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEnrollments } from "@/hooks/useEnrollments";
import { BarChart, Loader2 } from "lucide-react";
import { EnrolledCoursesList } from "@/components/student/EnrolledCoursesList";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("courses");
  const { enrolledCourses, isLoading } = useEnrollments();

  const getStudentContent = () => {
    return (
      <div className="space-y-6">
        {/* Featured courses section */}
        <section>
          <h3 className="text-lg font-medium mb-4">Continue Learning</h3>
          <EnrolledCoursesList 
            courses={enrolledCourses} 
            isLoading={isLoading} 
          />
        </section>

        {/* Tabs for courses and assignments */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>My Enrolled Courses</CardTitle>
                <CardDescription>View all courses you're currently taking</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Loading your courses...</span>
                  </div>
                ) : enrolledCourses.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledCourses.map(({ course, enrollment }) => (
                      <div key={enrollment._id} className="flex flex-col md:flex-row justify-between border rounded-lg p-4">
                        <div className="space-y-1">
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-gray-500">{course.subTitle || course.subtitle || "No description"}</p>
                        </div>
                        <div className="flex flex-col md:items-end justify-between mt-4 md:mt-0">
                          <Button 
                            className="mt-2" 
                            onClick={() => navigate(`/courses/${course.key || course.slug}/learn`)}
                          >
                            Continue
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => navigate('/courses')}
                    >
                      Browse Courses
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assignments" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>My Assignments</CardTitle>
                <CardDescription>View and manage your course assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/student/assignments')}
                  >
                    View All Assignments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const getInstructorContent = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium mb-4">Instructor Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer" onClick={() => navigate("/instructor/courses/add")}>
            <CardHeader>
              <CardTitle className="text-lg">Add New Course</CardTitle>
              <CardDescription>Create and publish new content</CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer" onClick={() => navigate("/instructor/students")}>
            <CardHeader>
              <CardTitle className="text-lg">Manage Students</CardTitle>
              <CardDescription>View students enrolled in your courses</CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer" onClick={() => navigate("/instructor/assignments")}>
            <CardHeader>
              <CardTitle className="text-lg">Assignments</CardTitle>
              <CardDescription>Create and manage assignments</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Recent activity in your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <BarChart className="h-12 w-12 text-gray-300" />
              <p className="ml-4 text-gray-500">Analytics dashboard coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const getAdminContent = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium mb-4">Admin Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer" onClick={() => navigate("/admin/users")}>
            <CardHeader>
              <CardTitle className="text-lg">Manage Users</CardTitle>
              <CardDescription>View and manage all system users</CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer" onClick={() => navigate("/admin/courses")}>
            <CardHeader>
              <CardTitle className="text-lg">Manage Courses</CardTitle>
              <CardDescription>View and manage all courses</CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer" onClick={() => navigate("/admin/categories")}>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
              <CardDescription>Manage course categories</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Monitor system performance and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <BarChart className="h-12 w-12 text-gray-300" />
              <p className="ml-4 text-gray-500">Analytics dashboard coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Decide which content to show based on user role
  const getDashboardContent = () => {
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
      return getStudentContent();
    }
    
    // Instructor role (2)
    if (user.role === 2) {
      return getInstructorContent();
    }
    
    // Admin role (1)
    if (user.role === 1) {
      return getAdminContent();
    }

    // Default case (shouldn't happen)
    return (
      <div className="text-center py-8">
        <p>Unsupported user role.</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {getDashboardContent()}
    </div>
  );
}
