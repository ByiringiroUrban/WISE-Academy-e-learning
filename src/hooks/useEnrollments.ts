
import { useState, useEffect } from 'react';
import { enrollmentAPI, courseAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useEnrollments(userId?: string, courseId?: string) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courseData, setCourseData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEnrollments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all user enrollments or enrollments for a specific course
        let enrollmentsResponse;
        if (courseId) {
          enrollmentsResponse = await enrollmentAPI.getEnrolledStudents(courseId);
        } else {
          enrollmentsResponse = await enrollmentAPI.getUserEnrollments();
        }
        
        console.log("Enrollments response:", enrollmentsResponse);
        const enrollmentsData = enrollmentsResponse.data?.data?.enrollments || [];
        setEnrollments(enrollmentsData);
        
        // If we have enrollments, fetch the corresponding course details
        if (enrollmentsData.length > 0) {
          const coursesMap: Record<string, any> = {};
          
          for (const enrollment of enrollmentsData) {
            const courseId = typeof enrollment.courseId === 'object' 
              ? enrollment.courseId._id 
              : enrollment.courseId;
              
            if (courseId && !coursesMap[courseId]) {
              try {
                const courseResponse = await courseAPI.getCourseDetails(courseId);
                const courseData = courseResponse.data?.data?.course;
                
                if (courseData) {
                  // Calculate progress
                  const completedLectures = enrollment.completedLectures?.length || 
                    (enrollment.complete ? enrollment.complete.length : 0);
                  
                  const totalLectures = courseData.sections?.reduce(
                    (total: number, section: any) => total + (section.lectures?.length || 0), 0
                  ) || 0;
                  
                  const progress = totalLectures > 0 
                    ? Math.round((completedLectures / totalLectures) * 100) 
                    : 0;
                  
                  coursesMap[courseId] = {
                    ...courseData,
                    enrollmentId: enrollment._id,
                    progress,
                    completedLectures,
                    totalLectures
                  };
                }
              } catch (err) {
                console.error(`Failed to fetch course ${courseId}:`, err);
              }
            }
          }
          
          setCourseData(coursesMap);
        }
      } catch (err: any) {
        console.error("Error fetching enrollments:", err);
        setError(err.response?.data?.message || "Failed to load enrollments");
        toast({
          title: "Error",
          description: "Failed to load enrollments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollments();
  }, [courseId, userId, toast]);

  // Map enrollments with course data
  const enrolledCourses = enrollments.map(enrollment => {
    const courseId = typeof enrollment.courseId === 'object' 
      ? enrollment.courseId._id 
      : enrollment.courseId;
      
    return {
      enrollment,
      course: courseData[courseId] || null
    };
  }).filter(item => item.course !== null);

  return {
    enrollments,
    enrolledCourses,
    isLoading,
    error
  };
}
