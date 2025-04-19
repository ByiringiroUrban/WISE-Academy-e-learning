
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { announcementAPI, courseAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { Bell, Edit, Trash, MessageSquare } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AnnouncementManagement() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        const response = await courseAPI.getInstructorCourses();
        setCourses(response.data.data.courses || []);
        
        if (response.data.data.courses && response.data.data.courses.length > 0) {
          setSelectedCourse(response.data.data.courses[0]._id);
        } else {
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to load courses",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchInstructorCourses();
  }, [toast]);
  
  useEffect(() => {
    if (!selectedCourse) return;
    
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        const response = await announcementAPI.getAnnouncements(selectedCourse);
        setAnnouncements(response.data.data.announcements || []);
      } catch (err: any) {
        console.error("Error fetching announcements:", err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to load announcements",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, [selectedCourse, toast]);
  
  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
  };
  
  const handleAddAnnouncement = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Announcement title is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingId) {
        // Update existing announcement
        await announcementAPI.updateAnnouncement(editingId, {
          title,
          desc: description,
          courseId: selectedCourse
        });
        
        toast({
          title: "Success",
          description: "Announcement updated successfully",
        });
      } else {
        // Create new announcement
        await announcementAPI.createAnnouncement({
          title,
          desc: description,
          courseId: selectedCourse
        });
        
        toast({
          title: "Success",
          description: "Announcement created successfully",
        });
      }
      
      // Reset form
      setTitle("");
      setDescription("");
      setEditingId(null);
      setIsAddDialogOpen(false);
      
      // Refresh announcements
      const response = await announcementAPI.getAnnouncements(selectedCourse);
      setAnnouncements(response.data.data.announcements || []);
      
    } catch (err: any) {
      console.error("Error saving announcement:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save announcement",
        variant: "destructive",
      });
    }
  };
  
  const handleEdit = (announcement: any) => {
    setTitle(announcement.title);
    setDescription(announcement.desc || "");
    setEditingId(announcement._id);
    setIsAddDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) {
      return;
    }
    
    try {
      await announcementAPI.deleteAnnouncement(id);
      
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      
      // Remove from list
      setAnnouncements(announcements.filter(a => a._id !== id));
      
    } catch (err: any) {
      console.error("Error deleting announcement:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };
  
  // Filter announcements based on tab
  const filteredAnnouncements = activeTab === "all" 
    ? announcements 
    : announcements.filter(a => {
        const hasComments = a.comments && a.comments.length > 0;
        return activeTab === "withComments" ? hasComments : !hasComments;
      });
  
  const selectedCourseData = courses.find(course => course._id === selectedCourse);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">Announcements</h1>
      <p className="text-gray-600 mb-6">Manage announcements for your courses</p>
      
      {courses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">You don't have any courses yet</h3>
              <p className="text-gray-600 mb-4">Create a course to start making announcements</p>
              <Button asChild>
                <a href="/instructor/courses/add">Create Your First Course</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-1/3">
              <Select 
                value={selectedCourse} 
                onValueChange={handleCourseChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Bell className="w-4 h-4 mr-2" />
                  {editingId ? "Edit Announcement" : "Add Announcement"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Announcement" : "New Announcement"}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Announcement Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter announcement title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter announcement details"
                      className="min-h-[120px]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  
                  {selectedCourseData && (
                    <p className="text-sm text-gray-500">
                      This announcement will be posted to: <strong>{selectedCourseData.title}</strong>
                    </p>
                  )}
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="button" onClick={handleAddAnnouncement}>
                    {editingId ? "Update" : "Post"} Announcement
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4 w-full sm:w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="withComments">With Comments</TabsTrigger>
              <TabsTrigger value="withoutComments">No Comments</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedCourseData ? `Announcements for: ${selectedCourseData.title}` : 'Select a course'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <p>Loading announcements...</p>
                    </div>
                  ) : filteredAnnouncements.length === 0 ? (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium">No announcements yet</h3>
                      <p className="text-gray-500 mt-2">Create your first announcement to inform your students</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredAnnouncements.map((announcement) => (
                        <div key={announcement._id} className="border rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <div className="mb-4 sm:mb-0">
                              <h3 className="font-semibold text-lg">{announcement.title}</h3>
                              <p className="text-sm text-gray-500 mb-2">
                                Posted on {formatDate(announcement.createdAt)}
                              </p>
                              
                              <p className="text-gray-700">{announcement.desc}</p>
                              
                              {announcement.comments && announcement.comments.length > 0 && (
                                <div className="mt-4 flex items-center text-sm text-gray-600">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  {announcement.comments.length} Comment{announcement.comments.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(announcement)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(announcement._id)}
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                          
                          {announcement.comments && announcement.comments.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="font-medium text-sm mb-2">Student Comments:</h4>
                              <div className="space-y-3">
                                {announcement.comments.map((comment: any) => (
                                  <div key={comment._id} className="bg-gray-50 rounded p-3">
                                    <div className="flex items-center text-sm mb-1">
                                      <span className="font-medium">{comment.updatedBy?.name || 'Student'}</span>
                                      <span className="mx-2 text-gray-400">•</span>
                                      <span className="text-gray-500">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p>{comment.title}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </DashboardLayout>
  );
}
