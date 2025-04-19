import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { courseAPI, enrollmentAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

export default function CourseLearn() {
  const { courseKey } = useParams<{ courseKey: string }>();
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [completedLectures, setCompletedLectures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      if (!courseKey || !user) return;
      
      setIsLoading(true);
      
      try {
        console.log("Fetching course data for:", courseKey);
        // Fetch course details
        const courseResponse = await courseAPI.getCourseByKey(courseKey);
        const courseData = courseResponse.data?.data?.course;
        
        if (!courseData) {
          toast({
            title: "Error",
            description: "Course not found",
            variant: "destructive",
          });
          return;
        }
        
        console.log("Course data retrieved:", courseData._id);
        setCourse(courseData);
        
        // Get user enrollments
        console.log("Fetching user enrollments");
        const enrollmentResponse = await enrollmentAPI.getUserEnrollments();
        const enrollmentsData = enrollmentResponse.data?.data?.enrollments || [];
        
        console.log("Enrollments retrieved:", enrollmentsData.length);
        
        // Find the enrollment for this course
        const courseEnrollment = enrollmentsData.find((enroll: any) => {
          const enrollCourseId = typeof enroll.courseId === 'object' 
            ? enroll.courseId._id 
            : enroll.courseId;
          
          return enrollCourseId === courseData._id;
        });
        
        if (!courseEnrollment) {
          console.log("No enrollment found for this course");
          toast({
            title: "Not Enrolled",
            description: "You are not enrolled in this course",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        console.log("Enrollment found:", courseEnrollment._id);
        setEnrollment(courseEnrollment);
        
        // Calculate progress
        const completedLectureIds = courseEnrollment.completedLectures || 
          (courseEnrollment.complete ? courseEnrollment.complete.map((item: any) => 
            typeof item === 'object' ? item.lectureId : item) : []);
        
        setCompletedLectures(completedLectureIds);
        
        const totalLectures = courseData.sections?.reduce(
          (total: number, section: any) => total + (section.lectures?.length || 0),
          0
        ) || 0;
        
        const progressPercentage = totalLectures > 0 
          ? Math.round((completedLectureIds.length / totalLectures) * 100) 
          : 0;
        
        console.log(`Progress: ${completedLectureIds.length}/${totalLectures} = ${progressPercentage}%`);
        setProgress(progressPercentage);
        
      } catch (error: any) {
        console.error("Error fetching course details:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load course content",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseAndEnrollment();
  }, [courseKey, user, toast]);

  const handleMarkLectureComplete = async (lectureId: string) => {
    if (!course?._id || !enrollment?._id) {
      console.error("Cannot mark lecture complete: Missing course or enrollment ID");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      console.log(`Marking lecture ${lectureId} as complete for enrollment ${enrollment._id}`);
      // Using completeLecture API call
      await enrollmentAPI.completeLecture(enrollment._id, lectureId);
      
      // Update completed lectures locally
      if (!completedLectures.includes(lectureId)) {
        const newCompletedLectures = [...completedLectures, lectureId];
        setCompletedLectures(newCompletedLectures);
        
        // Recalculate progress
        const totalLectures = course.sections?.reduce(
          (total: number, section: any) => total + (section.lectures?.length || 0),
          0
        ) || 0;
        
        const newProgress = totalLectures > 0 
          ? Math.round((newCompletedLectures.length / totalLectures) * 100) 
          : 0;
        
        setProgress(newProgress);
      }
      
      toast({
        title: "Success",
        description: "Lecture marked as complete",
      });
      
    } catch (error: any) {
      console.error("Error marking lecture as complete:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update progress",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading course content...</span>
      </div>
    );
  }

  if (!course) {
    return <div className="container mx-auto py-8">Course not found</div>;
  }

  if (!enrollment) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Not Enrolled</h1>
        <p>You are not enrolled in this course.</p>
        <Button 
          className="mt-4"
          onClick={() => window.location.href = `/courses/${courseKey}`}
        >
          Go to Course Page
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar - Course curriculum */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-card rounded-lg border shadow p-4">
            <h2 className="text-xl font-bold mb-4">Course Content</h2>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Your progress</span>
                <span>{progress}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="space-y-4">
              {course.sections?.map((section: any, sectionIndex: number) => (
                <div key={section._id || sectionIndex} className="border-b pb-4 last:border-0">
                  <h3 className="font-medium mb-2">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.lectures?.map((lecture: any) => {
                      const isCompleted = completedLectures.includes(lecture._id);
                      
                      return (
                        <li key={lecture._id} className="text-sm">
                          <div className="flex items-center justify-between p-2 rounded hover:bg-muted">
                            <a
                              href={`/courses/${courseKey}/lessons/${lecture._id}`}
                              className={`flex items-center ${
                                isCompleted ? 'text-green-600' : ''
                              }`}
                            >
                              <span className="mr-2">
                                {isCompleted ? '✓' : '•'}
                              </span>
                              <span>{lecture.title}</span>
                            </a>
                            {!isCompleted && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => handleMarkLectureComplete(lecture._id)}
                              >
                                {isUpdating ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    Updating...
                                  </>
                                ) : (
                                  'Mark Complete'
                                )}
                              </Button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="bg-card rounded-lg border shadow p-6">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-muted-foreground mb-6">{course.subtitle}</p>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Course Overview</h2>
              <p>{course.description}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Continue Learning</h2>
              
              {course.sections?.[0]?.lectures?.[0] ? (
                <div className="mb-4">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => window.location.href = `/courses/${courseKey}/lessons/${course.sections[0].lectures[0]._id}`}
                  >
                    {completedLectures.length > 0 ? 'Continue Learning' : 'Start Course'}
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">No lectures available in this course yet.</p>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Course Resources</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Assignments</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete assignments to test your knowledge
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = `/student/assignments`}
                  >
                    View Assignments
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Quizzes</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Test your understanding with quizzes
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Take Quizzes
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Discussion Forum</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ask questions and discuss with other students
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Join Discussion
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Take notes during lectures
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = `/notes`}
                  >
                    My Notes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
