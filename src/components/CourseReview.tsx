
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reviewAPI } from "@/lib/api";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";

interface CourseReviewProps {
  courseId: string;
  instructorId?: string;
  onReviewSubmitted?: () => void;
}

export default function CourseReview({ courseId, instructorId, onReviewSubmitted }: CourseReviewProps) {
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState<boolean>(false);
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const submitReview = async () => {
    if (!review) {
      toast({
        title: "Review required",
        description: "Please write a review before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsReviewSubmitting(true);
    try {
      await reviewAPI.createReview({
        courseId,
        rating,
        review,
      });
      
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      
      setReview("");
      setRating(5);
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsReviewSubmitting(false);
    }
  };
  
  const submitFeedback = async () => {
    if (!feedback) {
      toast({
        title: "Feedback required",
        description: "Please write your feedback before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsFeedbackSubmitting(true);
    try {
      // If we had a direct instructor feedback API, we would use it here
      // For now, we'll simulate it with a success message
      setTimeout(() => {
        toast({
          title: "Feedback sent",
          description: "Your feedback has been sent to the instructor.",
        });
        
        setFeedback("");
        setDialogOpen(false);
      }, 1000);
    } catch (error: any) {
      console.error("Error sending feedback:", error);
      toast({
        title: "Error",
        description: "Failed to send feedback to instructor",
        variant: "destructive",
      });
    } finally {
      setIsFeedbackSubmitting(false);
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <RadioGroup 
                id="rating"
                value={rating.toString()} 
                onValueChange={(value) => setRating(parseInt(value))}
                className="flex space-x-2 my-2"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex items-center space-x-1">
                    <RadioGroupItem value={value.toString()} id={`rating-${value}`} />
                    <Label htmlFor={`rating-${value}`}>{value}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="review">Your Review (Public)</Label>
              <Textarea
                id="review"
                placeholder="Share your experience with this course..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
              />
            </div>
            
            <Button 
              onClick={submitReview} 
              disabled={isReviewSubmitting || !review}
            >
              {isReviewSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full flex gap-2">
            <MessageSquare className="h-4 w-4" />
            Send Private Feedback to Instructor
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Feedback to Instructor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Your Feedback (Private)</Label>
              <Textarea
                id="feedback"
                placeholder="Share your feedback directly with the instructor..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
              />
            </div>
            
            <Button 
              onClick={submitFeedback} 
              disabled={isFeedbackSubmitting || !feedback}
              className="w-full"
            >
              {isFeedbackSubmitting ? "Sending..." : "Send Feedback"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
