
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BellIcon, BookOpen, Clock, MessageSquare, HelpCircle } from "lucide-react";
import { EnrolledCoursesList } from "@/components/student/EnrolledCoursesList";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import FAQAccordion from "@/components/student/FAQAccordion";

export default function StudentDashboard() {
  const { enrolledCourses, isLoading } = useStudentDashboard();
  const [activeTab, setActiveTab] = useState("courses");
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area - 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Alert className="border-l-4 border-blue-500">
              <BellIcon className="h-4 w-4 text-blue-500" />
              <AlertTitle>New Course Updates</AlertTitle>
              <AlertDescription>
                Check your enrolled courses for new content!
              </AlertDescription>
            </Alert>
            <Alert className="border-l-4 border-green-500">
              <MessageSquare className="h-4 w-4 text-green-500" />
              <AlertTitle>Instructor Feedback</AlertTitle>
              <AlertDescription>
                You have new messages from your instructors.
              </AlertDescription>
            </Alert>
          </div>
          
          {/* Continue learning section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
            <EnrolledCoursesList 
              courses={enrolledCourses.slice(0, 3)} 
              isLoading={isLoading} 
            />
          </section>
          
          {/* Tabs for courses, assignments, etc. */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Enrolled Courses</CardTitle>
                  <CardDescription>
                    View all courses you're currently taking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EnrolledCoursesList 
                    courses={enrolledCourses} 
                    isLoading={isLoading} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="assignments" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Assignments</CardTitle>
                  <CardDescription>Track your pending and completed assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-4">View all your assignments from enrolled courses</p>
                    <Button onClick={() => navigate('/student/assignments')}>
                      View Assignments
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="quizzes" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Quizzes</CardTitle>
                  <CardDescription>Test your knowledge with quizzes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-4">Access quizzes from your enrolled courses</p>
                    <Button variant="outline">
                      View All Quizzes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar area - 1/3 width on large screens */}
        <div className="space-y-6">
          {/* Progress summary */}
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Courses Enrolled</span>
                  <span>{enrolledCourses.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed Courses</span>
                  <span>0/{enrolledCourses.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Assignments Due</span>
                  <span>0</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/courses')}
              >
                Browse More Courses
              </Button>
            </CardContent>
          </Card>
          
          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FAQAccordion />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
