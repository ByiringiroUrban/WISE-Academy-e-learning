
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { paymentAPI, enrollmentAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, CheckCircle } from "lucide-react";

interface PaymentState {
  courseId: string;
  courseKey: string;
  amount: number;
  currency: string;
}

enum PaymentStatus {
  PENDING,
  PROCESSING,
  SUCCESS,
  ERROR
}

export default function PaymentPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Get payment details from location state
  const paymentDetails = location.state as PaymentState;
  
  useEffect(() => {
    // Redirect if no payment details or user
    if (!paymentDetails?.courseId || !user) {
      toast({
        title: "Error",
        description: "Missing payment information or user not logged in",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [paymentDetails, user, toast, navigate]);
  
  const handleProcessPayment = async () => {
    if (!paymentDetails?.courseId) return;
    
    setIsProcessing(true);
    setStatus(PaymentStatus.PROCESSING);
    setPaymentError(null);
    
    try {
      // Create a payment order
      const orderResponse = await paymentAPI.createOrder({
        amount: paymentDetails.amount,
        currency: paymentDetails.currency || 'USD',
        courseId: paymentDetails.courseId,
      });
      
      if (orderResponse.data?.data?.order?.id) {
        // Order created successfully, now capture the payment
        const orderId = orderResponse.data.data.order.id;
        
        try {
          // Capture the payment
          await paymentAPI.capturePayment(orderId, {
            courseId: paymentDetails.courseId,
          });
          
          setStatus(PaymentStatus.SUCCESS);
          
          toast({
            title: "Payment Successful",
            description: "You have been enrolled in the course",
          });
          
          // Short delay before redirect
          setTimeout(() => {
            navigate(`/courses/${paymentDetails.courseKey}/learn`);
          }, 2000);
          
        } catch (captureErr: any) {
          console.error("Payment capture error:", captureErr);
          setStatus(PaymentStatus.ERROR);
          setPaymentError(captureErr.response?.data?.message || "Failed to process payment");
        }
      } else {
        throw new Error("Failed to create payment order");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setStatus(PaymentStatus.ERROR);
      setPaymentError(error.response?.data?.message || "There was an error processing your payment");
      
      toast({
        title: "Payment Failed",
        description: error.response?.data?.message || "There was an error processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment errors - allow retry or fallback to free enrollment
  const handleFallbackEnrollment = async () => {
    setIsProcessing(true);
    
    try {
      // Try direct enrollment as fallback
      await enrollmentAPI.enrollCourse({ courseId: paymentDetails.courseId });
      
      toast({
        title: "Enrollment Successful",
        description: "You have been enrolled in the course",
      });
      
      // Redirect to course learning page
      navigate(`/courses/${paymentDetails.courseKey}/learn`);
      
    } catch (error: any) {
      console.error("Fallback enrollment error:", error);
      
      toast({
        title: "Enrollment Failed",
        description: error.response?.data?.message || "Failed to enroll in the course",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!paymentDetails) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">Invalid Payment Information</h3>
              <p className="text-gray-500 mt-2">Please go back and try again</p>
              <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Complete Your Purchase</h1>
        
        {status === PaymentStatus.ERROR && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Error</AlertTitle>
            <AlertDescription>
              {paymentError || "There was an error processing your payment."}
            </AlertDescription>
          </Alert>
        )}
        
        {status === PaymentStatus.SUCCESS && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Payment Successful</AlertTitle>
            <AlertDescription>
              You have been successfully enrolled in the course.
              Redirecting to the course...
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Course Access</span>
              <span className="font-medium">
                {paymentDetails.currency} {paymentDetails.amount.toFixed(2)}
              </span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{paymentDetails.currency} {paymentDetails.amount.toFixed(2)}</span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <h3 className="font-medium mb-2">Payment Method</h3>
              <p className="text-sm text-gray-500 mb-4">
                Payment will be processed securely. After successful payment, 
                you'll get immediate access to the course.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full" 
              onClick={handleProcessPayment}
              disabled={isProcessing || status === PaymentStatus.SUCCESS}
            >
              {isProcessing && status === PaymentStatus.PROCESSING 
                ? "Processing..." 
                : `Pay ${paymentDetails.currency} ${paymentDetails.amount.toFixed(2)}`}
            </Button>
            
            {status === PaymentStatus.ERROR && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleFallbackEnrollment}
                disabled={isProcessing}
              >
                Try Free Enrollment
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => navigate(-1)} disabled={isProcessing}>
            Cancel and return
          </Button>
        </div>
      </div>
    </div>
  );
}
