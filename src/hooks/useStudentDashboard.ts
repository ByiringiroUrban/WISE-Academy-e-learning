
import { useState, useEffect } from 'react';
import { enrollmentAPI, courseAPI, announcementAPI, assignmentAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

export function useStudentDashboard() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courseData, setCourseData] = useState<Record<string, any>>({});
  const [latestAnnouncements, setLatestAnnouncements] = useState<any[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEnrollmentsAndCourses = async () => {
      setIsLoading(true);
      try {
        // Fetch all user enrollments
        const enrollmentsResponse = await enrollmentAPI.getUserEnrollments();
        console.log("Enrollments response:", enrollmentsResponse);
        const enrollmentsData = enrollmentsResponse.data?.data?.enrollments || [];
        setEnrollments(enrollmentsData);
        
        // Create arrays to collect announcements and assignments from all courses
        const allAnnouncements: any[] = [];
        const allAssignments: any[] = [];
        
        // Fetch course details for each enrollment
        const coursesMap: Record<string, any> = {};
        
        for (const enrollment of enrollmentsData) {
          const courseId = typeof enrollment.courseId === 'object' 
            ? enrollment.courseId._id 
            : enrollment.courseId;
            
          if (courseId && !coursesMap[courseId]) {
            try {
              // Fetch detailed course information including sections and materials
              const courseResponse = await enrollmentAPI.getEnrollmentDetail(enrollment._id);
              console.log("Course detail response:", courseResponse);
              const courseDetail = courseResponse.data?.data;
              
              if (courseDetail) {
                // Extract and organize course data
                const courseInfo = courseDetail.course;
                const completedItems = courseDetail.complete || [];
                
                // Calculate progress
                let totalLectures = 0;
                const sectionData: any[] = [];
                
                // Process sections to extract lectures, assignments, quizzes
                if (courseInfo && courseInfo.sections) {
                  courseInfo.sections.forEach((section: any) => {
                    const sectionItems: any[] = [];
                    
                    if (section.items) {
                      section.items.forEach((item: any) => {
                        // Count lectures for progress calculation
                        if (item.lecture) {
                          totalLectures++;
                          
                          // Check if this lecture is completed
                          const isCompleted = completedItems.some((complete: any) => 
                            complete.lectureId === item.lectureId
                          );
                          
                          sectionItems.push({
                            ...item,
                            isCompleted,
                            type: 'lecture'
                          });
                        }
                        
                        // Process assignments
                        if (item.assignment) {
                          const assignmentData = {
                            ...item.assignment,
                            courseId,
                            courseTitle: courseInfo.title,
                            courseSlug: courseInfo.slug,
                            title: item.assignment.title,
                            dueDate: item.assignment.dueDate 
                              ? formatDate(item.assignment.dueDate)
                              : 'No due date',
                            type: 'assignment'
                          };
                          
                          sectionItems.push({
                            ...item,
                            type: 'assignment'
                          });
                          
                          allAssignments.push(assignmentData);
                        }
                        
                        // Process quizzes
                        if (item.quiz) {
                          sectionItems.push({
                            ...item,
                            type: 'quiz'
                          });
                        }
                      });
                    }
                    
                    sectionData.push({
                      ...section,
                      items: sectionItems
                    });
                  });
                }
                
                // Calculate progress percentage
                const completedLectures = completedItems.length;
                const progress = totalLectures > 0 
                  ? Math.round((completedLectures / totalLectures) * 100) 
                  : 0;
                
                // Try to fetch course announcements
                try {
                  const announcementsResponse = await announcementAPI.getCourseAnnouncements(courseId);
                  const announcements = announcementsResponse.data?.data?.announcements || [];
                  
                  // Add course info to each announcement and add to the full list
                  announcements.forEach((announcement: any) => {
                    allAnnouncements.push({
                      ...announcement,
                      courseId,
                      courseTitle: courseInfo.title,
                      courseSlug: courseInfo.slug
                    });
                  });
                } catch (err) {
                  console.error(`Failed to fetch announcements for course ${courseId}:`, err);
                }
                
                // Store complete course data
                coursesMap[courseId] = {
                  ...courseInfo,
                  enrollmentId: enrollment._id,
                  progress,
                  completedLectures,
                  totalLectures,
                  sections: sectionData
                };
              }
            } catch (err) {
              console.error(`Failed to fetch course ${courseId}:`, err);
            }
          }
        }
        
        setCourseData(coursesMap);
        
        // Sort announcements by date (newest first) and limit to recent ones
        const sortedAnnouncements = allAnnouncements.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5);
        
        setLatestAnnouncements(sortedAnnouncements);
        
        // Sort assignments by due date (upcoming first)
        const sortedAssignments = allAssignments.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }).slice(0, 5);
        
        setUpcomingAssignments(sortedAssignments);
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
    latestAnnouncements,
    upcomingAssignments,
    isLoading,
  };
}
