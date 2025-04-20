import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  FileText, 
  MessageSquare, 
  Video, 
  CheckCircle,
  Info,
  ChevronRight
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { enrollmentAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function CourseLearningPage() {
  const { courseKey } = useParams<{ courseKey: string }>();
  const { verified } = useRequireAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<any>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("curriculum");
  const [activeLecture, setActiveLecture] = useState<string | null>(null);
  const [completedLectures, setCompletedLectures] = useState<string[]>([]);

  useEffect(() => {
    if (!verified || !courseKey) return;

    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        // First get all user enrollments to find the enrollment for this course
        const enrollmentsResponse = await enrollmentAPI.getUserEnrollments();
        const enrollments = enrollmentsResponse.data?.data?.enrollments || [];
        
        let foundEnrollmentId = null;
        
        // Find the enrollment for this course
        for (const enrollment of enrollments) {
          // Handle both object and string courseId
          const enrollmentCourseId = typeof enrollment.courseId === 'object' 
            ? enrollment.courseId._id 
            : enrollment.courseId;
          
          const enrollmentCourseSlug = typeof enrollment.courseId === 'object' 
            ? enrollment.courseId.slug 
            : '';
            
          // Match by either ID or slug
          if (enrollmentCourseId === courseKey || enrollmentCourseSlug === courseKey) {
            foundEnrollmentId = enrollment._id;
            break;
          }
        }
        
        if (!foundEnrollmentId) {
          toast({
            title: "Not enrolled",
            description: "You are not enrolled in this course",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        // Store the enrollment ID
        setEnrollmentId(foundEnrollmentId);
        
        // Now fetch the detailed enrollment data which includes all course materials
        const response = await enrollmentAPI.getEnrollmentDetail(foundEnrollmentId);
        const data = response.data?.data;
        
        if (!data) throw new Error("Failed to load course data");
        
        console.log("Course learning data:", data);
        setCourseData(data);
        
        // Extract completed lectures
        const completed = data.complete || [];
        setCompletedLectures(completed.map((item: any) => item.lectureId));
        
        // Set first lecture as active if none is selected
        if (data.course && data.course.sections) {
          for (const section of data.course.sections) {
            if (section.items && section.items.length > 0) {
              for (const item of section.items) {
                if (item.lectureId) {
                  setActiveLecture(item.lectureId);
                  break;
                }
              }
              if (activeLecture) break;
            }
          }
        }
      } catch (error: any) {
        console.error("Error fetching course data:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load course content",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [verified, courseKey, navigate, toast]);

  const markLectureComplete = async (lectureId: string) => {
    if (!enrollmentId) return;
    
    try {
      await enrollmentAPI.completeLecture(enrollmentId, lectureId);
      
      // Update the local state
      setCompletedLectures(prev => {
        if (prev.includes(lectureId)) return prev;
        return [...prev, lectureId];
      });
      
      toast({
        title: "Progress updated",
        description: "Lecture marked as complete"
      });
    } catch (error: any) {
      console.error("Error marking lecture as complete:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update progress",
        variant: "destructive"
      });
    }
  };

  // Function to show the current lecture content
  const renderLectureContent = () => {
    if (!courseData || !activeLecture) return null;
    
    // Find the active lecture in course data
    let activeLectureData = null;
    
    for (const section of courseData.course.sections) {
      for (const item of section.items) {
        if (item.lectureId === activeLecture && item.lecture) {
          activeLectureData = item.lecture;
          break;
        }
      }
      if (activeLectureData) break;
    }
    
    if (!activeLectureData) {
      return (
        <div className="text-center py-10">
          <Info className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Select a lecture to view its content</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-md">
          <h2 className="text-xl font-bold mb-2">{activeLectureData.title}</h2>
          {activeLectureData.desc && (
            <div className="prose prose-sm max-w-none" 
              dangerouslySetInnerHTML={{ __html: activeLectureData.desc }} 
            />
          )}
        </div>
        
        {activeLectureData.video && activeLectureData.video.path && (
          <div className="aspect-video bg-black rounded-md flex items-center justify-center">
            <video 
              src={activeLectureData.video.path} 
              controls 
              className="w-full h-full rounded-md"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        
        {/* Resources */}
        {activeLectureData.resources && activeLectureData.resources.length > 0 && (
          <div className="border rounded-md p-4">
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2">
              {activeLectureData.resources.map((resource: any, index: number) => (
                <li key={index} className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  <a 
                    href={resource.file?.path || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {resource.title || `Resource ${index + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Mark as complete button */}
        <div className="flex justify-end">
          <Button 
            onClick={() => markLectureComplete(activeLecture)}
            disabled={completedLectures.includes(activeLecture)}
            className="flex items-center gap-2"
          >
            {completedLectures.includes(activeLecture) ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Completed
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Mark as Complete
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  if (!verified) {
    return null; // The hook will handle redirection
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading course content...</span>
      </div>
    );
  }

  if (!courseData || !courseData.course) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-8 bg-red-50 rounded-lg">
          <p className="text-red-600 mb-4">Failed to load course data</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Calculate progress
  const totalLectures = courseData.course.sections.reduce(
    (total: number, section: any) => total + (
      section.items.filter((item: any) => item.lectureId).length
    ), 0
  );
  
  const progressPercentage = totalLectures > 0
    ? Math.round((completedLectures.length / totalLectures) * 100)
    : 0;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{courseData.course.title}</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Course content sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>{completedLectures.length} of {totalLectures} completed</span>
                  <span>{progressPercentage}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 py-3">
              <CardTitle className="text-lg">Course Content</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {courseData.course.sections.map((section: any, sectionIndex: number) => (
                  <AccordionItem key={section._id || sectionIndex} value={`section-${sectionIndex}`}>
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                      <div className="text-left">
                        <p className="font-medium">{section.title}</p>
                        <p className="text-xs text-gray-500">
                          {section.items.length} {section.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 py-0">
                      <ul className="divide-y">
                        {section.items.map((item: any, itemIndex: number) => {
                          let icon;
                          let title = "";
                          let itemId = "";
                          let isCompleted = false;
                          
                          if (item.lectureId && item.lecture) {
                            icon = <Video className="h-4 w-4" />;
                            title = item.lecture.title;
                            itemId = item.lectureId;
                            isCompleted = completedLectures.includes(item.lectureId);
                          } else if (item.quizId && item.quiz) {
                            icon = <MessageSquare className="h-4 w-4" />;
                            title = item.quiz.title;
                            itemId = item.quizId;
                          } else if (item.assignmentId && item.assignment) {
                            icon = <FileText className="h-4 w-4" />;
                            title = item.assignment.title;
                            itemId = item.assignmentId;
                          } else {
                            return null; // Skip invalid items
                          }
                          
                          const isActive = itemId === activeLecture;
                          
                          return (
                            <li 
                              key={itemId || itemIndex}
                              className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                                isActive ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => setActiveLecture(itemId)}
                            >
                              <div className="flex items-center gap-2">
                                {icon}
                                <span className="text-sm">{title}</span>
                              </div>
                              <div className="flex items-center">
                                {isCompleted && (
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                )}
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curriculum">
              <Card>
                <CardContent className="p-6">
                  {renderLectureContent()}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="overview">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-bold mb-4">About This Course</h2>
                    {courseData.course.desc ? (
                      <div dangerouslySetInnerHTML={{ __html: courseData.course.desc }} />
                    ) : (
                      <p>No course description available.</p>
                    )}
                    
                    {courseData.course.whatWillLearn && courseData.course.whatWillLearn.length > 0 && (
                      <>
                        <h3 className="text-lg font-semibold mt-6 mb-3">What You'll Learn</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {courseData.course.whatWillLearn.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    
                    {courseData.course.prerequisites && courseData.course.prerequisites.length > 0 && (
                      <>
                        <h3 className="text-lg font-semibold mt-6 mb-3">Prerequisites</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {courseData.course.prerequisites.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="resources">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Course Resources</h2>
                  
                  {courseData.course.sections.some((section: any) => 
                    section.items.some((item: any) => 
                      item.lecture && item.lecture.resources && item.lecture.resources.length > 0
                    )
                  ) ? (
                    <div className="space-y-6">
                      {courseData.course.sections.map((section: any, sectionIndex: number) => {
                        // Only include sections that have resources
                        const sectionResources = section.items.filter((item: any) => 
                          item.lecture && item.lecture.resources && item.lecture.resources.length > 0
                        );
                        
                        if (sectionResources.length === 0) return null;
                        
                        return (
                          <div key={sectionIndex} className="border rounded-md p-4">
                            <h3 className="font-semibold mb-3">{section.title}</h3>
                            
                            <div className="space-y-4">
                              {sectionResources.map((item: any, itemIndex: number) => (
                                <div key={itemIndex} className="pl-4 border-l-2 border-gray-200">
                                  <h4 className="text-sm font-medium mb-2">{item.lecture.title}</h4>
                                  
                                  <ul className="space-y-2">
                                    {item.lecture.resources.map((resource: any, resourceIndex: number) => (
                                      <li key={resourceIndex} className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                        <a 
                                          href={resource.file?.path || "#"} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-500 hover:underline text-sm"
                                        >
                                          {resource.title || `Resource ${resourceIndex + 1}`}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No resources available for this course</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="announcements">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Course Announcements</h2>
                  
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No announcements available for this course</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
