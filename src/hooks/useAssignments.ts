
import { useState, useEffect } from 'react';
import { assignmentAPI, enrollmentAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useAssignments(verified: boolean = false) {
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!verified) return;
      
      try {
        setIsLoading(true);
        
        // Get all assignments
        const assignmentsResponse = await assignmentAPI.getAssignments();
        const allAssignments = assignmentsResponse.data.data.assignments || [];
        
        // Get user enrollments to check if the student is enrolled in the courses
        const enrollmentsResponse = await enrollmentAPI.getUserEnrollments();
        const enrollments = enrollmentsResponse.data.data.enrollments || [];
        const enrolledCourseIds = enrollments.map((enrollment: any) => 
          typeof enrollment.courseId === 'object' 
            ? enrollment.courseId._id 
            : enrollment.courseId
        );
        
        // Get assignments for enrolled courses only
        const relevantAssignments = allAssignments.filter((assignment: any) => {
          const courseId = typeof assignment.courseId === 'object' 
            ? assignment.courseId._id 
            : assignment.courseId;
          return enrolledCourseIds.includes(courseId);
        });
        
        // Get submitted assignments
        const answersResponse = await assignmentAPI.getAssignmentSubmissions('');
        const submittedAnswers = answersResponse.data.data.assignmentAnswers || [];
        const submittedAssignmentIds = submittedAnswers.map((answer: any) => answer.assignmentId);
        
        // Split assignments into pending and submitted
        const pending = relevantAssignments.filter((assignment: any) => 
          !submittedAssignmentIds.includes(assignment._id)
        );
        
        const submitted = relevantAssignments.filter((assignment: any) => 
          submittedAssignmentIds.includes(assignment._id)
        );
        
        setPendingAssignments(pending);
        setSubmittedAssignments(submitted);
      } catch (error: any) {
        console.error('Error fetching assignments:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load assignments',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssignments();
  }, [verified, toast]);
  
  return {
    pendingAssignments,
    submittedAssignments,
    isLoading,
  };
}
