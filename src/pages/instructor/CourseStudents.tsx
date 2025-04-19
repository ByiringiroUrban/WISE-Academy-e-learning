
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { courseAPI, enrollmentAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import CourseStudentsList from "@/components/instructor/CourseStudentsList";
import { formatDate } from "@/lib/utils";

export default function CourseStudents() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        
        // Get course details
        const courseResponse = await courseAPI.getCourseDetails(courseId);
        console.log("Course details response:", courseResponse);
        setCourse(courseResponse.data?.data?.course || null);
      } catch (error: any) {
        console.error("Error fetching course details:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load course details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, toast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium">Course not found</h3>
          <p className="mt-1 text-gray-500">
            The course you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/instructor/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link to="/instructor/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">{course.title}</h2>
            <p className="text-muted-foreground">
              Course created on {formatDate(course.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to={`/instructor/courses/${courseId}/content`}>
                Manage Content
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center border-b">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Students Enrolled
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <CourseStudentsList courseId={courseId} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
