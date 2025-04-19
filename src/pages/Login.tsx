
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      console.log("Login: User already authenticated, redirecting based on role:", user.role);
      
      switch (user.role) {
        case 1: // Admin
          navigate('/admin/dashboard', { replace: true });
          break;
        case 2: // Instructor
          navigate('/instructor/dashboard', { replace: true });
          break;
        case 3: // Student
          navigate('/dashboard', { replace: true });
          break;
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    try {
      console.log("Login component: Attempting to login with:", email);
      await login(email, password);
      // Redirection is handled in the login function of AuthContext
    } catch (err: any) {
      console.error("Login error:", err);
      setLoginError(err.response?.data?.message || "Failed to login. Please check your credentials.");
    }
  };

  // If already authenticated, don't render the login form
  if (isAuthenticated && user) {
    return <div className="flex justify-center items-center h-screen">Redirecting...</div>;
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login to Your Account</h1>
        
        {loginError && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
            {loginError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
