
import { useState, useEffect } from "react";
import { quizAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import QuizForm from "@/components/instructor/QuizForm";
import { formatDate } from "@/lib/utils";
import { Plus, FileQuestion, Book } from "lucide-react";

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const response = await quizAPI.getQuizzes();
      setQuizzes(response.data?.data?.quizs || []);
    } catch (error: any) {
      console.error("Error fetching quizzes:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load quizzes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchQuizzes();
  }, [toast]);

  const handleQuizCreated = () => {
    setDialogOpen(false);
    fetchQuizzes();
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quiz Management</h2>
          <p className="text-muted-foreground">
            Create and manage quizzes for your courses
          </p>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quizzes</CardTitle>
              <CardDescription>
                Create and manage course quizzes
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Quiz
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Create New Quiz</DialogTitle>
                  <DialogDescription>
                    Create a quiz for your students to complete
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <QuizForm onSubmitSuccess={handleQuizCreated} />
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <p>Loading quizzes...</p>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-8">
                <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No quizzes yet</h3>
                <p className="mt-1 text-gray-500">
                  Get started by creating your first quiz
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setDialogOpen(true)}
                >
                  Create Quiz
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz._id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Book className="h-4 w-4 mr-2 text-gray-500" />
                          {quiz.course?.title || "Unknown Course"}
                        </div>
                      </TableCell>
                      <TableCell>{quiz.questions?.length || 0} questions</TableCell>
                      <TableCell>{formatDate(quiz.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // This will be implemented later for editing quizzes
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
