
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { assignmentAPI, courseAPI, fileAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

// Define the form schema with proper types
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  desc: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day"),
  courseId: z.string().min(1, "Please select a course"),
  instructionDesc: z.string().optional(),
});

// Infer the form schema type
type FormSchemaType = z.infer<typeof formSchema>;

type Question = {
  id: string;
  title: string;
  correctAnswer: string;
};

interface AssignmentFormProps {
  onSubmitSuccess: (assignment: any) => void;
  initialData?: any | null;
}

export default function AssignmentForm({ 
  onSubmitSuccess, 
  initialData = null 
}: AssignmentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [instructionFile, setInstructionFile] = useState<File | null>(null);
  const [instructionVideo, setInstructionVideo] = useState<File | null>(null);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [solutionVideo, setSolutionVideo] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([
    { id: `q-${Date.now()}`, title: "", correctAnswer: "" }
  ]);

  // Initialize form with proper typing
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData 
      ? {
          title: initialData.title,
          desc: initialData.desc,
          duration: Number(initialData.duration),
          courseId: initialData.courseId,
          instructionDesc: initialData.instructionDesc || "",
        }
      : {
          title: "",
          desc: "",
          duration: 7,
          courseId: "",
          instructionDesc: "",
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
      setQuestions(
        initialData.questions.map((q: any) => ({
          id: `q-${Date.now()}-${Math.random()}`,
          title: q.title,
          correctAnswer: q.correctAnswer,
        }))
      );
    }
  }, [initialData, toast]);

  // Handle file uploads
  const handleFileUpload = async (file: File, fileType: string) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fileAPI.uploadFile(formData);
      return response.data.data.file._id;
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${fileType}`,
        variant: "destructive",
      });
      return null;
    }
  };

  // Add new question field
  const addQuestionField = () => {
    setQuestions([
      ...questions,
      { id: `q-${Date.now()}`, title: "", correctAnswer: "" }
    ]);
  };

  // Remove question field
  const removeQuestionField = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  // Update question
  const updateQuestion = (id: string, field: 'title' | 'correctAnswer', value: string) => {
    setQuestions(
      questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  // Form submission handler
  const onSubmit: SubmitHandler<FormSchemaType> = async (values) => {
    try {
      setIsSubmitting(true);

      // Validate questions
      const validQuestions = questions.filter(q => q.title.trim() && q.correctAnswer.trim());
      if (validQuestions.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one question with an answer is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Upload files if selected
      let instructionVideoId = null;
      let instructionFileId = null;
      let solutionVideoId = null;
      let solutionFileId = null;

      if (instructionVideo) {
        instructionVideoId = await handleFileUpload(instructionVideo, "instruction video");
      }

      if (instructionFile) {
        instructionFileId = await handleFileUpload(instructionFile, "instruction file");
      }

      if (solutionVideo) {
        solutionVideoId = await handleFileUpload(solutionVideo, "solution video");
      }

      if (solutionFile) {
        solutionFileId = await handleFileUpload(solutionFile, "solution file");
      }

      // Prepare assignment data
      const assignmentData = {
        ...values,
        questions: validQuestions.map(q => ({
          title: q.title,
          correctAnswer: q.correctAnswer,
        })),
        ...(instructionVideoId && { instructionVideoId }),
        ...(instructionFileId && { instructionFileId }),
        ...(solutionVideoId && { solutionVideoId }),
        ...(solutionFileId && { solutionFileId }),
      };

      // Submit to API
      let response;
      if (initialData) {
        response = await assignmentAPI.updateAssignment(initialData._id, assignmentData);
      } else {
        response = await assignmentAPI.createAssignment(assignmentData);
      }

      toast({
        title: "Success",
        description: initialData 
          ? "Assignment updated successfully" 
          : "Assignment created successfully",
      });

      onSubmitSuccess(response.data.data.assignment);
    } catch (error: any) {
      console.error("Error saving assignment:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save assignment",
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
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? "Edit Assignment" : "Create Assignment"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Title</FormLabel>
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
                      placeholder="Description of the assignment" 
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

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (days)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="30" 
                      placeholder="Number of days" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Instruction Resources</h3>
              
              <FormField
                control={form.control}
                name="instructionDesc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Instructions for students" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormLabel>Instruction Video</FormLabel>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setInstructionVideo(e.target.files[0]);
                        }
                      }}
                    />
                    {instructionVideo && (
                      <p className="text-sm mt-2">Selected: {instructionVideo.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <FormLabel>Instruction File</FormLabel>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setInstructionFile(e.target.files[0]);
                        }
                      }}
                    />
                    {instructionFile && (
                      <p className="text-sm mt-2">Selected: {instructionFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Solution Resources (For Instructors)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormLabel>Solution Video</FormLabel>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSolutionVideo(e.target.files[0]);
                        }
                      }}
                    />
                    {solutionVideo && (
                      <p className="text-sm mt-2">Selected: {solutionVideo.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <FormLabel>Solution File</FormLabel>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSolutionFile(e.target.files[0]);
                        }
                      }}
                    />
                    {solutionFile && (
                      <p className="text-sm mt-2">Selected: {solutionFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Questions</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addQuestionField}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Question
                </Button>
              </div>
              
              {questions.map((question, index) => (
                <div key={question.id} className="space-y-3 p-4 border rounded-md">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestionField(question.id)}
                      disabled={questions.length <= 1}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Question</FormLabel>
                    <Textarea
                      placeholder="Enter your question"
                      value={question.title}
                      onChange={(e) => updateQuestion(question.id, 'title', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Answer</FormLabel>
                    <Textarea
                      placeholder="Enter the correct answer"
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Assignment" : "Create Assignment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
