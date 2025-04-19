
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseAPI, categoryAPI, subcategoryAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function CourseListing() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getCategories();
        setCategories(response.data.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const fetchSubcategories = async () => {
        try {
          const response = await subcategoryAPI.getSubcategories({ categoryId: selectedCategory });
          setSubcategories(response.data.data.subCategories);
        } catch (error) {
          console.error("Error fetching subcategories:", error);
        }
      };

      fetchSubcategories();
    } else {
      setSubcategories([]);
    }
    setSelectedSubcategory("");
  }, [selectedCategory]);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page: currentPage,
          size: 9,
          q: searchQuery,
          status: 3, // Only fetch published courses
        };

        if (selectedCategory) {
          params.categoryId = selectedCategory;
        }

        if (selectedSubcategory) {
          params.subCategoryId = selectedSubcategory;
        }

        const response = await courseAPI.getAllCourses(params);
        setCourses(response.data.data.courses);
        setTotalPages(response.data.data.totalPage || 1);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, searchQuery, selectedCategory, selectedSubcategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubcategory(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Courses</h1>

      <div className="bg-white border rounded-lg  p-6 mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Courses
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by course title or description"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map((category: any) => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory
            </label>
            <select
              id="subcategory"
              value={selectedSubcategory}
              onChange={handleSubcategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={!selectedCategory || subcategories.length === 0}
            >
              <option value="">All Subcategories</option>
              {subcategories.map((subcategory: any) => (
                <option key={subcategory._id} value={subcategory._id}>
                  {subcategory.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 flex justify-end">
            <Button type="submit">Search</Button>
          </div>
        </form>
      </div>

      <div className="border p-5 rounded-lg">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-xl font-medium">No courses found</h3>
            <p className="text-gray-600 mt-2">Try changing your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: any) => (
              <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="h-48 bg-gray-200">
                  {course.thumbnailId && course.thumbnailId.path && (
                    <img 
                      src={course.thumbnailId.path} 
                      alt={course.title} 
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 flex-1">{course.subTitle || "No description available"}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      {course.paid ? (
                        <span className="text-primary font-semibold">${course.price?.amount || 0}</span>
                      ) : (
                        <span className="text-green-600 font-semibold">Free</span>
                      )}
                    </div>
                    <Link to={`/courses/${course.slug}`}>
                      <Button>View Details</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
