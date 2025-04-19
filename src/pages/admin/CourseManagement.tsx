
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function CourseManagement() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, [currentPage]);

  useEffect(() => {
    // Apply filters whenever search or filters change
    applyFilters();
  }, [courses, searchQuery, statusFilter, priceFilter]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await courseAPI.getAllCourses({
        page: currentPage,
        size: 10,
        admin: true // Indicator for backend to return all courses regardless of status
      });
      
      setCourses(response.data.data.courses || []);
      setTotalPages(response.data.data.totalPage || 1);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = [...courses];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(course => 
        course.title?.toLowerCase().includes(query) || 
        course.subTitle?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      const isPublished = statusFilter === "published";
      result = result.filter(course => course.isPublished === isPublished);
    }
    
    // Apply price filter
    if (priceFilter !== "all") {
      const isPaid = priceFilter === "paid";
      result = result.filter(course => course.paid === isPaid);
    }
    
    setFilteredCourses(result);
  };
  
  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }
    
    try {
      await courseAPI.deleteCourse(id);
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      fetchCourses(); // Refresh the list
    } catch (err: any) {
      console.error("Error deleting course:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete course",
        variant: "destructive",
      });
    }
  };
  
  const handleTogglePublish = async (course: any) => {
    try {
      if (course.isPublished) {
        // Logic to unpublish would go here if API supports it
        toast({
          title: "Info",
          description: "Unpublishing courses is not supported at this time",
        });
      } else {
        await courseAPI.publishCourse(course._id);
        toast({
          title: "Success",
          description: "Course published successfully",
        });
        fetchCourses(); // Refresh the list
      }
    } catch (err: any) {
      console.error("Error updating course status:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update course status",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground">
            View and manage all courses on the platform
          </p>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="free">Free</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Course List */}
        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No courses found</h3>
                <p className="text-gray-500 mt-2">Try changing your filters or search query</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map(course => (
                  <div key={course._id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 bg-gray-200 h-32 md:h-auto rounded mb-4 md:mb-0"></div>
                      
                      <div className="md:ml-6 flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                          <div>
                            <h3 className="text-xl font-semibold">{course.title}</h3>
                            <p className="text-sm text-gray-500">
                              By {course.updatedBy?.name || 'Unknown Instructor'}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                            <Badge variant={course.isPublished ? 'success' : 'secondary'}>
                              {course.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                            
                            <Badge variant={course.paid ? 'default' : 'outline'}>
                              {course.paid ? `$${course.price?.amount || 0}` : 'Free'}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{course.subTitle || 'No description available'}</p>
                        
                        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2 mb-4">
                          <span>Created: {formatDate(course.createdAt)}</span>
                          <span>Lectures: {course.totalLecture || 0}</span>
                          <span>Enrollments: {course.totalEnrollment || 0}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/courses/${course.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                          </Link>
                          
                          <Link to={`/admin/courses/edit/${course._id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleTogglePublish(course)}
                          >
                            {course.isPublished ? (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Publish
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteCourse(course._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
