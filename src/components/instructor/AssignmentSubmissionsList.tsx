
import { useState, useEffect } from "react";
import { assignmentAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Send, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface AssignmentSubmissionsListProps {
  assignmentId: string;
}

export default function AssignmentSubmissionsList({ assignmentId }: AssignmentSubmissionsListProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSubmission, setCurrentSubmission] = useState<any>(null);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!assignmentId) return;
      
      try {
        setIsLoading(true);
        console.log("Fetching submissions for assignment:", assignmentId);
        const response = await assignmentAPI.getAssignmentSubmissions(assignmentId);
        console.log("Submissions response:", response);
        
        // Extract submissions data from response
        const submissionsData = response.data?.data?.submissions || [];
        setSubmissions(submissionsData);
      } catch (error: any) {
        console.error("Error fetching submissions:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load submissions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId, toast]);

  const handleGradeSubmission = async () => {
    if (!currentSubmission) return;
    
    try {
      const numericGrade = parseFloat(grade);
      if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
        toast({
          title: "Invalid Grade",
          description: "Grade must be a number between 0 and 100",
          variant: "destructive",
        });
        return;
      }
      
      await assignmentAPI.gradeSubmission(currentSubmission._id, {
        feedback,
        grade: numericGrade
      });
      
      toast({
        title: "Success",
        description: "Submission graded successfully",
      });
      
      // Update the submission in the local state
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub._id === currentSubmission._id 
            ? { ...sub, feedback, grade: numericGrade, status: 2 } 
            : sub
        )
      );
      
      setIsGradingDialogOpen(false);
      setFeedback("");
      setGrade("");
    } catch (error: any) {
      console.error("Error grading submission:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to grade submission",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No submissions yet</h3>
        <p className="mt-1 text-gray-500">
          There are no student submissions for this assignment yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Submissions ({submissions.length})</h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        {submissions.map((submission) => (
          <Card key={submission._id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium">{submission.updatedBy?.name || "Student"}</h4>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Send className="h-4 w-4 mr-1" />
                    Submitted: {formatDate(submission.createdAt)}
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-sm font-medium">Status: </span>
                    <span className="text-sm">
                      {submission.status === 0 
                        ? "Pending Review" 
                        : submission.status === 1 
                        ? "Under Review" 
                        : "Graded"}
                    </span>
                  </div>
                  
                  {submission.grade !== undefined && (
                    <div className="mt-1">
                      <span className="text-sm font-medium">Grade: </span>
                      <span className="text-sm">{submission.grade}/100</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => {
                    setCurrentSubmission(submission);
                    setFeedback(submission.feedback || "");
                    setGrade(submission.grade?.toString() || "");
                    setIsGradingDialogOpen(true);
                  }}
                >
                  <Star className="h-4 w-4 mr-2" />
                  {submission.status === 2 ? "View Grade" : "Grade"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grading Dialog */}
      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentSubmission?.status === 2 ? "Update Grade" : "Grade Submission"}
            </DialogTitle>
            <DialogDescription>
              {currentSubmission?.status === 2 
                ? "Update the grade and feedback for this submission." 
                : "Provide a grade and feedback for this student's submission."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Student Answer</h4>
              <div className="bg-gray-50 p-3 rounded border text-sm">
                {currentSubmission?.answer || "No answer provided"}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="grade" className="text-sm font-medium">
                Grade (0-100)
              </label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Enter grade (0-100)"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="feedback" className="text-sm font-medium">
                Feedback
              </label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback for the student"
                rows={4}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleGradeSubmission}>
              {currentSubmission?.status === 2 ? "Update Grade" : "Submit Grade"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
