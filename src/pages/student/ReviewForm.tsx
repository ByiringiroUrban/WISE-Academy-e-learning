
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { courseAPI } from "@/lib/api";
import api from "@/lib/api";
import { Star, Loader2 } from "lucide-react";

interface Course {
  _id: string;
  title: string;
  key: string;
}

interface Review {
  _id: string;
  msg: string;
  rating: number;
  updatedBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function ReviewForm() {
  const { key } = useParams<{ key: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!key) return;
    fetchCourseData();
    if (isAuthenticated) {
      fetchUserReview();
    }
    fetchAllReviews();
  }, [key, isAuthenticated]);

  const fetchCourseData = async () => {
    try {
      const response = await courseAPI.getCourseByKey(key!);
      setCourse(response.data.data.course);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load course data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserReview = async () => {
    try {
      if (!user) return;
      const response = await api.get('/reviews', { params: { courseKey: key, userId: user._id } });
      if (response.data.data.reviews && response.data.data.reviews.length > 0) {
        const userReview = response.data.data.reviews.find(
          (r: Review) => r.updatedBy._id === user._id
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
      const response = await api.get('/reviews', { params: { courseKey: key } });
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
        await api.put(`/reviews/${existingReview._id}`, {
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
        await api.post('/reviews', {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Reviews for {course.title}</h1>
      <p className="text-gray-600 mb-8">Share your experience with this course</p>

      {isAuthenticated ? (
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                {existingReview ? "Update Your Review" : "Write a Review"}
              </h2>
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
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">All Reviews</h2>
              {allReviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {allReviews.map((reviewItem) => (
                    <div key={reviewItem._id} className="border-b pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{reviewItem.updatedBy.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(reviewItem.createdAt).toLocaleDateString()}
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
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-700 mb-6">
          Please log in to leave a review.
        </div>
      )}
    </div>
  );
}
