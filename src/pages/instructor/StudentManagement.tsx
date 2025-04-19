
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EnrolledStudentsList from "@/components/instructor/EnrolledStudentsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { courseAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StudentManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        setIsLoading(true);
        const response = await courseAPI.getInstructorCourses();
        console.log("Instructor courses response:", response);
        const coursesData = response.data?.data?.courses || [];
        setCourses(coursesData);
        
        // Set the first course as selected by default
        if (coursesData.length > 0) {
          setSelectedCourseId(coursesData[0]._id);
        }
      } catch (error: any) {
        console.error("Error fetching instructor courses:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load courses",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructorCourses();
  }, [toast]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Management</h2>
          <p className="text-muted-foreground">
            Manage students enrolled in your courses
          </p>
        </div>
        
        <Tabs defaultValue="enrolled">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enrolled">Enrolled Students</TabsTrigger>
            <TabsTrigger value="performance">Student Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enrolled">
            <Card>
              <CardHeader>
                <CardTitle>Students by Course</CardTitle>
                <CardDescription>
                  View and manage students enrolled in your courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading courses...</div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium">No courses found</h3>
                    <p className="mt-1 text-gray-500">
                      You don't have any courses yet. Create a course to get started.
                    </p>
                    <button
                      className="mt-4 inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                      onClick={() => navigate("/instructor/courses/add")}
                    >
                      Create Course
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium">Select Course</label>
                      <Select
                        value={selectedCourseId}
                        onValueChange={setSelectedCourseId}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course._id} value={course._id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedCourseId && <EnrolledStudentsList courseId={selectedCourseId} />}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Student Performance</CardTitle>
                <CardDescription>
                  Monitor student progress and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Coming soon: Student performance analytics</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
