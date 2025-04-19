
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, FileText } from "lucide-react";
import { formatDate, formatDistanceToNow } from "@/lib/utils";

interface Assignment {
  _id: string;
  title: string;
  desc: string;
  courseId: string | { _id: string; title: string };
  createdAt: string;
  duration: number;
  [key: string]: any;
}

interface AssignmentsListProps {
  assignments: Assignment[];
  emptyMessage?: string;
  isSubmitted?: boolean;
}

export function AssignmentsList({ assignments, emptyMessage = "No assignments found", isSubmitted }: AssignmentsListProps) {
  const navigate = useNavigate();
  
  if (assignments.length === 0) {
    return (
      <div className="text-center p-8">
        <FileText className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">No Assignments</h3>
        <p className="mt-1 text-gray-500">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {assignments.map((assignment) => {
        // Calculate due date
        const createdDate = new Date(assignment.createdAt);
        const dueDate = new Date(createdDate);
        dueDate.setDate(dueDate.getDate() + assignment.duration);
        
        // Get course title
        const courseTitle = typeof assignment.courseId === 'object' 
          ? assignment.courseId.title 
          : 'Unknown Course';
          
        const courseId = typeof assignment.courseId === 'object'
          ? assignment.courseId._id
          : assignment.courseId;
        
        return (
          <div
            key={assignment._id}
            className="group relative rounded-lg border bg-card text-card-foreground shadow transition-all hover:shadow-md"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{assignment.title}</h3>
                  <p className="text-sm text-muted-foreground">{courseTitle}</p>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  <span>Due {formatDistanceToNow(dueDate)}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="line-clamp-2 text-sm">{assignment.desc}</p>
              </div>
              
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <span>Created: {formatDate(assignment.createdAt)}</span>
                <span className="ml-4">Duration: {assignment.duration} days</span>
              </div>
              
              <div className="mt-4">
                <Button
                  className="w-full"
                  onClick={() => navigate(`/courses/${courseId}/assignments/${assignment._id}/submit`)}
                >
                  {isSubmitted ? "View Submission" : "Open Assignment"}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AssignmentsList;
