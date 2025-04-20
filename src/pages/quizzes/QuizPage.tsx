import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, AlertCircle } from "lucide-react";

interface QuizQuestion {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return;
      
      setLoading(true);
      setError('');
      
      try {
        const response = await quizAPI.getQuizById(quizId);
        const quizData = response.data.data.quiz;
        
        if (!quizData) {
          throw new Error("Quiz not found");
        }
        
        setQuiz(quizData);
        
        if (quizData.questions && Array.isArray(quizData.questions)) {
          setQuizQuestions(quizData.questions);
          setUserAnswers(new Array(quizData.questions.length).fill(''));
        } else {
          throw new Error("No questions found in this quiz");
        }
      } catch (err: any) {
        console.error("Error fetching quiz:", err);
        setError(err.message || 'Failed to load quiz');
        toast({
          title: "Error",
          description: "Failed to load quiz questions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId, toast]);

  const handleAnswerSelect = (answer: string) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = answer;
    setUserAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    
    quizQuestions.forEach((question, index) => {
      if (question.correctAnswer === userAnswers[index]) {
        correctCount++;
      }
    });
    
    return {
      score: correctCount,
      total: quizQuestions.length,
      percentage: Math.round((correctCount / quizQuestions.length) * 100)
    };
  };

  const handleSubmitQuiz = async () => {
    if (!quizId || !user) return;
    
    const unansweredCount = userAnswers.filter(answer => !answer).length;
    if (unansweredCount > 0) {
      const isConfirmed = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Do you want to submit the quiz anyway?`
      );
      
      if (!isConfirmed) {
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const scoreResult = calculateScore();
      setScore(scoreResult.percentage);
      
      const submittedAnswers = userAnswers.map((answer, index) => ({
        questionIndex: index,
        answer
      }));
      
      await quizAPI.submitQuizAnswer(quiz._id, { answers: submittedAnswers });
      
      setQuizCompleted(true);
      
      toast({
        title: "Quiz Submitted",
        description: `Your score: ${scoreResult.score}/${scoreResult.total} (${scoreResult.percentage}%)`,
      });
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      toast({
        title: "Submission Failed",
        description: err.response?.data?.message || "Failed to submit quiz answers",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p>Loading quiz questions...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <Button className="mt-4" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                Quiz Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
              <h2 className="text-2xl font-bold mb-2">Your Score</h2>
              <div className="w-40 h-40 flex items-center justify-center rounded-full border-4 border-green-100 mx-auto my-6">
                <span className="text-4xl font-bold">{score}%</span>
              </div>
              <p className="mb-6">
                You answered {userAnswers.filter((a, i) => a === quizQuestions[i].correctAnswer).length} out of {quizQuestions.length} questions correctly.
              </p>
              <Button onClick={() => navigate(-1)}>
                Return to Course
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p>No questions found for this quiz.</p>
              <Button className="mt-4" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{quiz.title}</CardTitle>
              <div className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </div>
            </div>
            <Progress 
              value={(currentQuestionIndex + 1) / quizQuestions.length * 100} 
              className="mt-2" 
            />
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {currentQuestion.questionText}
                </h2>
                
                <RadioGroup 
                  value={userAnswers[currentQuestionIndex] || ""}
                  onValueChange={handleAnswerSelect}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2 p-3 border rounded hover:bg-gray-50">
                      <RadioGroupItem 
                        id={`option-${index}`} 
                        value={option} 
                        className="mt-1"
                      />
                      <Label 
                        htmlFor={`option-${index}`} 
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-6">
            <Button 
              variant="outline" 
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <div>
              {currentQuestionIndex < quizQuestions.length - 1 ? (
                <Button onClick={handleNextQuestion}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
