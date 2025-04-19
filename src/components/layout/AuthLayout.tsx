
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <Toaster />
    </div>
  );
};

export default AuthLayout;
