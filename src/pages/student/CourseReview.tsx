
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { courseAPI, reviewAPI } from "@/lib/api";
import { Star, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function CourseReview() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<any>(null);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [allReviews, setAllReviews] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!key) return;
    fetchCourseData();
    fetchAllReviews();
    
    if (isAuthenticated) {
      fetchUserReview();
      checkEnrollment();
    }
  }, [key, isAuthenticated]);

  const fetchCourseData = async () => {
    try {
      const response = await courseAPI.getCourseByKey(key!);
      setCourse(response.data.data.course);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load course data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkEnrollment = async () => {
    try {
      const enrollmentsResponse = await reviewAPI.getEnrollments();
      const courseFound = enrollmentsResponse.data.data.enrollments?.some(
        (enrollment: any) => enrollment.courseId === course?._id
      );
      setIsEnrolled(courseFound);
    } catch (err) {
      console.error("Failed to check enrollment:", err);
    }
  };

  const fetchUserReview = async () => {
    try {
      if (!user) return;
      const response = await reviewAPI.getReviews({ courseKey: key, userId: user._id });
      if (response.data.data.reviews && response.data.data.reviews.length > 0) {
        const userReview = response.data.data.reviews.find(
          (r: any) => r.updatedBy._id === user._id
        );
        if (userReview) {
          setExistingReview(userReview);
          setReview(userReview.msg || "");
          setRating(userReview.rating);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user review:", err);
    }
  };

  const fetchAllReviews = async () => {
    try {
      const response = await reviewAPI.getReviews({ courseKey: key });
      setAllReviews(response.data.data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch all reviews:", err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    if (!course) {
      toast({
        title: "Error",
        description: "Course information is missing",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        // Update existing review
        await reviewAPI.updateReview(existingReview._id, {
          msg: review,
          rating,
          courseId: course._id,
        });
        toast({
          title: "Success",
          description: "Your review has been updated",
        });
      } else {
        // Create new review
        await reviewAPI.createReview({
          msg: review,
          rating,
          courseId: course._id,
        });
        toast({
          title: "Success",
          description: "Your review has been submitted",
        });
      }
      // Refresh reviews
      fetchAllReviews();
      fetchUserReview();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          Course not found
        </div>
      </div>
    );
  }

  const averageRating = allReviews.length > 0 
    ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Reviews for {course.title}</h1>
      <p className="text-gray-600 mb-8">
        Share your experience with this course • {allReviews.length} {allReviews.length === 1 ? 'review' : 'reviews'} • Average rating: {averageRating.toFixed(1)}/5
      </p>

      {!isAuthenticated ? (
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-700 mb-6">
          <p>Please log in to leave a review.</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => navigate("/login", { state: { from: window.location.pathname } })}
          >
            Log In
          </Button>
        </div>
      ) : !isEnrolled ? (
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-700 mb-6">
          <p>You need to enroll in this course before you can leave a review.</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => navigate(`/courses/${key}`)}
          >
            Enroll Now
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {existingReview ? "Update Your Review" : "Write a Review"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          onClick={() => setRating(value)}
                          onMouseEnter={() => setHoveredRating(value)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className={`h-6 w-6 cursor-pointer ${
                            (hoveredRating ? value <= hoveredRating : value <= rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="review" className="block text-sm font-medium mb-2">
                      Your Review (Optional)
                    </label>
                    <Textarea
                      id="review"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your experience with this course"
                      rows={4}
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : existingReview ? (
                      "Update Review"
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>All Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {allReviews.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allReviews.map((reviewItem) => (
                      <div key={reviewItem._id} className="border-b pb-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{reviewItem.updatedBy?.name}</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(reviewItem.createdAt)}
                          </div>
                        </div>
                        <div className="flex mb-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Star
                              key={value}
                              className={`h-4 w-4 ${
                                value <= reviewItem.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {reviewItem.msg && <p className="text-gray-700">{reviewItem.msg}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
