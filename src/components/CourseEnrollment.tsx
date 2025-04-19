
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { enrollmentAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface CourseEnrollmentProps {
  courseId: string;
  courseKey: string;
  coursePaid: boolean;
  price?: {
    amount: number;
    currency: string;
  };
  onSuccess?: () => void;
  isEnrolled?: boolean;
}

export default function CourseEnrollment({ 
  courseId, 
  courseKey,
  coursePaid, 
  price, 
  onSuccess,
  isEnrolled = false
}: CourseEnrollmentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check enrollment status on mount and when courseId changes
  useEffect(() => {
    if (user && courseId && !enrolled) {
      checkEnrollmentStatus();
    }
  }, [user, courseId]);

  const checkEnrollmentStatus = async () => {
    if (!user || !courseId) return;
    
    try {
      const response = await enrollmentAPI.getUserEnrollments();
      const enrollments = response.data?.data?.enrollments || [];
      
      // Check if user is already enrolled in this course
      const isAlreadyEnrolled = enrollments.some((enrollment: any) => {
        const enrollmentCourseId = typeof enrollment.courseId === 'object' 
          ? enrollment.courseId._id 
          : enrollment.courseId;
          
        return enrollmentCourseId === courseId;
      });
      
      if (isAlreadyEnrolled) {
        setEnrolled(true);
      }
    } catch (error) {
      console.error("Error checking enrollment status:", error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in this course",
        variant: "destructive",
      });
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    if (!courseId) {
      toast({
        title: "Error",
        description: "Invalid course information",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Enrolling in course:", courseId);
      
      if (coursePaid) {
        // For paid courses, redirect to payment page
        navigate("/payment", { 
          state: { 
            courseId,
            courseKey,
            amount: price?.amount || 0,
            currency: price?.currency || 'USD'
          } 
        });
        return;
      }
      
      // For free courses, enroll directly
      const response = await enrollmentAPI.enrollCourse({ courseId });
      console.log("Enrollment response:", response);
      
      toast({
        title: "Success",
        description: "You have successfully enrolled in this course",
      });
      
      // Update local state to reflect enrollment
      setEnrolled(true);
      
      if (onSuccess) {
        onSuccess();
      }

      // Redirect to the course learning page
      navigate(`/courses/${courseKey}/learn`);
      
    } catch (error: any) {
      console.error("Enrollment error:", error);
      
      // Check if it's an "already enrolled" error
      if (error.response?.status === 404 && 
          error.response?.data?.message?.includes("already enrolled")) {
        toast({
          title: "Already Enrolled",
          description: "You're already enrolled in this course. Redirecting to the course.",
        });
        
        // Update local state to reflect enrollment
        setEnrolled(true);
        
        // If already enrolled, just redirect to the course
        setTimeout(() => {
          navigate(`/courses/${courseKey}/learn`);
        }, 1000);
        
        return;
      }
      
      toast({
        title: "Enrollment Failed",
        description: error.response?.data?.message || "Failed to enroll in this course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueLearning = () => {
    navigate(`/courses/${courseKey}/learn`);
  };

  if (enrolled) {
    return (
      <Button className="w-full" onClick={handleContinueLearning}>
        Continue Learning
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleEnroll} 
      disabled={isLoading} 
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Processing...
        </>
      ) : (
        coursePaid ? `Enroll - ${price?.currency || 'USD'} ${price?.amount || 0}` : "Enroll for Free"
      )}
    </Button>
  );
}
