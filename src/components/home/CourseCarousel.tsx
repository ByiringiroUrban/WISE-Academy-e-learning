
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star, Code, ChevronRight } from "lucide-react";

interface CourseCarouselProps {
  courses: any[];
}

export function CourseCarousel({ courses }: CourseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Responsive cards to show based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(1);
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2);
      } else {
        setCardsToShow(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ensure we're filtering courses with status 2 or 3 (published)
  const publishedCourses = courses.filter(course => course.status === 2 || course.status === 3);
  
  const totalSlides = Math.max(0, publishedCourses.length - cardsToShow + 1);

  const nextSlide = () => {
    setCurrentIndex(prevIndex => 
      prevIndex < totalSlides - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prevIndex => 
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  // If no published courses, return empty placeholder
  if (publishedCourses.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg shadow-sm max-w-xl mx-auto tech-card">
        <p className="text-gray-200 mb-4">No published courses available yet.</p>
        <Link to="/courses">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
            Browse All
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center -ml-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          className={`h-10 w-10 rounded-full shadow-lg ${currentIndex <= 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 tech-glow'}`}
          onClick={prevSlide}
          disabled={currentIndex <= 0}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="absolute inset-y-0 right-0 flex items-center -mr-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          className={`h-10 w-10 rounded-full shadow-lg ${currentIndex >= totalSlides - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 tech-glow'}`}
          onClick={nextSlide}
          disabled={currentIndex >= totalSlides - 1}
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Carousel */}
      <div className="overflow-hidden px-2">
        <motion.div 
          ref={carouselRef}
          className="flex transition-all duration-500 ease-out"
          initial={false}
          animate={{
            x: `calc(-${currentIndex * 100}% / ${cardsToShow})`
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
        >
          {publishedCourses.map((course: any) => (
            <div 
              key={course._id} 
              className={`px-2 min-w-[calc(100%/${cardsToShow})]`}
              style={{ flex: `0 0 calc(100% / ${cardsToShow})` }}
            >
              <motion.div 
                className="h-full bg-white/90 rounded-xl overflow-hidden tech-card hover:tech-glow transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {course.coverImage?.path ? (
                    <img 
                      src={course.coverImage.path} 
                      alt={course.title} 
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-accent text-primary">
                      <Code className="w-12 h-12" />
                    </div>
                  )}
                  
                  {/* Course level */}
                  {course.level && (
                    <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-primary px-3 py-1 rounded-md text-xs font-medium tech-card">
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </div>
                  )}
                  
                  {/* Course pricing */}
                  {course.paid && (
                    <div className="absolute top-2 right-2 bg-primary text-white px-3 py-1 rounded-md text-xs font-medium tech-card">
                      {course.price?.currency || 'USD'} {course.price?.amount || ''}
                    </div>
                  )}

                  {/* Tech decorative elements */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-white/30 rounded-tl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-white/30 rounded-br-lg"></div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-200 mb-3 text-sm line-clamp-2">{course.subTitle || 'No description available'}</p>
                  
                  <div className="flex items-center text-yellow-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-4 h-4 fill-current" 
                        fill={i < Math.floor(course.avgRating || 0) ? "currentColor" : "none"}
                      />
                    ))}
                    <span className="text-gray-500 text-xs ml-1">
                      ({course.totalReviews || 0} reviews)
                    </span>
                  </div>
                  
                  <Link to={`/courses/${course.slug}`}>
                    <Button className="w-full group bg-primary hover:bg-primary/90">
                      <span>View Course</span>
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Dots indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {[...Array(totalSlides)].map((_, i) => (
          <button
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-8 bg-primary tech-glow' : 'w-2 bg-gray-300'}`}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
