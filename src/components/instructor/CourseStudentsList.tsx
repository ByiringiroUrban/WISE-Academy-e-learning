import { useState, useEffect } from "react";
import { enrollmentAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Mail, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Enrolled Students {enrollments.length > 0 && `(${enrollments.length})`}
        </h3>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-md">
          <p className="text-gray-500">No students enrolled in this course yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {enrollments.map((enrollment) => (
            <Card key={enrollment._id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    {enrollment.updatedBy?.name?.charAt(0) || "S"}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{enrollment.updatedBy?.name || "Student"}</h4>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Mail className="h-4 w-4 mr-1" />
                      {enrollment.updatedBy?.email || "No email provided"}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      Enrolled: {formatDate(enrollment.createdAt)}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
