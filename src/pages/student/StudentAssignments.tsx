
import { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssignmentsList from "@/components/student/AssignmentsList";
import { useAssignments } from "@/hooks/useAssignments";
import { Loader2 } from "lucide-react";

export default function StudentAssignments() {
  const { verified } = useRequireAuth();
  const [activeTab, setActiveTab] = useState("pending");
  
  const { pendingAssignments, submittedAssignments, isLoading } = useAssignments(verified);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading assignments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Assignments</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="pending">
            Pending ({pendingAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({submittedAssignments.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <AssignmentsList 
            assignments={pendingAssignments} 
            emptyMessage="You don't have any pending assignments."
          />
        </TabsContent>
        
        <TabsContent value="submitted">
          <AssignmentsList 
            assignments={submittedAssignments}
            emptyMessage="You haven't submitted any assignments yet."
            isSubmitted={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
