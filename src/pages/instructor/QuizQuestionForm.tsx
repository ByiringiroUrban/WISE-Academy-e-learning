
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { quizAPI } from "@/lib/api";
import { Loader2, Plus, X } from "lucide-react";

export default function QuizQuestionForm() {
  const { quizId } = useParams<{ quizId: string }>();
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<string>("single"); // single, multiple, text
  const [points, setPoints] = useState<number>(1);
  const [options, setOptions] = useState<{text: string, isCorrect: boolean}[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [correctTextAnswer, setCorrectTextAnswer] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  
  useEffect(() => {
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);
  
  const fetchQuizData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch quiz details
      const quizResponse = await quizAPI.getQuizById(quizId!);
      setQuiz(quizResponse.data.data.quiz);
      
      // Fetch quiz questions
      const questionsResponse = await quizAPI.getQuizQuestions(quizId!);
      setQuestions(questionsResponse.data.data.questions || []);
      
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load quiz data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setQuestionText("");
    setQuestionType("single");
    setPoints(1);
    setOptions([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
    setCorrectTextAnswer("");
    setEditingQuestionId(null);
  };
  
  const handleAddOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };
  
  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };
  
  const handleOptionTextChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };
  
  const handleSingleOptionSelect = (index: number) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }));
    setOptions(newOptions);
  };
  
  const handleMultipleOptionSelect = (index: number, checked: boolean) => {
    const newOptions = [...options];
    newOptions[index].isCorrect = checked;
    setOptions(newOptions);
  };
  
  const validateForm = () => {
    // Basic validation
    if (!questionText.trim()) {
      toast({
        title: "Validation Error",
        description: "Question text is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (questionType === "single" || questionType === "multiple") {
      // At least 2 options
      if (options.length < 2) {
        toast({
          title: "Validation Error",
          description: "Add at least 2 options",
          variant: "destructive",
        });
        return false;
      }
      
      // All options should have text
      if (options.some(opt => !opt.text.trim())) {
        toast({
          title: "Validation Error",
          description: "All options must have text",
          variant: "destructive",
        });
        return false;
      }
      
      // At least one correct answer
      if (!options.some(opt => opt.isCorrect)) {
        toast({
          title: "Validation Error",
          description: "Select at least one correct answer",
          variant: "destructive",
        });
        return false;
      }
    } else if (questionType === "text" && !correctTextAnswer.trim()) {
      toast({
        title: "Validation Error",
        description: "Correct answer text is required",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !quizId) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const questionData = {
        quizId,
        text: questionText,
        type: questionType,
        points,
        options: questionType === "text" ? [] : options,
        answer: questionType === "text" ? correctTextAnswer : "",
      };
      
      if (editingQuestionId) {
        // Update existing question
        await quizAPI.updateQuestion(quizId, editingQuestionId, questionData);
        toast({
          title: "Success",
          description: "Question updated successfully",
        });
      } else {
        // Create new question
        await quizAPI.createQuestion(quizId, questionData);
        toast({
          title: "Success",
          description: "Question added successfully",
        });
      }
      
      // Refresh questions list
      resetForm();
      fetchQuizData();
      
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save question",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditQuestion = (question: any) => {
    setEditingQuestionId(question._id);
    setQuestionText(question.text);
    setQuestionType(question.type);
    setPoints(question.points);
    
    if (question.type === "text") {
      setCorrectTextAnswer(question.answer);
      setOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }]);
    } else {
      setOptions(question.options || []);
      setCorrectTextAnswer("");
    }
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handleDeleteQuestion = async (questionId: string) => {
    if (!quizId) {
      toast({
        title: "Error",
        description: "Quiz ID is missing",
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await quizAPI.deleteQuestion(quizId, questionId);
        toast({
          title: "Success",
          description: "Question deleted successfully",
        });
        fetchQuizData();
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to delete question",
          variant: "destructive",
        });
      }
    }
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!quiz) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">
          <h3 className="text-xl font-medium">Quiz not found</h3>
          <p className="text-gray-500 mt-2">The requested quiz could not be found.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quiz Questions</h1>
          <p className="text-gray-600">
            {quiz.title} - {questions.length} questions
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{editingQuestionId ? "Edit Question" : "Add New Question"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question-text">Question</Label>
                <Textarea
                  id="question-text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter your question"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="question-type">Question Type</Label>
                  <Select
                    value={questionType}
                    onValueChange={(value) => {
                      setQuestionType(value);
                      // Reset options when type changes
                      if (value === "text") {
                        setOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }]);
                      } else if (value === "single") {
                        setOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }]);
                      }
                    }}
                  >
                    <SelectTrigger id="question-type">
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Choice</SelectItem>
                      <SelectItem value="multiple">Multiple Choice</SelectItem>
                      <SelectItem value="text">Text Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              {(questionType === "single" || questionType === "multiple") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                      <Plus className="h-4 w-4 mr-1" /> Add Option
                    </Button>
                  </div>
                  
                  {questionType === "single" && (
                    <RadioGroup value={options.findIndex(o => o.isCorrect).toString()}>
                      {options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={index.toString()}
                            id={`option-${index}`}
                            onClick={() => handleSingleOptionSelect(index)}
                          />
                          <Input
                            className="flex-1"
                            value={option.text}
                            onChange={(e) => handleOptionTextChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                          {options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  
                  {questionType === "multiple" && (
                    <div className="space-y-2">
                      {options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`option-${index}`}
                            checked={option.isCorrect}
                            onCheckedChange={(checked) => handleMultipleOptionSelect(index, Boolean(checked))}
                          />
                          <Input
                            className="flex-1"
                            value={option.text}
                            onChange={(e) => handleOptionTextChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                          {options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {questionType === "text" && (
                <div>
                  <Label htmlFor="correct-answer">Correct Answer</Label>
                  <Input
                    id="correct-answer"
                    value={correctTextAnswer}
                    onChange={(e) => setCorrectTextAnswer(e.target.value)}
                    placeholder="Enter the correct answer"
                  />
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingQuestionId ? (
                    "Update Question"
                  ) : (
                    "Add Question"
                  )}
                </Button>
                
                {editingQuestionId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quiz Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No questions added yet</h3>
                <p className="text-gray-500 mt-2">Add your first question using the form above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question._id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="mb-2">
                            <span className="font-semibold">Q{index + 1}.</span> {question.text}
                          </p>
                          
                          {(question.type === "single" || question.type === "multiple") && (
                            <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                              {question.options.map((option: any, optIndex: number) => (
                                <li key={optIndex} className={option.isCorrect ? "text-green-600 font-medium" : ""}>
                                  {option.text} {option.isCorrect && "(Correct)"}
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          {question.type === "text" && (
                            <p className="pl-4 text-sm">
                              <span className="font-medium">Correct answer:</span> {question.answer}
                            </p>
                          )}
                          
                          <div className="mt-2 flex items-center text-sm">
                            <span className="bg-gray-100 px-2 py-0.5 rounded mr-2">{question.type}</span>
                            <span className="text-gray-600">{question.points} {question.points === 1 ? "point" : "points"}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question._id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
