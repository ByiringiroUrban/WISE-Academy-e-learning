
import { useState, useEffect } from "react";
import { userAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  User, 
  UserCog, 
  UserX,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'role' | 'delete' | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  
  const fetchUsers = async (searchTerm = "", pageNum = 1) => {
    setIsLoading(true);
    try {
      const params = {
        q: searchTerm,
        page: pageNum,
        size: 10
      };
      
      const response = await userAPI.getAllUsers(params);
      setUsers(response.data?.data?.users || []);
      setTotalPages(response.data?.data?.totalPage || 1);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers(searchQuery, page);
  }, [page, toast]);

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchUsers(searchQuery, 1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleActionClick = (user: any, action: 'role' | 'delete') => {
    setCurrentUser(user);
    setActionType(action);
    
    if (action === 'role') {
      setNewRole(user.role.toString());
    }
    
    setIsActionDialogOpen(true);
  };

  const handleRoleChange = async () => {
    if (!currentUser || !newRole) return;
    
    try {
      await userAPI.changeUserRole(currentUser._id, parseInt(newRole));
      
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      
      // Refresh user list
      fetchUsers(searchQuery, page);
      
      // Close dialog
      setIsActionDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    
    try {
      await userAPI.deleteUser(currentUser._id);
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      // Refresh user list
      fetchUsers(searchQuery, page);
      
      // Close dialog
      setIsActionDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: number) => {
    let color = "";
    let label = "";
    
    switch (role) {
      case 1:
        color = "bg-red-100 text-red-800 border-red-200";
        label = "Admin";
        break;
      case 2:
        color = "bg-blue-100 text-blue-800 border-blue-200";
        label = "Instructor";
        break;
      case 3:
        color = "bg-green-100 text-green-800 border-green-200";
        label = "Student";
        break;
      default:
        color = "bg-gray-100 text-gray-800 border-gray-200";
        label = "Unknown";
    }
    
    return <Badge className={color}>{label}</Badge>;
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage all users in the system
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  className="w-full md:w-64 pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No users found</h3>
              <p className="mt-1 text-gray-500">
                {searchQuery ? "Try a different search term" : "There are no users in the system yet"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleActionClick(user, 'role')}>
                              <UserCog className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleActionClick(user, 'delete')}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog for role change or delete confirmation */}
      {currentUser && (
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent>
            {actionType === 'role' && (
              <>
                <DialogHeader>
                  <DialogTitle>Change User Role</DialogTitle>
                  <DialogDescription>
                    Change the role for {currentUser.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select New Role</label>
                      <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Admin</SelectItem>
                          <SelectItem value="2">Instructor</SelectItem>
                          <SelectItem value="3">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleRoleChange}>Save Changes</Button>
                </DialogFooter>
              </>
            )}
            
            {actionType === 'delete' && (
              <>
                <DialogHeader>
                  <DialogTitle>Delete User</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete {currentUser.name}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDeleteUser}>
                    Delete User
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
