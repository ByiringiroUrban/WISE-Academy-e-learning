
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssignmentList from "./AssignmentList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AssignmentManagement() {
  const [activeTab, setActiveTab] = useState("assignments");
  
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
                <p>Coming soon: Review student submissions here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
