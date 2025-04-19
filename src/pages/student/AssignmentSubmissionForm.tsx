
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Upload } from "lucide-react";
import axios from "axios";

export default function AssignmentSubmissionForm() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [assignment, setAssignment] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [previousAnswer, setPreviousAnswer] = useState<any>(null);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setIsLoading(true);
      
      // Fetch assignment details
      const assignmentResponse = await axios.get(`/api/v1/assignments/${assignmentId}`);
      setAssignment(assignmentResponse.data.data.assignment);
      
      // Check if user has already submitted an answer
      try {
        const submissionResponse = await axios.get(`/api/v1/assignment-answers/assignment/${assignmentId}`);
        if (submissionResponse.data.data.answer) {
          setPreviousAnswer(submissionResponse.data.data.answer);
          setHasSubmitted(true);
          setAnswer(submissionResponse.data.data.answer.content || "");
        }
      } catch (error) {
        // No submission exists yet, that's okay
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load assignment",
        variant: "destructive",
      });
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setAttachments(fileArray);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answer.trim() && attachments.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide an answer or attach a file",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First upload attachments if any
      let attachmentIds: string[] = [];
      
      if (attachments.length > 0) {
        for (const file of attachments) {
          const formData = new FormData();
          formData.append("file", file);
          
          const fileResponse = await axios.post("/api/v1/files/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          
          attachmentIds.push(fileResponse.data.data.file._id);
        }
      }
      
      const submissionData = {
        assignmentId,
        content: answer,
        attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
      };
      
      if (hasSubmitted && previousAnswer) {
        // Update existing submission
        await axios.put(`/api/v1/assignment-answers/${previousAnswer._id}`, submissionData);
        
        toast({
          title: "Success",
          description: "Your assignment submission has been updated",
        });
      } else {
        // Create new submission
        await axios.post("/api/v1/assignment-answers", submissionData);
        
        toast({
          title: "Success",
          description: "Your assignment has been submitted successfully",
        });
      }
      
      // Navigate back to course page or assignment list
      navigate(-1);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit assignment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading assignment...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Assignment Submission</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{assignment?.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Instructions</h3>
              <div className="prose max-w-none">
                <p>{assignment?.instructions}</p>
              </div>
            </div>
            
            {assignment?.dueDate && (
              <div>
                <h3 className="text-lg font-medium mb-2">Due Date</h3>
                <p>{new Date(assignment.dueDate).toLocaleString()}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="answer" className="block text-sm font-medium mb-1">
                  Your Answer
                </label>
                <Textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={8}
                />
              </div>
              
              <div>
                <label htmlFor="attachments" className="block text-sm font-medium mb-1">
                  Attachments (if required)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="attachments"
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                  />
                  <label
                    htmlFor="attachments"
                    className="cursor-pointer flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 text-sm font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    {attachments.length > 0 ? `${attachments.length} file(s) selected` : "Choose files"}
                  </label>
                </div>
                
                {attachments.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {Array.from(attachments).map((file, index) => (
                      <li key={index} className="text-sm">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting 
                    ? "Submitting..." 
                    : hasSubmitted 
                      ? "Update Submission" 
                      : "Submit Assignment"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t">
            {hasSubmitted && (
              <p className="text-sm text-gray-500">
                Last submitted: {new Date(previousAnswer.updatedAt).toLocaleString()}
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
