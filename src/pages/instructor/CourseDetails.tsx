import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Loader2, Edit, Book, Users, FileText } from "lucide-react";
import CourseStudentsList from "@/components/instructor/CourseStudentsList";
import CourseCoverUpload from "@/components/instructor/CourseCoverUpload";

export default function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnailId, setThumbnailId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("details");
  
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        
        // First check if the course exists
        const courseResponse = await courseAPI.getCourseDetails(courseId);
        const courseData = courseResponse.data?.data?.course || null;
        
        if (!courseData) {
          toast({
            title: "Error",
            description: "Course not found",
            variant: "destructive",
          });
          navigate("/instructor/dashboard");
          return;
        }
        
        setCourse(courseData);
        setThumbnailId(courseData.thumbnailId);
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
  }, [courseId, navigate, toast]);

  const handleImageUploaded = async (fileId: string) => {
    if (!courseId) return;
    
    try {
      // Update the course with the new thumbnail ID
      await courseAPI.updateCourse(courseId, { thumbnailId: fileId });
      
      setThumbnailId(fileId);
      
      toast({
        title: "Success",
        description: "Course cover image updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating course thumbnail:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update course thumbnail",
        variant: "destructive",
      });
    }
  };

  const handlePublishCourse = async () => {
    if (!courseId) return;
    
    try {
      await courseAPI.publishCourse(courseId);
      
      // Update the local state
      setCourse({
        ...course,
        status: 2 // Published status
      });
      
      toast({
        title: "Success",
        description: "Course published successfully",
      });
    } catch (error: any) {
      console.error("Error publishing course:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to publish course",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Course not found</h2>
          <p className="text-gray-500 mt-2">The course you're looking for doesn't exist or you don't have access.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate("/instructor/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{course.title}</h2>
            <p className="text-muted-foreground">
              {course.subTitle || "No subtitle provided"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {course.status !== 2 && course.status !== 3 && (
              <Button 
                onClick={handlePublishCourse}
                className="text-green-600 border-green-600 hover:bg-green-50"
                variant="outline"
              >
                Publish Course
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => navigate(`/instructor/courses/edit/${courseId}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Course
            </Button>
            <Button 
              onClick={() => navigate(`/instructor/courses/${courseId}/content`)}
            >
              Manage Content
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="details">
              <Book className="h-4 w-4 mr-2" />
              Course Details
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="h-4 w-4 mr-2" />
              Enrolled Students
            </TabsTrigger>
            <TabsTrigger value="content">
              <FileText className="h-4 w-4 mr-2" />
              Content Overview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>
                  View and update course details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <CourseCoverUpload 
                      onImageUploaded={handleImageUploaded}
                      initialImageId={thumbnailId}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <p className="mt-1">
                        {course.status === 0 && <span className="text-gray-700">Draft</span>}
                        {course.status === 1 && <span className="text-yellow-600">Under Review</span>}
                        {(course.status === 2 || course.status === 3) && <span className="text-green-600">Published</span>}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Created</h3>
                      <p className="mt-1">{formatDate(course.createdAt)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Category</h3>
                      <p className="mt-1">
                        {course.category?.title || "No category"} / {course.subCategory?.title || "No subcategory"}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Difficulty Level</h3>
                      <p className="mt-1">{course.level || "Not specified"}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 whitespace-pre-line">{course.desc || "No description provided"}</p>
                </div>
                
                {course.whatWillLearn && course.whatWillLearn.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">What Students Will Learn</h3>
                    <ul className="mt-1 list-disc pl-5">
                      {course.whatWillLearn.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="students">
            <CourseStudentsList courseId={courseId || ""} />
          </TabsContent>
          
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  Overview of lectures, quizzes, and assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {course.sections && course.sections.length > 0 ? (
                  <div className="space-y-6">
                    {course.sections.map((section: any, index: number) => (
                      <div key={index} className="border rounded-md p-4">
                        <h3 className="text-lg font-medium mb-2">{section.title}</h3>
                        {section.desc && <p className="text-sm text-gray-500 mb-4">{section.desc}</p>}
                        
                        {section.items && section.items.length > 0 ? (
                          <ul className="space-y-2">
                            {section.items.map((item: any, itemIndex: number) => (
                              <li key={itemIndex} className="flex items-center p-2 hover:bg-gray-50 rounded">
                                {item.itemType === 1 && (
                                  <Book className="h-4 w-4 mr-2 text-blue-500" />
                                )}
                                {item.itemType === 2 && (
                                  <FileText className="h-4 w-4 mr-2 text-green-500" />
                                )}
                                {item.itemType === 3 && (
                                  <FileText className="h-4 w-4 mr-2 text-orange-500" />
                                )}
                                <span>
                                  {item.lecture?.title || item.quiz?.title || item.assignment?.title || "Untitled Item"}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No content items in this section</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No content sections added to this course yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate(`/instructor/courses/${courseId}/content`)}
                    >
                      Add Course Content
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
