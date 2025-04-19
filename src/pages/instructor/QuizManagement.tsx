
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
import { Plus, FileQuestion, Book, Pencil, Trash2 } from "lucide-react";

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  const handleQuizSubmitSuccess = () => {
    setDialogOpen(false);
    setCurrentQuiz(null);
    fetchQuizzes();
  };
  
  const handleDeleteQuiz = async () => {
    if (!currentQuiz) return;
    
    try {
      await quizAPI.deleteQuiz(currentQuiz._id);
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      fetchQuizzes();
    } catch (error: any) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete quiz",
        variant: "destructive",
      });
    }
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
            <Dialog open={dialogOpen && !currentQuiz} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setCurrentQuiz(null);
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2" onClick={() => {
                  setCurrentQuiz(null);
                  setDialogOpen(true);
                }}>
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
                  <QuizForm onSubmitSuccess={handleQuizSubmitSuccess} />
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
                          <Dialog open={dialogOpen && currentQuiz?._id === quiz._id} onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) setCurrentQuiz(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCurrentQuiz(quiz);
                                  setDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px]">
                              <DialogHeader>
                                <DialogTitle>Edit Quiz</DialogTitle>
                                <DialogDescription>
                                  Update the quiz details and questions
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <QuizForm 
                                  initialData={currentQuiz}
                                  onSubmitSuccess={handleQuizSubmitSuccess} 
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              setCurrentQuiz(quiz);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this quiz? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteQuiz}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
