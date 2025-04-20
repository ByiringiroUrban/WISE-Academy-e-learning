
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userAPI, courseAPI, quizAPI } from '../lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: any) => Promise<void>;
  verified: boolean;
  checkAuthStatus: () => Promise<boolean>;
  getAllCourses: () => Promise<any[]>;
  getCourseByKey: (courseKey: string) => Promise<any>;
  getQuizzes: () => Promise<any[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Check if user is logged in on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await userAPI.getCurrentUser();
      const userData = response.data.data.user;
      setUser(userData);
      setVerified(true);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      setUser(null);
      setVerified(false);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Using mock login for now
      const mockUser = {
        _id: '123',
        name: 'Test User',
        email,
        role: 3, // Student role
      };
      setUser(mockUser);
      setVerified(true);
      setIsAuthenticated(true);
      toast({
        title: 'Success',
        description: 'You have successfully logged in',
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      // Mock registration
      const mockUser = {
        _id: '123',
        name: userData.name,
        email: userData.email,
        role: 3, // Student role
      };
      setUser(mockUser);
      setVerified(true);
      setIsAuthenticated(true);
      toast({
        title: 'Success',
        description: 'Registration successful',
      });
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'Registration failed',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // Mock logout
      setUser(null);
      setVerified(false);
      setIsAuthenticated(false);
      toast({
        title: 'Success',
        description: 'You have been logged out',
      });
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast({
        title: 'Logout failed',
        description: error.response?.data?.message || 'Could not log out',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userData: any) => {
    try {
      setIsLoading(true);
      if (!user) throw new Error('Not authenticated');
      
      // Update user profile
      await userAPI.updateUser(user._id, userData);
      
      // Update local user state
      setUser({ ...user, ...userData });
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      console.error('Profile update failed:', error);
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'Could not update profile',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllCourses = async () => {
    try {
      const response = await courseAPI.getCourses();
      return response.data.data.courses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  };

  const getCourseByKey = async (courseKey: string) => {
    try {
      const response = await courseAPI.getCourseDetails(courseKey);
      return response.data.data.course;
    } catch (error) {
      console.error(`Error fetching course ${courseKey}:`, error);
      return null;
    }
  };

  const getQuizzes = async () => {
    try {
      const response = await quizAPI.getCourseQuizzes("all");
      return response.data.data.quizzes;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return [];
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserProfile,
    verified,
    checkAuthStatus,
    getAllCourses,
    getCourseByKey,
    getQuizzes,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
