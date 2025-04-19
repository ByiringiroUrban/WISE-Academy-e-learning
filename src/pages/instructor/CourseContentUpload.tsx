
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { courseAPI, lectureAPI, fileAPI } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export default function CourseContentUpload() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Course state
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("lectures");
  
  // Lecture form state
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDescription, setLectureDescription] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceUploading, setResourceUploading] = useState(false);
  
  // Load course data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        const response = await courseAPI.getCourseDetails(courseId);
        setCourse(response.data.data.course);
      } catch (err: any) {
        console.error("Error fetching course:", err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to load course details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId, toast]);
  
  const handleVideoUpload = async () => {
    if (!videoFile) return null;
    
    try {
      setVideoUploading(true);
      console.log("Starting video upload");
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('type', '3'); // Type 3 for video files
      if (courseId) formData.append('courseId', courseId);
      
      const response = await fileAPI.uploadFile(formData);
      console.log("Video upload response:", response);
      
      // Check if response has the expected structure
      if (!response.data || !response.data.data || !response.data.data.file) {
        throw new Error("Invalid response format from file upload");
      }
      
      const videoId = response.data.data.file._id;
      console.log("Video uploaded with ID:", videoId);
      
      toast({
        title: "Success",
        description: "Video uploaded successfully"
      });
      
      return videoId;
    } catch (err: any) {
      console.error("Error uploading video:", err);
      toast({
        title: "Upload Failed",
        description: err.response?.data?.message || err.message || "Failed to upload video",
        variant: "destructive"
      });
      return null;
    } finally {
      setVideoUploading(false);
    }
  };
  
  const handleResourceUpload = async () => {
    if (!resourceFile) return null;
    
    try {
      setResourceUploading(true);
      console.log("Starting resource upload");
      
      // Create FormData for resource upload
      const formData = new FormData();
      formData.append('file', resourceFile);
      formData.append('type', '4'); // Type 4 for document files
      if (courseId) formData.append('courseId', courseId);
      
      const response = await fileAPI.uploadFile(formData);
      console.log("Resource upload response:", response);
      
      // Check if response has the expected structure
      if (!response.data || !response.data.data || !response.data.data.file) {
        throw new Error("Invalid response format from file upload");
      }
      
      const fileId = response.data.data.file._id;
      console.log("Resource uploaded with ID:", fileId);
      
      toast({
        title: "Success",
        description: "Resource file uploaded successfully"
      });
      
      // Add to resources list
      const newResource = {
        title: resourceFile.name,
        fileId,
        link: ""
      };
      
      setResources([...resources, newResource]);
      setResourceFile(null);
      
      return newResource;
    } catch (err: any) {
      console.error("Error uploading resource:", err);
      toast({
        title: "Upload Failed",
        description: err.response?.data?.message || err.message || "Failed to upload resource",
        variant: "destructive"
      });
      return null;
    } finally {
      setResourceUploading(false);
    }
  };
  
  const handleCreateLecture = async () => {
    try {
      if (!lectureTitle.trim()) {
        toast({
          title: "Error",
          description: "Lecture title is required",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Creating new lecture with title:", lectureTitle);
      
      // Upload video if selected
      let videoId = null;
      if (videoFile) {
        videoId = await handleVideoUpload();
        if (!videoId) {
          console.log("Video upload failed, stopping lecture creation");
          return; // Stop if video upload failed
        }
      }
      
      // Create lecture
      const lectureData = {
        title: lectureTitle,
        desc: lectureDescription,
        videoId,
        preview: isPreview,
        resources: resources,
      };
      
      console.log("Sending lecture data to API:", lectureData);
      const response = await lectureAPI.createLecture(lectureData);
      console.log("Lecture creation response:", response);
      
      // Make sure we have the correct response structure
      if (!response.data || !response.data.data || !response.data.data.lecture) {
        throw new Error("Invalid response format from lecture creation");
      }
      
      toast({
        title: "Success",
        description: "Lecture created successfully"
      });
      
      // Reset form
      setLectureTitle("");
      setLectureDescription("");
      setIsPreview(false);
      setVideoFile(null);
      setResources([]);
      
      // Add lecture to course section
      if (courseId && course && course.sections && course.sections.length > 0) {
        console.log("Adding lecture to course section");
        const updatedCourse = { ...course };
        const newLecture = response.data.data.lecture;
        
        // Add lecture to the first section (default behavior)
        if (!updatedCourse.sections[0].items) {
          updatedCourse.sections[0].items = [];
        }
        
        updatedCourse.sections[0].items.push({
          itemType: 1, // 1 for lecture
          lectureId: newLecture._id
        });
        
        // Update course with new lecture
        console.log("Updating course with new lecture:", updatedCourse.sections);
        await courseAPI.updateCourse(courseId, {
          sections: updatedCourse.sections
        });
        
        // Refresh course data
        const updatedResponse = await courseAPI.getCourseDetails(courseId);
        setCourse(updatedResponse.data.data.course);
        console.log("Course updated with new lecture");
      }
      
    } catch (err: any) {
      console.error("Error creating lecture:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to create lecture",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLecture = async (lectureId: string, sectionIndex: number, itemIndex: number) => {
    if (!courseId || !lectureId) return;
    
    try {
      console.log(`Deleting lecture ${lectureId} from section ${sectionIndex}, item ${itemIndex}`);
      
      // Delete lecture via API
      await lectureAPI.deleteLecture(lectureId);
      
      // Update course sections by removing the lecture
      if (course && course.sections) {
        const updatedCourse = { ...course };
        updatedCourse.sections[sectionIndex].items.splice(itemIndex, 1);
        
        // Update course with removed lecture
        await courseAPI.updateCourse(courseId, {
          sections: updatedCourse.sections
        });
        
        // Refresh course data
        const updatedResponse = await courseAPI.getCourseDetails(courseId);
        setCourse(updatedResponse.data.data.course);
        
        toast({
          title: "Success",
          description: "Lecture deleted successfully"
        });
        console.log("Lecture deleted successfully");
      }
    } catch (err: any) {
      console.error("Error deleting lecture:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to delete lecture",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
          <p className="ml-2">Loading course details...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">
          <h3 className="text-lg font-medium mb-2">Course not found</h3>
          <Button onClick={() => navigate("/instructor/courses")}>
            Back to Courses
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Course Content: {course.title}</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/instructor/courses/edit/${courseId}`)}>
            Edit Course Details
          </Button>
          <Button onClick={() => navigate("/instructor/courses")}>
            Back to Courses
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="lectures">Lectures & Videos</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lectures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Lecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="Lecture Title"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Textarea
                  placeholder="Lecture Description"
                  value={lectureDescription}
                  onChange={(e) => setLectureDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="preview"
                    checked={isPreview}
                    onCheckedChange={(checked) => setIsPreview(!!checked)}
                  />
                  <label
                    htmlFor="preview"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Make available as preview (free access)
                  </label>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="font-medium mb-2">Upload Video</h3>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
                {videoFile && (
                  <p className="mt-2 text-sm">Selected: {videoFile.name}</p>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="font-medium mb-2">Add Resources</h3>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                  />
                  <Button 
                    disabled={!resourceFile || resourceUploading} 
                    onClick={handleResourceUpload}
                  >
                    {resourceUploading ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    ) : "Add Resource"}
                  </Button>
                </div>
                
                {resources.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Added Resources:</h4>
                    <ul className="list-disc pl-5">
                      {resources.map((resource, index) => (
                        <li key={index} className="text-sm">
                          {resource.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleCreateLecture}
                  disabled={videoUploading || resourceUploading || !lectureTitle}
                >
                  {videoUploading ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : "Create Lecture"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Existing Lectures</CardTitle>
            </CardHeader>
            <CardContent>
              {course.sections?.map((section: any, sectionIndex: number) => (
                <div key={sectionIndex} className="mb-6">
                  <h3 className="font-medium text-lg mb-2">{section.title}</h3>
                  
                  {section.items?.filter((item: any) => item.itemType === 1).length > 0 ? (
                    <ul className="space-y-2">
                      {section.items
                        ?.filter((item: any) => item.itemType === 1)
                        .map((item: any, itemIndex: number) => (
                          <li key={itemIndex} className="flex justify-between p-3 bg-gray-50 rounded">
                            <span>{item.lectureId?.title || "Untitled Lecture"}</span>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigate(`/courses/${course.key}/lessons/${item.lectureId?._id}`)}
                              >
                                Preview
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500"
                                onClick={() => handleDeleteLecture(item.lectureId?._id, sectionIndex, itemIndex)}
                              >
                                Delete
                              </Button>
                            </div>
                          </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No lectures in this section</p>
                  )}
                </div>
              ))}
              
              {(!course.sections || course.sections.length === 0) && (
                <p className="text-center py-4 text-gray-500">
                  No course sections found. Please add sections to your course.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-4">
                Assignment management functionality will be added soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quizzes">
          <Card>
            <CardHeader>
              <CardTitle>Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-4">
                Quiz management functionality will be added soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
