import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, courseAPI, quizAPI, chatAPI } from '../lib/api'; // Ensure you import the APIs here
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: number; // 1: admin, 2: instructor, 3: student
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: number) => Promise<void>;
  logout: () => Promise<void>;
  redirectBasedOnRole: (userToRedirect?: User | null) => void;
  createCourse: (courseData: any) => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  getAllCourses: (params: any) => Promise<any>;
  getCourseByKey: (key: string) => Promise<any>;
  getQuizzes: () => Promise<any>;
  createChatConversation: (data: any) => Promise<any>;
  getConversations: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.getCurrentUser();
      if (response.data?.data?.user) {
        setUser(response.data.data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Auth check failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialCheck = async () => {
      await checkAuthStatus();
    };
    
    initialCheck();

    const intervalId = setInterval(() => {
      checkAuthStatus();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      if (response.data?.user) {
        setUser(response.data.user);
        toast({
          title: "Login successful",
          description: `Welcome back, ${response.data.user.name}!`
        });
        redirectBasedOnRole(response.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      toast({
        title: "Login failed",
        description: err.response?.data?.message || 'Please check your credentials and try again.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.register({ name, email, password, role });
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully."
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      toast({
        title: "Registration failed",
        description: err.response?.data?.message || 'Please check your information and try again.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
      setIsLoading(false);
      navigate('/');
    }
  };

  const createCourse = async (courseData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await courseAPI.createCourse(courseData);
      
      toast({
        title: "Course created",
        description: `Course "${response.data?.data?.title || 'Untitled'}" has been created successfully.`,
      });
      
      return response.data?.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Course creation failed');
      toast({
        title: "Course creation failed",
        description: err.response?.data?.message || 'Please check the course details and try again.',
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllCourses = async (params: any) => {
    setIsLoading(true);
    try {
      const response = await courseAPI.getAllCourses(params);
      return response.data; // or handle the data as needed
    } catch (err: any) {
      console.error('Failed to fetch courses:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getCourseByKey = async (key: string) => {
    setIsLoading(true);
    try {
      const response = await courseAPI.getCourseByKey(key);
      return response.data; // or handle the data as needed
    } catch (err: any) {
      console.error('Failed to fetch course by key:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getQuizzes = async () => {
    setIsLoading(true);
    try {
      const response = await quizAPI.getQuizzes();
      return response.data; // or handle the data as needed
    } catch (err: any) {
      console.error('Failed to fetch quizzes:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createChatConversation = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await chatAPI.createConversation(data);
      return response.data; // or handle the data as needed
    } catch (err: any) {
      console.error('Failed to create chat conversation:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getConversations = async () => {
    setIsLoading(true);
    try {
      const response = await chatAPI.getConversations();
      return response.data; // or handle the data as needed
    } catch (err: any) {
      console.error('Failed to fetch conversations:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const redirectBasedOnRole = (userToRedirect = user) => {
    if (!userToRedirect) return;
    switch (userToRedirect.role) {
      case 1:
        navigate('/admin/dashboard');
        break;
      case 2:
        navigate('/instructor/dashboard');
        break;
      case 3:
        navigate('/dashboard');
        break;
      default:
        navigate('/');
        break;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        redirectBasedOnRole,
        createCourse,
        checkAuthStatus,
        getAllCourses,
        getCourseByKey,
        getQuizzes,
        createChatConversation,
        getConversations
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
