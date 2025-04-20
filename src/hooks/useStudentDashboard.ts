
import { useState, useEffect } from 'react';
import { enrollmentAPI, courseAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useStudentDashboard() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courseData, setCourseData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEnrollmentsAndCourses = async () => {
      setIsLoading(true);
      try {
        // Fetch all user enrollments
        const enrollmentsResponse = await enrollmentAPI.getUserEnrollments();
        const enrollmentsData = enrollmentsResponse.data?.data?.enrollments || [];
        setEnrollments(enrollmentsData);
        
        // Fetch course details for each enrollment
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
                const totalLectures = courseData.sections?.reduce(
                  (total: number, section: any) => total + (section.lectures?.length || 0), 0
                ) || 0;
                
                const completedLectures = enrollment.completedLectures?.length || 
                  (enrollment.complete ? enrollment.complete.length : 0);
                
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
      } catch (error: any) {
        console.error("Error fetching enrollments:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load your courses",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollmentsAndCourses();
  }, [toast]);

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
    enrolledCourses,
    isLoading,
  };
}
