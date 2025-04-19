
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { MessageCircle, ThumbsUp, Send, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";

interface Comment {
  desc: string;
  updatedBy: {
    _id: string;
    name: string;
    email: string;
    avatarId?: string;
    avatar?: any;
  };
  createdAt: string;
  updatedAt: string;
  votes: string[];
}

interface QA {
  _id: string;
  title: string;
  desc: string;
  courseId: string;
  lectureId: string;
  lectureNo: number;
  comments: Comment[];
  votes: string[];
  updatedBy: {
    _id: string;
    name: string;
    email: string;
    avatarId?: string;
    avatar?: any;
  };
  createdAt: string;
  updatedAt: string;
}

export default function QAndAPage() {
  const { courseId, lectureId } = useParams<{ courseId: string; lectureId: string }>();
  const [questions, setQuestions] = useState<QA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState({ title: "", desc: "" });
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (courseId && lectureId) {
      fetchQuestions();
    }
  }, [courseId, lectureId]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/v1/qas", {
        params: { courseId, lectureId }
      });
      setQuestions(response.data.data.qas || []);
    } catch (error) {
      console.error("Error fetching Q&A:", error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    try {
      if (!newQuestion.title.trim() || !newQuestion.desc.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post("/api/v1/qas", {
        ...newQuestion,
        courseId,
        lectureId,
      });

      setQuestions((prev) => [response.data.data.qa, ...prev]);
      setNewQuestion({ title: "", desc: "" });
      setShowAskQuestion(false);

      toast({
        title: "Success",
        description: "Question posted successfully",
      });
    } catch (error) {
      console.error("Error posting question:", error);
      toast({
        title: "Error",
        description: "Failed to post question",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (questionId: string) => {
    try {
      const commentText = newComment[questionId];
      if (!commentText || !commentText.trim()) {
        toast({
          title: "Error",
          description: "Comment cannot be empty",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post(`/api/v1/qas/reply/${questionId}`, {
        desc: commentText,
      });

      const updatedQuestions = questions.map((q) =>
        q._id === questionId ? response.data.data.qa : q
      );

      setQuestions(updatedQuestions);
      setNewComment({ ...newComment, [questionId]: "" });

      toast({
        title: "Success",
        description: "Reply added successfully",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      });
    }
  };

  const handleVoteQuestion = async (questionId: string) => {
    try {
      const response = await axios.put(`/api/v1/qas/vote/${questionId}`);
      
      const updatedQuestions = questions.map((q) =>
        q._id === questionId ? response.data.data.qa : q
      );

      setQuestions(updatedQuestions);
    } catch (error) {
      console.error("Error voting for question:", error);
      toast({
        title: "Error",
        description: "Failed to vote for question",
        variant: "destructive",
      });
    }
  };

  const handleVoteComment = async (questionId: string, commentIndex: number) => {
    try {
      const response = await axios.put(`/api/v1/qas/reply-vote/${questionId}`, {
        commentIndex,
      });
      
      const updatedQuestions = questions.map((q) =>
        q._id === questionId ? response.data.data.qa : q
      );

      setQuestions(updatedQuestions);
    } catch (error) {
      console.error("Error voting for comment:", error);
      toast({
        title: "Error",
        description: "Failed to vote for reply",
        variant: "destructive",
      });
    }
  };

  const isQuestionVotedByUser = (votes: string[]) => {
    return user && votes.includes(user._id);
  };

  const isCommentVotedByUser = (votes: string[]) => {
    return user && votes.includes(user._id);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Q&A</h1>
        <Button onClick={() => setShowAskQuestion(!showAskQuestion)}>
          <Plus className="h-4 w-4 mr-2" />
          Ask a Question
        </Button>
      </div>

      {showAskQuestion && (
        <div className="bg-white p-6 rounded-lg shadow mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Ask a Question</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="question-title" className="block text-sm font-medium mb-1">
                Question Title
              </label>
              <Input
                id="question-title"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                placeholder="Enter a concise title for your question"
              />
            </div>
            <div>
              <label htmlFor="question-desc" className="block text-sm font-medium mb-1">
                Question Details
              </label>
              <Textarea
                id="question-desc"
                value={newQuestion.desc}
                onChange={(e) => setNewQuestion({ ...newQuestion, desc: e.target.value })}
                placeholder="Provide more details about your question"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowAskQuestion(false)}>
                Cancel
              </Button>
              <Button onClick={handleAskQuestion}>
                Submit Question
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-lg font-medium">No questions yet</h2>
          <p className="mt-2 text-gray-600">
            Be the first to ask a question about this lecture.
          </p>
          <Button className="mt-4" onClick={() => setShowAskQuestion(true)}>
            Ask a Question
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {questions.map((question) => (
            <div
              key={question._id}
              className="bg-white p-6 rounded-lg shadow border border-gray-100"
            >
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">{question.title}</h2>
                <Button
                  variant={isQuestionVotedByUser(question.votes) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVoteQuestion(question._id)}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {question.votes.length}
                </Button>
              </div>

              <div className="mt-2 text-gray-700">{question.desc}</div>

              <div className="mt-2 text-sm text-gray-500 flex items-center">
                <span className="font-medium mr-2">{question.updatedBy.name}</span>
                <span>asked {formatDate(question.createdAt)}</span>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-lg mb-3">
                  {question.comments.length} {question.comments.length === 1 ? "Reply" : "Replies"}
                </h3>

                <div className="space-y-4 mb-4">
                  {question.comments.map((comment, index) => (
                    <div key={index} className="border-l-4 border-gray-200 pl-4 py-1">
                      <div className="text-gray-800">{comment.desc}</div>
                      <div className="flex justify-between mt-2">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">{comment.updatedBy.name}</span>
                          <span className="ml-2">{formatDate(comment.createdAt)}</span>
                        </div>
                        <Button
                          variant={isCommentVotedByUser(comment.votes) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleVoteComment(question._id, index)}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {comment.votes.length}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a reply..."
                    value={newComment[question._id] || ""}
                    onChange={(e) =>
                      setNewComment({ ...newComment, [question._id]: e.target.value })
                    }
                    className="flex-grow"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddComment(question._id)}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
