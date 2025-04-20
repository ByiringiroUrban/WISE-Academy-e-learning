import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BellIcon, BookOpen, Clock, HelpCircle, FileText, CheckSquare } from "lucide-react";
import { EnrolledCoursesList } from "@/components/student/EnrolledCoursesList";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import FAQAccordion from "@/components/student/FAQAccordion";

export default function StudentDashboard() {
  const { enrolledCourses, isLoading, latestAnnouncements, upcomingAssignments } = useStudentDashboard();
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
              <AlertTitle>Course Updates</AlertTitle>
              <AlertDescription>
                {latestAnnouncements && latestAnnouncements.length > 0 
                  ? `You have ${latestAnnouncements.length} new announcement(s)` 
                  : "Check your enrolled courses for new content!"}
              </AlertDescription>
            </Alert>
            <Alert className="border-l-4 border-green-500">
              <CheckSquare className="h-4 w-4 text-green-500" />
              <AlertTitle>Assignments</AlertTitle>
              <AlertDescription>
                {upcomingAssignments && upcomingAssignments.length > 0
                  ? `You have ${upcomingAssignments.length} pending assignment(s)` 
                  : "You're all caught up with your assignments!"}
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
              <TabsTrigger value="materials">Course Materials</TabsTrigger>
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
                  {upcomingAssignments && upcomingAssignments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAssignments.map((assignment, index) => (
                        <div key={index} className="flex justify-between items-center p-4 border rounded-md">
                          <div>
                            <h3 className="font-medium">{assignment.title}</h3>
                            <p className="text-sm text-gray-500">Due: {assignment.dueDate}</p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => navigate(`/courses/${assignment.courseSlug}/learn`)}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 mb-4">View all your assignments from enrolled courses</p>
                      <Button onClick={() => navigate('/student/assignments')}>
                        View Assignments
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="materials" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Materials</CardTitle>
                  <CardDescription>Access lectures, quizzes, and resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enrolledCourses.length > 0 ? (
                      enrolledCourses.map(({ course }) => (
                        <div key={course?.key || course?.slug} className="border rounded-md p-4">
                          <h3 className="font-medium mb-2">{course?.title}</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <Button 
                              variant="outline" 
                              className="flex items-center gap-2"
                              onClick={() => navigate(`/courses/${course?.key || course?.slug}/learn`)}
                            >
                              <BookOpen className="h-4 w-4" /> Lectures
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex items-center gap-2"
                              onClick={() => navigate(`/courses/${course?.key || course?.slug}/quizzes`)}
                            >
                              <Clock className="h-4 w-4" /> Quizzes
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex items-center gap-2"
                              onClick={() => navigate(`/courses/${course?.key || course?.slug}/resources`)}
                            >
                              <FileText className="h-4 w-4" /> Resources
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex items-center gap-2"
                              onClick={() => navigate(`/courses/${course?.key || course?.slug}/announcements`)}
                            >
                              <BellIcon className="h-4 w-4" /> Announcements
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 mb-4">Enroll in courses to access learning materials</p>
                        <Button 
                          variant="outline" 
                          onClick={() => navigate('/courses')}
                        >
                          Browse Courses
                        </Button>
                      </div>
                    )}
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
                  <span>{enrolledCourses.filter(course => course.course?.progress === 100).length}/{enrolledCourses.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Assignments Due</span>
                  <span>{upcomingAssignments?.length || 0}</span>
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
