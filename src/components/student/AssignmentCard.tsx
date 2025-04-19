
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface AssignmentCardProps {
  assignment: any;
  courseEnrollment?: any;
  submission?: any;
  isSubmitted?: boolean;
}

export function AssignmentCard({ assignment, courseEnrollment, submission, isSubmitted = false }: AssignmentCardProps) {
  if (isSubmitted && submission) {
    return (
      <Card key={submission._id}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-semibold">{submission.assignment?.title || 'Assignment'}</h3>
              <p className="text-gray-600 mb-2">{courseEnrollment?.courseId.title || 'Unknown Course'}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                  Submitted: {formatDate(submission.createdAt)}
                </Badge>
                
                {submission.status && (
                  <Badge 
                    variant={submission.status === 'graded' ? 'success' : 'secondary'}
                    className={submission.status === 'graded' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'}
                  >
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </Badge>
                )}
                
                {submission.grade && submission.status === 'graded' && (
                  <Badge 
                    variant="outline" 
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Grade: {submission.grade}/100
                  </Badge>
                )}
              </div>
              
              {submission.feedbackFromInstructor && (
                <div className="bg-gray-50 p-3 rounded-md mt-3">
                  <h4 className="text-sm font-medium mb-1">Instructor Feedback:</h4>
                  <p className="text-gray-700 text-sm">{submission.feedbackFromInstructor}</p>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0">
              <Link to={`/courses/${courseEnrollment?.courseId.slug}/assignments/${submission.assignmentId}/submission/${submission._id}`}>
                <Button variant="outline">View Submission</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  } else {
    return (
      <Card key={assignment._id}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-semibold">{assignment.title}</h3>
              <p className="text-gray-600 mb-2">{courseEnrollment?.courseId.title || 'Unknown Course'}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {assignment.dueDate && (
                  <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">
                    Due: {formatDate(assignment.dueDate)}
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-700">{assignment.desc}</p>
            </div>
            
            <div className="flex-shrink-0">
              <Link to={`/courses/${courseEnrollment?.courseId.slug}/assignments/${assignment._id}/submit`}>
                <Button>Start Assignment</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}
