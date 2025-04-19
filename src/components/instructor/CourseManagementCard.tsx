
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';
import { useState } from 'react';

interface CourseCardProps {
  course: {
    _id: string;
    title: string;
    key: string;
    status?: number;
    createdAt?: string;
    sections?: { title: string; items: any[] }[];
    thumbnailId?: string;
  };
  onPublish?: (courseId: string) => Promise<void>;
}

export default function CourseManagementCard({ course, onPublish }: CourseCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);

  const getStatusLabel = (status?: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="bg-gray-100">Draft</Badge>;
      case 1:
        return <Badge variant="outline" className="bg-yellow-100">Under Review</Badge>;
      case 2:
      case 3:
        return <Badge variant="outline" className="bg-green-100">Published</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100">Draft</Badge>;
    }
  };

  const getLectureCount = () => {
    if (!course.sections) return 0;
    
    return course.sections.reduce((count, section) => {
      if (!section.items) return count;
      return count + section.items.filter(item => item.itemType === 1).length;
    }, 0);
  };

  const handleManageContent = () => {
    navigate(`/instructor/courses/${course._id}/content`);
  };

  const handleEditCourse = () => {
    navigate(`/instructor/courses/edit/${course._id}`);
  };

  const handleViewStudents = () => {
    navigate(`/instructor/courses/${course._id}/students`);
  };

  const handlePublish = async () => {
    try {
      if (onPublish) {
        setIsPublishing(true);
        await onPublish(course._id);
        toast({
          title: "Course Published",
          description: "Your course has been successfully published",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error publishing course:", error);
      toast({
        title: "Publication Failed",
        description: "There was an error publishing your course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Check if course is publishable (not already published)
  const isPublishable = course.status !== 2 && course.status !== 3;

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{course.title}</h3>
          {course.status !== undefined && getStatusLabel(course.status)}
        </div>
        
        <div className="text-sm text-gray-500 mt-2">
          <p>Created: {new Date(course.createdAt || '').toLocaleDateString()}</p>
          <p className="mt-1">Lectures: {getLectureCount()}</p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4 bg-gray-50">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleEditCourse}
            size="sm"
          >
            Edit Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewStudents}
          >
            <Users className="h-4 w-4 mr-1" />
            Students
          </Button>
        </div>
        <div className="flex gap-2">
          {isPublishable && onPublish && (
            <Button 
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={handlePublish}
              disabled={isPublishing}
              size="sm"
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          )}
          <Button 
            onClick={handleManageContent}
            size="sm"
          >
            Manage Content
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
