
import { useState, useEffect } from 'react';
import { enrollmentAPI, userAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Student {
  _id: string;
  name: string;
  email: string;
  [key: string]: any;
}

interface Enrollment {
  _id: string;
  courseId: string | { _id: string };
  updatedBy: string | { _id: string };
  completedLectures?: string[];
  complete?: any[];
  createdAt: string;
  [key: string]: any;
}

export function useStudentEnrollments(courseId?: string) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!courseId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching enrollments for course:", courseId);
        // Get enrollments for this course
        const response = await enrollmentAPI.getEnrolledStudents(courseId);
        console.log("Enrollment response:", response);
        
        const enrollmentData = response.data?.data?.enrollments || [];
        console.log("Enrollment data:", enrollmentData);
        
        setEnrollments(enrollmentData);
        
        // Fetch student details for each enrollment
        if (enrollmentData.length > 0) {
          const studentIds = enrollmentData.map((enrollment: Enrollment) => {
            if (typeof enrollment.updatedBy === 'object' && enrollment.updatedBy !== null) {
              return enrollment.updatedBy._id;
            }
            return enrollment.updatedBy;
          }).filter(Boolean);
            
          console.log("Student IDs extracted:", studentIds);
          const uniqueIds = [...new Set(studentIds)];
          console.log("Unique student IDs:", uniqueIds);
          
          if (uniqueIds.length > 0) {
            const studentsData: Student[] = [];
            
            for (const studentId of uniqueIds) {
              try {
                // Ensure studentId is a string
                if (typeof studentId === 'string') {
                  console.log("Fetching user details for:", studentId);
                  const userResponse = await userAPI.getUserById(studentId);
                  console.log("User response:", userResponse);
                  
                  if (userResponse.data?.data?.user) {
                    studentsData.push(userResponse.data.data.user);
                  } else {
                    console.warn(`No user data for ID: ${studentId}`);
                  }
                }
              } catch (err) {
                console.error(`Failed to fetch student ${studentId}:`, err);
              }
            }
            
            console.log("Processed students data:", studentsData);
            setStudents(studentsData);
          }
        }
      } catch (err: any) {
        console.error("Error fetching student enrollments:", err);
        const errorMessage = err.response?.data?.message || "Failed to load enrolled students";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollments();
  }, [courseId, toast]);

  return { enrollments, students, isLoading, error };
}
