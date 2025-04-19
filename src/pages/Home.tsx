
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to Learning Platform
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl">
          Discover courses taught by expert instructors from around the world.
          Learn at your own pace and gain valuable skills.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
