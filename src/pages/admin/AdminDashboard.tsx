
import { useEffect, useState } from "react";
import { userAPI, courseAPI, categoryAPI, enrollmentAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalCategories: 0,
    totalEnrollments: 0,
    usersByRole: {
      admin: 0,
      instructor: 0,
      student: 0,
    },
    recentUsers: [] as any[],
    recentCourses: [] as any[],
    monthlyCounts: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching dashboard data...");
        
        // Fetch users
        const usersResponse = await userAPI.getAllUsers({ size: 100 });
        const users = usersResponse.data.data.users || [];
        console.log("Users data:", users.length, "users found");
        
        // Fetch courses
        const coursesResponse = await courseAPI.getAllCourses({ size: 100 });
        const courses = coursesResponse.data.data.courses || [];
        console.log("Courses data:", courses.length, "courses found");
        
        // Fetch categories
        const categoriesResponse = await categoryAPI.getCategories();
        const categories = categoriesResponse.data.data.categories || [];
        console.log("Categories data:", categories.length, "categories found");
        
        // Fetch enrollments (if endpoint available)
        let enrollments = [];
        let totalEnrollments = 0;
        
        try {
          // Try to get actual enrollment data if available
          const enrollmentResponse = await enrollmentAPI.getUserEnrollments();
          enrollments = enrollmentResponse.data.data.enrollments || [];
          totalEnrollments = enrollments.length;
          console.log("Enrollments data:", totalEnrollments, "enrollments found");
        } catch (enrollError) {
          console.log("Could not fetch enrollments directly, estimating from courses");
          // If direct enrollment API fails, estimate from course enrollment counts
          courses.forEach((course: any) => {
            totalEnrollments += course.totalEnrollment || 0;
          });
        }
        
        // Calculate statistics
        const adminCount = users.filter((user: any) => user.role === 1).length;
        const instructorCount = users.filter((user: any) => user.role === 2).length;
        const studentCount = users.filter((user: any) => user.role === 3).length;
        
        // Sort users and courses by date (newest first)
        const sortedUsers = [...users].sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        const sortedCourses = [...courses].sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        // Generate monthly growth data based on timestamps
        const monthlyCounts = generateMonthlyGrowthData(users, courses);
        
        setStats({
          totalUsers: users.length,
          totalCourses: courses.length,
          totalCategories: categories.length,
          totalEnrollments,
          usersByRole: {
            admin: adminCount,
            instructor: instructorCount,
            student: studentCount,
          },
          recentUsers: sortedUsers.slice(0, 5),
          recentCourses: sortedCourses.slice(0, 5),
          monthlyCounts,
        });
        
        console.log("Dashboard data loaded successfully");
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Helper function to generate monthly growth data from timestamps
  const generateMonthlyGrowthData = (users: any[], courses: any[]) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    
    // Get the current month and go back 6 months
    const now = new Date();
    const currentMonth = now.getMonth();
    
    // Create data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = now.getFullYear() - (currentMonth < i ? 1 : 0);
      
      // Count users and courses created in this month
      const monthUsers = users.filter(user => {
        const date = new Date(user.createdAt);
        return date.getMonth() === monthIndex && date.getFullYear() === year;
      }).length;
      
      const monthCourses = courses.filter(course => {
        const date = new Date(course.createdAt);
        return date.getMonth() === monthIndex && date.getFullYear() === year;
      }).length;
      
      data.push({
        name: monthNames[monthIndex],
        users: monthUsers,
        courses: monthCourses
      });
    }
    
    return data;
  };

  // Data for charts
  const userRoleData = [
    { name: "Admins", value: stats.usersByRole.admin },
    { name: "Instructors", value: stats.usersByRole.instructor },
    { name: "Students", value: stats.usersByRole.student },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your platform statistics and activity.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all roles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Published and drafts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCategories}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Course categories
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Student enrollments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        value,
                        index,
                      }: {
                        cx: number;
                        cy: number;
                        midAngle: number;
                        innerRadius: number;
                        outerRadius: number;
                        value: number;
                        index: number;
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = 25 + innerRadius + (outerRadius - innerRadius);
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#000"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                          >
                            {userRoleData[index].name} ({value})
                          </text>
                        );
                      }}
                    >
                      {userRoleData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Monthly Growth Chart - Real data */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Growth</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyCounts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      name="New Users"
                    />
                    <Line
                      type="monotone"
                      dataKey="courses"
                      stroke="#82ca9d"
                      name="New Courses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="users">Recent Users</TabsTrigger>
            <TabsTrigger value="courses">Recent Courses</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recently Registered Users</CardTitle>
                  <Link to="/admin/users">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {stats.recentUsers.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No users found</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stats.recentUsers.map((user: any) => (
                        <div
                          key={user._id}
                          className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold mr-3">
                            {user.name?.charAt(0) || "U"}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{user.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{user.email}</span>
                              <span>•</span>
                              <span>
                                {user.role === 1
                                  ? "Admin"
                                  : user.role === 2
                                  ? "Instructor"
                                  : "Student"}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(user.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recently Created Courses</CardTitle>
                  <Link to="/admin/courses">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {stats.recentCourses.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No courses found</p>
                  ) : (
                    <div className="space-y-4">
                      {stats.recentCourses.map((course: any) => (
                        <div
                          key={course._id}
                          className="flex flex-col sm:flex-row p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="sm:w-1/4 bg-gray-200 h-20 sm:h-24 rounded mb-4 sm:mb-0">
                            {course.image && (
                              <img 
                                src={`/api/v1/files/${course.image}`} 
                                alt={course.title}
                                className="object-cover w-full h-full rounded"
                              />
                            )}
                          </div>
                          <div className="sm:ml-4 flex-1">
                            <h4 className="font-medium">{course.title}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                              {course.subTitle || "No description available"}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>Created: {formatDate(course.createdAt)}</span>
                              <span>•</span>
                              <span>
                                {course.paid
                                  ? `$${course.price?.amount || 0}`
                                  : "Free"}
                              </span>
                              <span>•</span>
                              <span>
                                Status:{" "}
                                {course.isPublished ? "Published" : "Draft"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
