
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "@/lib/utils";

interface EnrolledCoursesListProps {
  courses: any[];
  isLoading: boolean;
}

export function EnrolledCoursesList({ courses, isLoading }: EnrolledCoursesListProps) {
  const navigate = useNavigate();
  const [expandedList, setExpandedList] = useState(false);
  
  const displayCourses = expandedList ? courses : courses.slice(0, 3);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="bg-gray-100 h-32"></CardHeader>
            <CardContent className="space-y-2 pt-4">
              <div className="h-5 bg-gray-100 rounded"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (courses.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => navigate('/courses')}
        >
          Browse Courses
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayCourses.map(({ course, enrollment }) => (
          <Card key={enrollment._id} className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.subTitle || course.subtitle || "No description"}
              </p>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} />
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{course.completedLectures || 0} / {course.totalLectures || 0} lectures</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {enrollment.updatedAt ? 
                        `Updated ${formatDistanceToNow(new Date(enrollment.updatedAt))}` : 
                        "Recently enrolled"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => navigate(`/courses/${course.key || course.slug}/learn`)}
              >
                Continue Learning
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {courses.length > 3 && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => setExpandedList(!expandedList)}
          >
            {expandedList ? "Show Less" : `Show All (${courses.length})`}
          </Button>
        </div>
      )}
    </div>
  );
}
