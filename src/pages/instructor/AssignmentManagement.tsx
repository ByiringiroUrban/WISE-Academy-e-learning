
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssignmentList from "./AssignmentList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { assignmentAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AssignmentSubmissionsList from "@/components/instructor/AssignmentSubmissionsList";

export default function AssignmentManagement() {
  const [activeTab, setActiveTab] = useState("assignments");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const response = await assignmentAPI.getAssignments();
        const assignmentsData = response.data.data.assignments || [];
        setAssignments(assignmentsData);
        
        // Set the first assignment as selected by default
        if (assignmentsData.length > 0) {
          setSelectedAssignmentId(assignmentsData[0]._id);
        }
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

    if (activeTab === "submissions") {
      fetchAssignments();
    }
  }, [activeTab, toast]);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assignment Management</h2>
          <p className="text-muted-foreground">
            Create and manage assignments for your courses
          </p>
        </div>
        
        <Tabs defaultValue="assignments" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="submissions">Student Submissions</TabsTrigger>
          </TabsList>
          <TabsContent value="assignments">
            <AssignmentList />
          </TabsContent>
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Student Submissions</CardTitle>
                <CardDescription>
                  Review and grade student assignment submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading assignments...</div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium">No assignments found</h3>
                    <p className="mt-1 text-gray-500">
                      Create assignments first before reviewing submissions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium">Select Assignment</label>
                      <Select
                        value={selectedAssignmentId}
                        onValueChange={setSelectedAssignmentId}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select an assignment" />
                        </SelectTrigger>
                        <SelectContent>
                          {assignments.map((assignment) => (
                            <SelectItem key={assignment._id} value={assignment._id}>
                              {assignment.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedAssignmentId && <AssignmentSubmissionsList assignmentId={selectedAssignmentId} />}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
