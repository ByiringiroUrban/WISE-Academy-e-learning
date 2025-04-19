
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
  onPublish?: (courseId: string) => void;
}

export default function CourseManagementCard({ course, onPublish }: CourseCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="bg-gray-100">Draft</Badge>;
      case 1:
        return <Badge variant="outline" className="bg-yellow-100">Under Review</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-green-100">Published</Badge>;
      case 3:
        return <Badge variant="outline" className="bg-green-100">Published</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100">Unknown</Badge>;
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

  const handlePublish = async () => {
    try {
      if (onPublish) {
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
    }
  };

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
          >
            Edit Details
          </Button>
          {isPublishable && onPublish && (
            <Button 
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={handlePublish}
            >
              Publish
            </Button>
          )}
        </div>
        <Button 
          onClick={handleManageContent}
        >
          Manage Content
        </Button>
      </CardFooter>
    </Card>
  );
}
