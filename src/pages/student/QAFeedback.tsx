
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { 
  HelpCircle, 
  MessageCircle, 
  Send, 
  ThumbsUp, 
  Loader2, 
  User 
} from "lucide-react";

interface Course {
  _id: string;
  title: string;
}

interface Lecture {
  _id: string;
  title: string;
  courseId: string;
}

interface QA {
  _id: string;
  title: string;
  desc?: string;
  courseId: string;
  lectureId: string;
  lectureNo?: number;
  updatedBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  comments: Comment[];
  votes: string[];
}

interface Comment {
  _id: string;
  desc: string;
  updatedBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  votes: string[];
}

export default function QAFeedback() {
  const { courseId, lectureId } = useParams<{ courseId: string; lectureId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [questions, setQuestions] = useState<QA[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionDesc, setNewQuestionDesc] = useState("");
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [submittingComment, setSubmittingComment] = useState<{[key: string]: boolean}>({});
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !lectureId || !isAuthenticated) return;
    
    fetchData();
  }, [courseId, lectureId, isAuthenticated]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const courseResponse = await api.get(`/courses/public/${courseId}`);
      setCourse(courseResponse.data.data.course);

      const lectureResponse = await api.get(`/lectures/${lectureId}`);
      setLecture(lectureResponse.data.data.lecture);

      const qaResponse = await api.get('/qas', { params: { courseId, lectureId } });
      setQuestions(qaResponse.data.data.qas || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestionTitle.trim() || !courseId || !lectureId) {
      toast({
        title: "Validation Error",
        description: "Question title is required",
        variant: "destructive",
      });
      return;
    }

    setSubmittingQuestion(true);
    try {
      await api.post('/qas', {
        title: newQuestionTitle,
        desc: newQuestionDesc,
        courseId,
        lectureId,
      });
      
      toast({
        title: "Success",
        description: "Your question has been posted",
      });
      
      setNewQuestionTitle("");
      setNewQuestionDesc("");
      fetchData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to post question",
        variant: "destructive",
      });
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleSubmitComment = async (questionId: string) => {
    if (!newComment[questionId]?.trim()) {
      toast({
        title: "Validation Error",
        description: "Comment text is required",
        variant: "destructive",
      });
      return;
    }

    setSubmittingComment(prev => ({ ...prev, [questionId]: true }));
    try {
      await api.post(`/qas/reply/${questionId}`, {
        desc: newComment[questionId],
      });
      
      toast({
        title: "Success",
        description: "Your comment has been added",
      });
      
      setNewComment(prev => ({ ...prev, [questionId]: "" }));
      fetchData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleVoteQuestion = async (questionId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.put(`/qas/vote/${questionId}`);
      fetchData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to vote",
        variant: "destructive",
      });
    }
  };

  const handleVoteComment = async (questionId: string, commentIndex: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.put(`/qas/reply-vote/${questionId}`, { commentIndex });
      fetchData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to vote",
        variant: "destructive",
      });
    }
  };

  const toggleQuestionExpand = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course || !lecture) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          Course or lecture information not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Q&A Discussion</h1>
        <p className="text-gray-600">
          Course: {course.title} / Lecture: {lecture.title}
        </p>
      </div>

      {isAuthenticated ? (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Ask a Question
              </h2>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div>
                  <label htmlFor="questionTitle" className="block text-sm font-medium mb-1">
                    Question Title *
                  </label>
                  <Input
                    id="questionTitle"
                    value={newQuestionTitle}
                    onChange={(e) => setNewQuestionTitle(e.target.value)}
                    placeholder="Enter your question title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="questionDetails" className="block text-sm font-medium mb-1">
                    Details (Optional)
                  </label>
                  <Textarea
                    id="questionDetails"
                    value={newQuestionDesc}
                    onChange={(e) => setNewQuestionDesc(e.target.value)}
                    placeholder="Provide more context for your question"
                    rows={4}
                  />
                </div>
                <Button type="submit" disabled={submittingQuestion}>
                  {submittingQuestion ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Question"
                  )}
                </Button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Discussion Board
              </h2>
              
              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No questions have been asked yet. Be the first to start a discussion!
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question) => (
                    <div key={question._id} className="border rounded-md overflow-hidden">
                      <div className="p-4 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 
                              className="font-medium text-lg cursor-pointer hover:text-primary"
                              onClick={() => toggleQuestionExpand(question._id)}
                            >
                              {question.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <User className="h-3 w-3 mr-1" />
                              <span>{question.updatedBy.name}</span>
                              <span className="mx-1">•</span>
                              <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <button 
                              onClick={() => handleVoteQuestion(question._id)}
                              className={`flex items-center ${
                                question.votes.includes(user?._id || "") 
                                  ? "text-primary" 
                                  : "text-gray-500"
                              }`}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              <span>{question.votes.length}</span>
                            </button>
                            <button 
                              onClick={() => toggleQuestionExpand(question._id)}
                              className="ml-4 text-gray-500 flex items-center"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              <span>{question.comments.length}</span>
                            </button>
                          </div>
                        </div>
                        {question.desc && question._id === expandedQuestion && (
                          <div className="mt-3 text-gray-700">
                            {question.desc}
                          </div>
                        )}
                      </div>

                      {question._id === expandedQuestion && (
                        <div className="p-4 border-t">
                          <h4 className="font-medium mb-3">Comments ({question.comments.length})</h4>
                          
                          {question.comments.length > 0 ? (
                            <div className="space-y-4 mb-4">
                              {question.comments.map((comment, index) => (
                                <div key={index} className="pl-4 border-l-2 border-gray-200">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="flex items-center text-sm">
                                        <span className="font-medium">{comment.updatedBy.name}</span>
                                        <span className="mx-1">•</span>
                                        <span className="text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                      </div>
                                      <p className="mt-1">{comment.desc}</p>
                                    </div>
                                    <button 
                                      onClick={() => handleVoteComment(question._id, index)}
                                      className={`flex items-center ${
                                        comment.votes.includes(user?._id || "") 
                                          ? "text-primary" 
                                          : "text-gray-500"
                                      }`}
                                    >
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      <span>{comment.votes.length}</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 mb-4">No comments yet.</p>
                          )}

                          <div className="flex mt-2">
                            <Textarea
                              value={newComment[question._id] || ""}
                              onChange={(e) => setNewComment({
                                ...newComment,
                                [question._id]: e.target.value
                              })}
                              placeholder="Add a comment..."
                              className="flex-1 min-h-[2.5rem] py-2"
                            />
                            <Button
                              size="sm"
                              className="ml-2 h-auto"
                              onClick={() => handleSubmitComment(question._id)}
                              disabled={submittingComment[question._id]}
                            >
                              {submittingComment[question._id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
          Please log in to participate in discussions.
        </div>
      )}
    </div>
  );
}
