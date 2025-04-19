
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import api from "@/lib/api";

export default function CourseLesson() {
  const { verified } = useRequireAuth();
  const { courseKey, lessonId } = useParams<{ courseKey: string; lessonId: string }>();
  const [course, setCourse] = useState<any>(null);
  const [lecture, setLecture] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!verified) return;

    const fetchCourseAndLecture = async () => {
      setIsLoading(true);
      try {
        // Fetch course details
        if (!courseKey) return;
        const courseResponse = await api.get(`/courses/public/${courseKey}`);
        const courseData = courseResponse.data.data.course;
        setCourse(courseData);

        // Fetch lecture details
        if (!lessonId) return;
        const lectureResponse = await api.get(`/lectures/${lessonId}`);
        const lectureData = lectureResponse.data.data.lecture;
        setLecture(lectureData);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load lesson details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAndLecture();
  }, [courseKey, lessonId, verified]);

  // Navigate to the next or previous lesson
  const navigateLesson = (direction: 'prev' | 'next') => {
    if (!course || !course.sections) return;
    
    // Flatten all lesson items from all sections
    const allLessons = course.sections.flatMap((section: any) => 
      section.items.map((item: any) => ({
        ...item,
        sectionTitle: section.title,
      }))
    );
    
    // Find the current lesson index
    const currentIndex = allLessons.findIndex((item: any) => 
      item.lectureId === lessonId
    );
    
    if (currentIndex === -1) return;
    
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    // Check if the target index is valid
    if (targetIndex >= 0 && targetIndex < allLessons.length) {
      const targetLesson = allLessons[targetIndex];
      if (targetLesson.lectureId) {
        navigate(`/courses/${courseKey}/lessons/${targetLesson.lectureId}`);
      }
    }
  };

  if (!verified) {
    return null; // The useRequireAuth hook will handle the redirect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate(`/courses/${courseKey}`)}>
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  if (!course || !lecture) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <h3 className="text-xl font-medium">Lesson not found</h3>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate(`/courses/${courseKey}`)}>
              Back to Course
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to={`/courses/${courseKey}`} className="text-primary hover:underline">
          &larr; Back to {course.title}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar with Course Content */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h3 className="font-bold text-lg mb-4">Course Content</h3>
            
            <div className="space-y-3">
              {course.sections && course.sections.map((section: any, sectionIndex: number) => (
                <div key={sectionIndex} className="border-b pb-3 last:border-b-0">
                  <h4 className="font-medium mb-2">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.items && section.items.map((item: any, itemIndex: number) => {
                      // Only render lecture items for now
                      if (!item.lectureId) return null;
                      
                      const isActive = item.lectureId === lessonId;
                      
                      return (
                        <li key={itemIndex}>
                          <Link 
                            to={`/courses/${courseKey}/lessons/${item.lectureId}`}
                            className={`block p-2 rounded ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                          >
                            <span className="text-sm">Lesson {sectionIndex + 1}.{itemIndex + 1}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">{lecture.title}</h1>
              
              {/* Video Player */}
              {lecture.videoId ? (
                <div className="bg-gray-200 aspect-video mb-6 rounded-lg flex items-center justify-center">
                  <p>Video Player Placeholder</p>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                  <p className="text-yellow-700">This lesson does not have a video.</p>
                </div>
              )}
              
              {/* Lesson Content */}
              <div className="prose max-w-none mb-8">
                {lecture.desc ? (
                  <div dangerouslySetInnerHTML={{ __html: lecture.desc }} />
                ) : (
                  <p>No additional content for this lesson.</p>
                )}
              </div>
              
              {/* Resources */}
              {lecture.resources && lecture.resources.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Resources</h3>
                  <ul className="space-y-2">
                    {lecture.resources.map((resource: any, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <a href="#" className="text-primary hover:underline">{resource.title || `Resource ${index + 1}`}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => navigateLesson('prev')}
                >
                  Previous Lesson
                </Button>
                <Button 
                  onClick={() => navigateLesson('next')}
                >
                  Next Lesson
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
