
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { courseAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Loader2, FileCheck, BookOpen, BookmarkCheck, PenSquare } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalLectures: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch courses
        const coursesResponse = await courseAPI.getInstructorCourses();
        console.log("Instructor courses response:", coursesResponse);
        const coursesData = coursesResponse.data?.data?.courses || [];
        setCourses(coursesData);
        
        // Calculate stats
        const publishedCourses = coursesData.filter((course: any) => course.status === 2).length;
        const totalStudents = coursesData.reduce((acc: number, course: any) => 
          acc + (course.enrollments?.length || 0), 0
        );
        const totalLectures = coursesData.reduce((acc: number, course: any) => 
          acc + (course.lectures?.length || 0), 0
        );
        
        setStats({
          totalCourses: coursesData.length,
          publishedCourses: publishedCourses,
          totalStudents: totalStudents,
          totalLectures: totalLectures
        });
      } catch (error: any) {
        console.error("Error fetching instructor data:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructorData();
  }, [toast]);

  const publishCourse = async (courseId: string) => {
    try {
      const response = await courseAPI.publishCourse(courseId);
      console.log("Publish course response:", response);
      
      // Update local state to reflect the change
      setCourses(
        courses.map(course => 
          course._id === courseId ? { ...course, status: 2 } : course
        )
      );
      
      toast({
        title: "Success",
        description: "Course published successfully",
      });
    } catch (error: any) {
      console.error("Error publishing course:", error);
      toast({
        title: "Error", 
        description: error.response?.data?.message || "Failed to publish course",
        variant: "destructive",
      });
    }
  };

  // Helper function to determine if a course is published
  const isPublished = (course: any) => {
    return course.status === 2;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your courses, students, and content
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCourses}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.publishedCourses} published
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across all courses
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Lectures</CardTitle>
                  <BookmarkCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLectures}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across all courses
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">New Content</CardTitle>
                  <PenSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Link 
                      to="/instructor/courses/add" 
                      className="text-primary hover:underline"
                    >
                      Create
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add a new course
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Courses</CardTitle>
                <CardDescription>
                  Manage your existing courses or create new ones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="text-center py-6">
                    <h3 className="text-lg font-medium">No courses yet</h3>
                    <p className="mt-1 text-gray-500">
                      Create your first course to get started
                    </p>
                    <Button 
                      className="mt-4"
                      asChild
                    >
                      <Link to="/instructor/courses/add">Create Course</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Title</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Students</th>
                          <th className="text-left py-3 px-4">Created</th>
                          <th className="text-center py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course) => (
                          <tr key={course._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{course.title}</td>
                            <td className="py-3 px-4">
                              {isPublished(course) ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Draft
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">{course.enrollments?.length || 0}</td>
                            <td className="py-3 px-4">{formatDate(course.createdAt)}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex gap-2 justify-center">
                                {!isPublished(course) && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => publishCourse(course._id)}
                                  >
                                    Publish
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  asChild
                                >
                                  <Link to={`/instructor/courses/${course._id}/edit`}>
                                    Edit
                                  </Link>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  asChild
                                >
                                  <Link to={`/instructor/courses/${course._id}/content`}>
                                    Content
                                  </Link>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
