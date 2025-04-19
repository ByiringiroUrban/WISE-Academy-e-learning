import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { courseAPI, categoryAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { FeatureCard } from "@/components/home/FeatureCard";
import { CourseCarousel } from "@/components/home/CourseCarousel";
import { CategorySection } from "@/components/home/CategorySection";
import { HeroSection } from "@/components/home/HeroSection";
import { 
  Code,
  Server,
  Database,
  Cpu,
  Globe
} from "lucide-react";

export default function Homepage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          courseAPI.getAllCourses({ page: 1, size: 6, q: "", status: 3 }),
          categoryAPI.getCategories(),
        ]);
        
        if (coursesRes?.data?.data?.courses) {
          setFeaturedCourses(coursesRes.data.data.courses);
        } else {
          console.error("Invalid courses response format", coursesRes);
          setError("Failed to load courses");
        }
        
        if (categoriesRes?.data?.data?.categories) {
          setCategories(categoriesRes.data.data.categories);
        } else {
          console.error("Invalid categories response format", categoriesRes);
          setError("Failed to load categories");
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
        setError("Failed to load homepage data");
        toast({
          title: "Error",
          description: "Failed to load homepage data. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const features = [
    {
      title: "Expert Instructors",
      description: "Learn from industry professionals with real-world experience in technical domains.",
      icon: <Globe className="w-6 h-6" />
    },
    {
      title: "Code-Centric Learning",
      description: "Master programming with interactive code examples, repositories, and real projects.",
      icon: <Code className="w-6 h-6" />
    },
    {
      title: "Cloud Technologies",
      description: "Deploy your projects on modern cloud infrastructure with expert guidance.",
      icon: <Server className="w-6 h-6" />
    },
    {
      title: "Data Engineering",
      description: "Learn data modeling, warehousing, and building scalable database solutions.",
      icon: <Database className="w-6 h-6" />
    },
    {
      title: "Hardware Integration",
      description: "Understand how software interacts with hardware systems and architectures.",
      icon: <Cpu className="w-6 h-6" />
    },
    {
      title: "Web Technologies",
      description: "Stay current with the latest web development frameworks and tools.",
      icon: <Globe className="w-6 h-6" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen container bg-blue-950">
      <HeroSection />
      
      <section className="py-20 tech-pattern">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 gradient-text text-gray-200">Featured Courses</h2>
            <div className="w-20 h-1 bg-primary/50 mx-auto mb-6 tech-glow rounded-full"></div>
            <p className="text-gray-200 max-w-2xl mx-auto">
              Explore our most advanced technical courses designed for the modern professional
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg shadow-sm max-w-xl mx-auto tech-card">
              <p className="mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Retry
              </Button>
            </div>
          ) : (
            <CourseCarousel courses={featuredCourses} />
          )}
          
          <div className="mt-10 text-center">
            <Link to="/courses">
              <Button 
                variant="outline" 
                size="lg"
                className="group transition-all duration-300 ease-in-out border-primary text-primary hover:bg-primary/5"
              >
                <span>View All Courses</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CategorySection 
        categories={categories} 
        isLoading={isLoading} 
      />

      <section className="py-20 bg-gradient-to-b tech-grid">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">Technical Excellence</h2>
            <div className="w-20 h-1 bg-primary/50 mx-auto mb-6 tech-glow rounded-full"></div>
            <p className="text-gray-200 max-w-2xl mx-auto">
              Our platform delivers industry-leading technical education with cutting-edge tools and resources
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-900 tech-pattern">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Master Tech Skills?</h2>
            <p className="text-lg mb-8 text-white/90">
              Join thousands of professionals already accelerating their careers with our technical courses.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/courses">
                <Button size="lg" variant="secondary" className="hover:bg-secondary/90 text-secondary-foreground">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  Sign Up Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
