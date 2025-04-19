
import { useState, useEffect } from "react";
import { enrollmentAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Calendar, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CourseStudentsListProps {
  courseId: string;
}

export default function CourseStudentsList({ courseId }: CourseStudentsListProps) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        console.log("Fetching enrolled students for course:", courseId);
        const response = await enrollmentAPI.getEnrolledStudents(courseId);
        console.log("Enrollment response:", response);
        
        // Extract enrollments data from response
        const enrollmentsData = response.data?.data?.enrollments || [];
        setEnrollments(enrollmentsData);
      } catch (error: any) {
        console.error("Error fetching enrolled students:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load enrolled students",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledStudents();
  }, [courseId, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Enrolled Students {enrollments.length > 0 && `(${enrollments.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {enrollments.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No students enrolled in this course yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {enrollments.map((enrollment) => (
              <div 
                key={enrollment._id} 
                className="flex items-start gap-3 p-3 border rounded-md hover:bg-gray-50"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  {enrollment.updatedBy?.name?.charAt(0) || "S"}
                </div>
                
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium truncate">{enrollment.updatedBy?.name || "Student"}</h4>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{enrollment.updatedBy?.email || "No email"}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>Enrolled: {formatDate(enrollment.createdAt)}</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => window.location.href = `mailto:${enrollment.updatedBy?.email}`}
                >
                  Contact
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
