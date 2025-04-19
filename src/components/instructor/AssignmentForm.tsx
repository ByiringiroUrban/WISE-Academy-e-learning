
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
      let instructionVideoId = initialData?.instructionVideoId || null;
      let instructionFileId = initialData?.instructionFileId || null;
      let solutionVideoId = initialData?.solutionVideoId || null;
      let solutionFileId = initialData?.solutionFileId || null;

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
        instructionVideoId,
        instructionFileId,
        solutionVideoId,
        solutionFileId,
        questions: validQuestions
      };

      let response;
      if (initialData?._id) {
        // Update existing assignment
        response = await assignmentAPI.updateAssignment(initialData._id, assignmentData);
        toast({
          title: "Success",
          description: "Assignment updated successfully",
        });
      } else {
        // Create new assignment
        response = await assignmentAPI.createAssignment(assignmentData);
        toast({
          title: "Success",
          description: "Assignment created successfully",
        });
      }

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
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignment Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter assignment title" {...field} />
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
                    placeholder="Enter assignment description" 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (days)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="instructionDesc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter instructions for students" 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Instruction Video (optional)</label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setInstructionVideo(file);
                  }
                }}
              />
              {instructionVideo && (
                <p className="text-sm text-gray-500 mt-1">{instructionVideo.name}</p>
              )}
              {initialData?.instructionVideoId && !instructionVideo && (
                <p className="text-sm text-gray-500 mt-1">Current video selected</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Instruction Files (optional)</label>
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setInstructionFile(file);
                  }
                }}
              />
              {instructionFile && (
                <p className="text-sm text-gray-500 mt-1">{instructionFile.name}</p>
              )}
              {initialData?.instructionFileId && !instructionFile && (
                <p className="text-sm text-gray-500 mt-1">Current file selected</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Solution Video (optional)</label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSolutionVideo(file);
                  }
                }}
              />
              {solutionVideo && (
                <p className="text-sm text-gray-500 mt-1">{solutionVideo.name}</p>
              )}
              {initialData?.solutionVideoId && !solutionVideo && (
                <p className="text-sm text-gray-500 mt-1">Current video selected</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Solution Files (optional)</label>
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSolutionFile(file);
                  }
                }}
              />
              {solutionFile && (
                <p className="text-sm text-gray-500 mt-1">{solutionFile.name}</p>
              )}
              {initialData?.solutionFileId && !solutionFile && (
                <p className="text-sm text-gray-500 mt-1">Current file selected</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Questions</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addQuestionField}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {questions.map((question, index) => (
            <Card key={question.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Question {index + 1}</label>
                      <Input
                        placeholder="Enter question"
                        value={question.title}
                        onChange={(e) => updateQuestion(question.id, 'title', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeQuestionField(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Correct Answer</label>
                    <Textarea
                      placeholder="Enter the correct answer"
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                      rows={2}
                    />
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
            onClick={() => onSubmitSuccess(initialData)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {initialData ? "Update Assignment" : "Create Assignment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
