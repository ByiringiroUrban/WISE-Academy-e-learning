
import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
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
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { quizAPI, courseAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Check } from "lucide-react";

// Define the form schema
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  desc: z.string().min(10, "Description must be at least 10 characters"),
  courseId: z.string().min(1, "Please select a course"),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  title: string;
  options: QuestionOption[];
}

interface QuizFormProps {
  onSubmitSuccess: () => void;
  initialData?: any | null;
}

export default function QuizForm({ 
  onSubmitSuccess, 
  initialData = null 
}: QuizFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([
    { 
      id: `q-${Date.now()}`, 
      title: "", 
      options: [
        { id: `opt-${Date.now()}-1`, text: "", isCorrect: true },
        { id: `opt-${Date.now()}-2`, text: "", isCorrect: false },
      ]
    }
  ]);

  // Initialize form
  const form = useForm<FormSchemaType>({
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
    if (initialData && initialData.questions) {
      const formattedQuestions = initialData.questions.map((q: any) => {
        // Convert backend question format to our format
        return {
          id: `q-${Date.now()}-${Math.random()}`,
          title: q.title,
          options: q.options.map((opt: any, index: number) => ({
            id: `opt-${Date.now()}-${index}-${Math.random()}`,
            text: opt.text,
            isCorrect: opt.isCorrect,
          }))
        };
      });
      
      setQuestions(formattedQuestions.length > 0 ? formattedQuestions : questions);
    }
  }, [initialData, toast]);

  // Add new question field
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        id: `q-${Date.now()}`, 
        title: "", 
        options: [
          { id: `opt-${Date.now()}-1`, text: "", isCorrect: true },
          { id: `opt-${Date.now()}-2`, text: "", isCorrect: false },
        ]
      }
    ]);
  };

  // Remove question field
  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    } else {
      toast({
        title: "Error",
        description: "A quiz must have at least one question",
        variant: "destructive",
      });
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

  // Add option to a question
  const addOption = (questionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [
              ...q.options,
              { id: `opt-${Date.now()}-${q.options.length + 1}`, text: "", isCorrect: false }
            ]
          };
        }
        return q;
      })
    );
  };

  // Remove option from a question
  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          // Ensure at least two options remain
          if (q.options.length <= 2) {
            toast({
              title: "Error",
              description: "A question must have at least two options",
              variant: "destructive",
            });
            return q;
          }
          
          // If removing the correct option, make the first remaining option correct
          const isRemovingCorrect = q.options.find(o => o.id === optionId)?.isCorrect;
          
          const filteredOptions = q.options.filter(o => o.id !== optionId);
          
          if (isRemovingCorrect && filteredOptions.length > 0) {
            filteredOptions[0].isCorrect = true;
          }
          
          return {
            ...q,
            options: filteredOptions
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
          return {
            ...q,
            options: q.options.map(o => 
              o.id === optionId ? { ...o, text } : o
            )
          };
        }
        return q;
      })
    );
  };

  // Set option as correct
  const setCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map(o => ({
              ...o,
              isCorrect: o.id === optionId
            }))
          };
        }
        return q;
      })
    );
  };

  // Form submission handler
  const onSubmit: SubmitHandler<FormSchemaType> = async (values) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting quiz with values:", values);
      console.log("Questions:", questions);

      // Validate questions and options
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
      
      // Check each question has a title and at least 2 options with text
      for (const question of validQuestions) {
        const validOptions = question.options.filter(o => o.text.trim());
        
        if (validOptions.length < 2) {
          toast({
            title: "Validation Error",
            description: `Question "${question.title}" must have at least 2 options`,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        // Ensure each question has a correct answer
        const hasCorrectOption = question.options.some(o => o.isCorrect);
        
        if (!hasCorrectOption) {
          toast({
            title: "Validation Error",
            description: `Please select a correct answer for question "${question.title}"`,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Format questions for API
      const formattedQuestions = validQuestions.map(q => ({
        title: q.title,
        options: q.options.filter(o => o.text.trim()).map(o => ({
          text: o.text,
          isCorrect: o.isCorrect
        }))
      }));

      const quizData = {
        ...values,
        questions: formattedQuestions
      };

      console.log("Formatted quiz data:", quizData);

      if (initialData?._id) {
        // Update existing quiz
        const response = await quizAPI.updateQuiz(initialData._id, quizData);
        console.log("Update quiz response:", response);
        toast({
          title: "Success",
          description: "Quiz updated successfully",
        });
      } else {
        // Create new quiz
        const response = await quizAPI.createQuiz(quizData);
        console.log("Create quiz response:", response);
        toast({
          title: "Success",
          description: "Quiz created successfully",
        });
      }

      onSubmitSuccess();
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
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quiz Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter quiz title" {...field} />
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
                    placeholder="Enter quiz description" 
                    rows={3}
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
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Questions</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addQuestion}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {questions.map((question, qIndex) => (
            <Card key={question.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Question {qIndex + 1}</label>
                      <Input
                        placeholder="Enter question"
                        value={question.title}
                        onChange={(e) => updateQuestionTitle(question.id, e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Options</label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addOption(question.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </Button>
                    </div>

                    <RadioGroup 
                      value={question.options.find(o => o.isCorrect)?.id || ""}
                      onValueChange={(value) => setCorrectOption(question.id, value)}
                    >
                      {question.options.map((option, oIndex) => (
                        <div key={option.id} className="flex items-center gap-3 mt-2">
                          <RadioGroupItem 
                            value={option.id} 
                            id={option.id}
                            className="flex-shrink-0"
                          />
                          <div className="flex-1">
                            <Input
                              placeholder={`Option ${oIndex + 1}`}
                              value={option.text}
                              onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="flex-shrink-0 text-red-500 hover:text-red-700"
                            onClick={() => removeOption(question.id, option.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </RadioGroup>
                    
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Select the radio button next to the correct answer
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSubmitSuccess()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {initialData ? "Update Quiz" : "Create Quiz"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
