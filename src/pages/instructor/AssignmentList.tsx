
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { assignmentAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Loader2, PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import AssignmentForm from "@/components/instructor/AssignmentForm";

export default function AssignmentList() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load assignments on component mount
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const response = await assignmentAPI.getAssignments();
        console.log("Assignments response:", response);
        setAssignments(response.data.data.assignments || []);
      } catch (error: any) {
        console.error("Error fetching assignments:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load assignments",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [toast, refreshTrigger]);

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(assignment => 
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle create/edit success
  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle assignment deletion
  const handleDeleteAssignment = async () => {
    if (!currentAssignment) return;
    
    try {
      await assignmentAPI.deleteAssignment(currentAssignment._id);
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error deleting assignment:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete assignment",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <CardTitle>Assignments</CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search assignments..."
                className="pl-8 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap" onClick={() => setCurrentAssignment(null)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create Assignment</DialogTitle>
                  <DialogDescription>
                    Create a new assignment for your students.
                  </DialogDescription>
                </DialogHeader>
                <AssignmentForm onSubmitSuccess={handleFormSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">
                {searchTerm 
                  ? "No assignments match your search" 
                  : "No assignments found. Create your first assignment!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Course</th>
                    <th className="text-left py-3 px-4">Duration</th>
                    <th className="text-left py-3 px-4">Created</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment) => {
                    const courseTitle = typeof assignment.courseId === 'object' 
                      ? assignment.courseId.title 
                      : 'Unknown Course';
                    
                    return (
                      <tr key={assignment._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{assignment.title}</td>
                        <td className="py-3 px-4">{courseTitle}</td>
                        <td className="py-3 px-4">{assignment.duration} days</td>
                        <td className="py-3 px-4">{formatDate(assignment.createdAt)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog open={isFormDialogOpen && currentAssignment?._id === assignment._id} onOpenChange={setIsFormDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setCurrentAssignment(assignment)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Assignment</DialogTitle>
                                  <DialogDescription>
                                    Update the assignment details.
                                  </DialogDescription>
                                </DialogHeader>
                                <AssignmentForm 
                                  initialData={currentAssignment}
                                  onSubmitSuccess={handleFormSuccess} 
                                />
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                setCurrentAssignment(assignment);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteAssignment}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
