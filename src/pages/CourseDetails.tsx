
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { courseAPI, reviewAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Award, 
  BarChart, 
  FileText, 
  MessageSquare,
  Star,
  PlayCircle
} from "lucide-react";
import CourseEnrollment from "@/components/CourseEnrollment";
import { formatDate } from "@/lib/utils";

export default function CourseDetails() {
  const { key } = useParams<{ key: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch course details
        const courseResponse = await courseAPI.getCourseByKey(key!);
        setCourse(courseResponse.data.data.course);
        
        // Fetch reviews
        const reviewResponse = await reviewAPI.getReviews({ courseId: courseResponse.data.data.course._id });
        setReviews(reviewResponse.data.data.reviews || []);
        
        // Check if user is enrolled
        if (user) {
          try {
            const enrollmentsResponse = await reviewAPI.getEnrollments();
            const enrolled = enrollmentsResponse.data.data.enrollments.some(
              (enrollment: any) => enrollment.courseId._id === courseResponse.data.data.course._id
            );
            setIsEnrolled(enrolled);
          } catch (err) {
            console.error("Error checking enrollment:", err);
          }
        }
        
      } catch (err: any) {
        console.error("Error fetching course details:", err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to load course details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [key, toast, user]);
  
  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <p>Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <p>Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-indigo-50 p-8 rounded-lg mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.subTitle}</p>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-500">
                <Star className="h-5 w-5 fill-yellow-400 stroke-yellow-400" />
                <span className="ml-1 font-semibold">{calculateAverageRating()}</span>
              </div>
              <span className="mx-2 text-gray-400">•</span>
              <span>{reviews.length} reviews</span>
              <span className="mx-2 text-gray-400">•</span>
              <span>{course.totalEnrollment || 0} students</span>
            </div>
            
            <div className="mb-4">
              <span>Created by {course.updatedBy?.name || "Instructor"}</span>
              <span className="mx-2 text-gray-400">•</span>
              <span>Last updated {formatDate(course.updatedAt)}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {course.categoryId && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {course.categoryId.title}
                </span>
              )}
              {course.subCategoryId && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                  {course.subCategoryId.title}
                </span>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="aspect-video bg-gray-200 rounded mb-4"></div>
              
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-1">
                  {course.paid ? (
                    <>
                      {course.price?.currency || "$"}{course.price?.amount || 0}
                    </>
                  ) : (
                    "Free"
                  )}
                </h2>
              </div>
              
              <CourseEnrollment 
                courseId={course._id} 
                courseKey={course.slug}
                coursePaid={course.paid} 
                price={course.price}
                isEnrolled={isEnrolled}
                onSuccess={() => setIsEnrolled(true)}
              />
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">This course includes:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{course.totalHours || 0} hours of content</span>
                  </li>
                  <li className="flex items-center">
                    <PlayCircle className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{course.totalLecture || 0} lectures</span>
                  </li>
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Downloadable resources</span>
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Certificate of completion</span>
                  </li>
                  <li className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Progress tracking</span>
                  </li>
                  <li className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Q&A support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Content Tabs */}
      <div>
        <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Course Description</h2>
              <div className="prose max-w-none">
                <p>{course.desc || "No description available."}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.whatYouWillLearn ? (
                  course.whatYouWillLearn.map((item: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <div className="mt-1 mr-2 text-green-500">✓</div>
                      <span>{item}</span>
                    </div>
                  ))
                ) : (
                  <p>No learning objectives have been specified for this course.</p>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <ul className="list-disc pl-5 space-y-2">
                {course.requirements ? (
                  course.requirements.map((req: string, index: number) => (
                    <li key={index}>{req}</li>
                  ))
                ) : (
                  <li>No prerequisites for this course.</li>
                )}
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="curriculum" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Course Content</h2>
              <div className="text-sm text-gray-600 mb-4">
                {course.totalSection || 0} sections • {course.totalLecture || 0} lectures • {course.totalHours || 0} total hours
              </div>
              
              {course.sections && course.sections.length > 0 ? (
                <div className="space-y-4">
                  {course.sections.map((section: any, index: number) => (
                    <div key={section._id} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 flex justify-between items-center">
                        <h3 className="font-semibold">
                          Section {index + 1}: {section.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {section.lectures?.length || 0} lectures
                        </span>
                      </div>
                      <div className="divide-y">
                        {section.lectures?.map((lecture: any) => (
                          <div key={lecture._id} className="p-4 flex justify-between items-center">
                            <div className="flex items-center">
                              <PlayCircle className="h-5 w-5 mr-2 text-gray-400" />
                              <span>{lecture.title}</span>
                              {lecture.preview && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  Preview
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {lecture.video?.timeLength ? `${Math.floor(lecture.video.timeLength / 60)}:${String(lecture.video.timeLength % 60).padStart(2, '0')}` : '00:00'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No curriculum has been added to this course yet.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Student Reviews</h2>
                {isEnrolled && (
                  <Button variant="outline" asChild>
                    <a href={`/courses/${course.slug}/review`}>Write a Review</a>
                  </Button>
                )}
              </div>
              
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold mr-3">
                          {review.updatedBy?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium">{review.updatedBy?.name || "Student"}</p>
                          <div className="flex items-center">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-300"}`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-2">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p>{review.desc}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No reviews yet. Be the first to review this course!</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
