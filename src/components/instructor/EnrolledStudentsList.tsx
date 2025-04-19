
import { useState, useEffect } from "react";
import { enrollmentAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EnrolledStudentsListProps {
  courseId: string;
}

export default function EnrolledStudentsList({ courseId }: EnrolledStudentsListProps) {
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

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No students enrolled</h3>
        <p className="mt-1 text-gray-500">
          There are no students enrolled in this course yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Enrolled Students ({enrollments.length})</h3>
      
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
                  
                  <div className="mt-2">
                    <span className="text-sm font-medium">Progress: </span>
                    <span className="text-sm">{enrollment.totalCompleted || "0%"}</span>
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
    </div>
  );
}
