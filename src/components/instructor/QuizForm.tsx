import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { quizAPI, courseAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

// Define form schema
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  desc: z.string().min(10, "Description must be at least 10 characters"),
  courseId: z.string().min(1, "Please select a course"),
});

type Question = {
  id: string;
  title: string;
  options: { id: string; text: string }[];
  correctOption: string;
  type: "single" | "multiple" | "true-false";
  correctMultipleOptions?: string[];
  correctBoolean?: boolean;
};

export default function QuizForm({ 
  onSubmitSuccess, 
  initialData = null 
}: { 
  onSubmitSuccess: (quiz: any) => void,
  initialData?: any | null
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([
    { 
      id: `q-${Date.now()}`, 
      title: "", 
      options: [
        { id: `opt-${Date.now()}-1`, text: "" },
        { id: `opt-${Date.now()}-2`, text: "" },
      ],
      correctOption: "",
      type: "single",
    }
  ]);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData 
      ? {
          title: initialData.title,
          desc: initialData.desc,
          courseId: initialData.courseId,
        }
      : {
          title: "",
          desc: "",
          courseId: "",
        },
  });

  // Load courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const response = await courseAPI.getInstructorCourses();
        setCourses(response.data.data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();

    // Load questions if editing
    if (initialData && initialData.questions && initialData.questions.length > 0) {
      // Process existing questions into our internal format
      const processedQuestions: Question[] = initialData.questions.map((q: any) => {
        // Determine question type
        let type: "single" | "multiple" | "true-false" = "single";
        if (q.options && q.options.length === 2 && 
            (q.options[0].toLowerCase() === "true" || q.options[0].toLowerCase() === "false") && 
            (q.options[1].toLowerCase() === "true" || q.options[1].toLowerCase() === "false")) {
          type = "true-false";
        } else if (q.correctMultipleOptions && q.correctMultipleOptions.length > 1) {
          type = "multiple";
        }

        // Format options
        const options = q.options ? q.options.map((opt: string, i: number) => ({
          id: `opt-${Date.now()}-${i}`,
          text: opt
        })) : [];

        // Ensure at least 2 options
        if (options.length < 2) {
          options.push({ id: `opt-${Date.now()}-1`, text: "" });
          options.push({ id: `opt-${Date.now()}-2`, text: "" });
        }

        return {
          id: `q-${Date.now()}-${Math.random()}`,
          title: q.title || "",
          options,
          correctOption: q.correctOption || "",
          type,
          correctMultipleOptions: q.correctMultipleOptions || [],
          correctBoolean: q.correctBoolean === true,
        };
      });

      setQuestions(processedQuestions.length > 0 ? processedQuestions : questions);
    }
  }, [initialData]);

  // Add new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        id: `q-${Date.now()}`, 
        title: "", 
        options: [
          { id: `opt-${Date.now()}-1`, text: "" },
          { id: `opt-${Date.now()}-2`, text: "" },
        ],
        correctOption: "",
        type: "single",
      }
    ]);
  };

  // Remove question
  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  // Update question title
  const updateQuestionTitle = (id: string, title: string) => {
    setQuestions(
      questions.map(q => 
        q.id === id ? { ...q, title } : q
      )
    );
  };

  // Add option to question
  const addOption = (questionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [
              ...q.options,
              { id: `opt-${Date.now()}-${q.options.length + 1}`, text: "" }
            ]
          };
        }
        return q;
      })
    );
  };

  // Remove option from question
  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId && q.options.length > 2) {
          // Update correctOption if we're removing the selected one
          const option = q.options.find(o => o.id === optionId);
          let updatedQ = { ...q };
          
          if (q.correctOption === option?.text) {
            updatedQ.correctOption = "";
          }
          
          if (q.correctMultipleOptions?.includes(option?.text || "")) {
            updatedQ.correctMultipleOptions = updatedQ.correctMultipleOptions?.filter(
              opt => opt !== option?.text
            );
          }
          
          return {
            ...updatedQ,
            options: q.options.filter(o => o.id !== optionId)
          };
        }
        return q;
      })
    );
  };

  // Update option text
  const updateOptionText = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          // If this option was selected as correct, update the correctOption value too
          let updatedQ = { ...q };
          const oldOption = q.options.find(o => o.id === optionId);
          
          if (oldOption && q.correctOption === oldOption.text) {
            updatedQ.correctOption = text;
          }
          
          if (oldOption && q.correctMultipleOptions?.includes(oldOption.text)) {
            updatedQ.correctMultipleOptions = updatedQ.correctMultipleOptions?.map(
              opt => opt === oldOption.text ? text : opt
            );
          }
          
          return {
            ...updatedQ,
            options: q.options.map(o => 
              o.id === optionId ? { ...o, text } : o
            )
          };
        }
        return q;
      })
    );
  };

  // Set correct option for single-choice questions
  const setCorrectOption = (questionId: string, optionText: string) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId ? { ...q, correctOption: optionText } : q
      )
    );
  };

  // Toggle correct option for multiple-choice questions
  const toggleCorrectMultipleOption = (questionId: string, optionText: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          const correctOptions = q.correctMultipleOptions || [];
          let updatedCorrectOptions;
          
          if (correctOptions.includes(optionText)) {
            updatedCorrectOptions = correctOptions.filter(opt => opt !== optionText);
          } else {
            updatedCorrectOptions = [...correctOptions, optionText];
          }
          
          return { ...q, correctMultipleOptions: updatedCorrectOptions };
        }
        return q;
      })
    );
  };

  // Set correct boolean answer for true/false questions
  const setCorrectBoolean = (questionId: string, value: boolean) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId ? { ...q, correctBoolean: value } : q
      )
    );
  };

  // Set question type
  const setQuestionType = (questionId: string, type: "single" | "multiple" | "true-false") => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          const newQuestion = { ...q, type };
          
          // Reset correct answers when changing type
          if (type === "single") {
            newQuestion.correctOption = "";
            newQuestion.correctBoolean = undefined;
            newQuestion.correctMultipleOptions = [];
          } else if (type === "multiple") {
            newQuestion.correctOption = "";
            newQuestion.correctBoolean = undefined;
            newQuestion.correctMultipleOptions = [];
          } else if (type === "true-false") {
            newQuestion.correctOption = "";
            newQuestion.correctMultipleOptions = [];
            newQuestion.correctBoolean = undefined;
            
            // Set options to True/False
            newQuestion.options = [
              { id: `opt-${Date.now()}-1`, text: "True" },
              { id: `opt-${Date.now()}-2`, text: "False" }
            ];
          }
          
          return newQuestion;
        }
        return q;
      })
    );
  };

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Validate questions
      const validQuestions = questions.filter(q => q.title.trim());
      
      if (validQuestions.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one question is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      for (const q of validQuestions) {
        // Validate options
        if (q.type !== "true-false" && q.options.some(o => !o.text.trim())) {
          toast({
            title: "Validation Error",
            description: "All options must have text",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        // Validate correct answers
        if (q.type === "single" && !q.correctOption) {
          toast({
            title: "Validation Error",
            description: "Each single-choice question must have a correct option selected",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        } else if (q.type === "multiple" && (!q.correctMultipleOptions || q.correctMultipleOptions.length === 0)) {
          toast({
            title: "Validation Error",
            description: "Each multiple-choice question must have at least one correct option selected",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        } else if (q.type === "true-false" && q.correctBoolean === undefined) {
          toast({
            title: "Validation Error",
            description: "Each true/false question must have a correct answer selected",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Format questions for API
      const formattedQuestions = validQuestions.map(q => {
        if (q.type === "single") {
          return {
            title: q.title,
            options: q.options.map(o => o.text),
            correctOption: q.correctOption,
          };
        } else if (q.type === "multiple") {
          return {
            title: q.title,
            options: q.options.map(o => o.text),
            correctMultipleOptions: q.correctMultipleOptions || [],
          };
        } else { // true-false type
          return {
            title: q.title,
            options: ["True", "False"],
            correctBoolean: q.correctBoolean,
          };
        }
      }).filter(Boolean);

      // Prepare quiz data
      const quizData = {
        ...values,
        questions: formattedQuestions,
      };

      // Submit to API
      let response;
      if (initialData) {
        response = await quizAPI.updateQuiz(initialData._id, quizData);
      } else {
        response = await quizAPI.createQuiz(quizData);
      }

      toast({
        title: "Success",
        description: initialData ? "Quiz updated successfully" : "Quiz created successfully",
      });

      onSubmitSuccess(response.data.data.quiz);
    } catch (error: any) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save quiz",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quiz Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="desc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Description of the quiz" 
                    className="min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Questions</h3>
            <Button 
              type="button" 
              variant="outline" 
              onClick={addQuestion}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Question
            </Button>
          </div>
          
          {questions.map((question, qIndex) => (
            <Card key={question.id} className="p-4">
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Question {qIndex + 1}</h4>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={question.type} 
                      onValueChange={(value) => setQuestionType(
                        question.id, 
                        value as "single" | "multiple" | "true-false"
                      )}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Question Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Choice</SelectItem>
                        <SelectItem value="multiple">Multiple Choice</SelectItem>
                        <SelectItem value="true-false">True/False</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                      disabled={questions.length <= 1}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea
                    placeholder="Enter your question"
                    value={question.title}
                    onChange={(e) => updateQuestionTitle(question.id, e.target.value)}
                  />
                </div>
                
                {question.type === "true-false" ? (
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <RadioGroup 
                      value={question.correctBoolean === true ? "true" : question.correctBoolean === false ? "false" : ""}
                      onValueChange={(value) => setCorrectBoolean(question.id, value === "true")}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id={`${question.id}-true`} />
                        <Label htmlFor={`${question.id}-true`}>True</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id={`${question.id}-false`} />
                        <Label htmlFor={`${question.id}-false`}>False</Label>
                      </div>
                    </RadioGroup>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Options</Label>
                        {(question.type === "single" || question.type === "multiple") && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                          >
                            Add Option
                          </Button>
                        )}
                      </div>
                      
                      {question.options.map((option, oIndex) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          {question.type === "single" ? (
                            <RadioGroup 
                              value={question.correctOption}
                              onValueChange={(value) => setCorrectOption(question.id, value)}
                              className="flex items-center space-x-2 w-full"
                            >
                              <div className="flex items-center space-x-2 w-full">
                                <RadioGroupItem 
                                  value={option.text} 
                                  id={`${question.id}-${option.id}`} 
                                  className="flex-shrink-0"
                                />
                                <Input
                                  value={option.text}
                                  onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                                  placeholder={`Option ${oIndex + 1}`}
                                  className="flex-grow"
                                />
                                {question.options.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(question.id, option.id)}
                                    className="flex-shrink-0"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </RadioGroup>
                          ) : question.type === "multiple" ? (
                            <div className="flex items-center space-x-2 w-full">
                              <Checkbox 
                                id={`${question.id}-${option.id}`} 
                                checked={question.correctMultipleOptions?.includes(option.text) || false}
                                onCheckedChange={() => toggleCorrectMultipleOption(question.id, option.text)}
                                className="flex-shrink-0"
                              />
                              <Input
                                value={option.text}
                                onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                                className="flex-grow"
                              />
                              {question.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(question.id, option.id)}
                                  className="flex-shrink-0"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    {question.type === "multiple" && (
                      <p className="text-sm text-gray-500">
                        Check all options that are correct answers
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Quiz" : "Create Quiz"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
