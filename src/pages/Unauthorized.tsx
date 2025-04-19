
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <Link to="/">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    </div>
  );
}
