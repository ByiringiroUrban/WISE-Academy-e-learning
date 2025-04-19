
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { courseAPI, categoryAPI, subcategoryAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function EditCourse() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [price, setPriceAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [paid, setPaid] = useState(true);
  const [level, setLevel] = useState("beginner");
  const [language, setLanguage] = useState("english");
  const [status, setStatus] = useState(1);
  
  // What will learn section
  const [learnItems, setLearnItems] = useState([""]);
  
  // Prerequisites section
  const [prerequisiteItems, setPrerequisiteItems] = useState([""]);
  
  // Who is this course for section
  const [targetAudienceItems, setTargetAudienceItems] = useState([""]);
  
  // Data fetching states
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch course data and categories on component mount
  useEffect(() => {
    const fetchCourseAndCategories = async () => {
      setIsLoading(true);
      setError("");
      
      if (!id) {
        setError("Course ID is missing");
        setIsLoading(false);
        return;
      }
      
      try {
        const [courseRes, categoriesRes] = await Promise.all([
          courseAPI.getCourseDetails(id),
          categoryAPI.getCategories()
        ]);
        
        // Process categories
        const categoriesData = categoriesRes?.data?.data?.categories || [];
        setCategories(categoriesData);
        
        // Process course data
        const course = courseRes?.data?.data?.course;
        if (!course) {
          throw new Error("Course not found");
        }
        
        // Populate form fields
        setTitle(course.title || "");
        setSubTitle(course.subTitle || "");
        setDesc(course.desc || "");
        setCategoryId(course.categoryId || "");
        setSubCategoryId(course.subCategoryId || "");
        setPaid(!!course.paid);
        setStatus(course.status || 1);
        
        if (course.price) {
          setCurrency(course.price.currency || "USD");
          setPriceAmount(course.price.amount?.toString() || "");
        }
        
        setLevel(course.level || "beginner");
        setLanguage(course.language || "english");
        
        // Populate arrays
        setLearnItems(course.whatWillLearn?.length > 0 ? course.whatWillLearn : [""]);
        setPrerequisiteItems(course.prerequisites?.length > 0 ? course.prerequisites : [""]);
        setTargetAudienceItems(course.whoIsThisCourseFor?.length > 0 ? course.whoIsThisCourseFor : [""]);
        
        // If we have a category ID, fetch subcategories
        if (course.categoryId) {
          fetchSubcategories(course.categoryId);
        }
        
      } catch (err: any) {
        console.error("Error fetching course:", err);
        setError(err.response?.data?.message || "Failed to load course data");
        toast({
          title: "Error",
          description: "Failed to load course data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseAndCategories();
  }, [id, toast]);

  // Fetch subcategories when category changes
  const fetchSubcategories = async (catId: string) => {
    if (!catId) {
      setSubcategories([]);
      setSubCategoryId("");
      return;
    }
    
    try {
      const response = await subcategoryAPI.getSubcategories({ categoryId: catId });
      setSubcategories(response?.data?.data?.subCategories || []);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      toast({
        title: "Error",
        description: "Failed to load subcategories",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSubcategories(categoryId);
  }, [categoryId]);

  // Handle array field updates
  const handleLearnItemChange = (index: number, value: string) => {
    const newItems = [...learnItems];
    newItems[index] = value;
    setLearnItems(newItems);
  };
  
  const handlePrerequisiteItemChange = (index: number, value: string) => {
    const newItems = [...prerequisiteItems];
    newItems[index] = value;
    setPrerequisiteItems(newItems);
  };
  
  const handleTargetAudienceItemChange = (index: number, value: string) => {
    const newItems = [...targetAudienceItems];
    newItems[index] = value;
    setTargetAudienceItems(newItems);
  };
  
  // Add new item to arrays
  const addLearnItem = () => setLearnItems([...learnItems, ""]);
  const addPrerequisiteItem = () => setPrerequisiteItems([...prerequisiteItems, ""]);
  const addTargetAudienceItem = () => setTargetAudienceItems([...targetAudienceItems, ""]);
  
  // Remove item from arrays
  const removeLearnItem = (index: number) => {
    if (learnItems.length === 1) return;
    const newItems = learnItems.filter((_, i) => i !== index);
    setLearnItems(newItems);
  };
  
  const removePrerequisiteItem = (index: number) => {
    if (prerequisiteItems.length === 1) return;
    const newItems = prerequisiteItems.filter((_, i) => i !== index);
    setPrerequisiteItems(newItems);
  };
  
  const removeTargetAudienceItem = (index: number) => {
    if (targetAudienceItems.length === 1) return;
    const newItems = targetAudienceItems.filter((_, i) => i !== index);
    setTargetAudienceItems(newItems);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !categoryId || !subCategoryId) {
      setError("Please fill out all required fields");
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (paid && !price) {
      setError("Please enter a price for paid courses");
      toast({
        title: "Validation Error",
        description: "Please enter a price for paid courses",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    setError("");
    
    // Filter out empty items
    const filteredLearnItems = learnItems.filter(item => item.trim() !== "");
    const filteredPrerequisiteItems = prerequisiteItems.filter(item => item.trim() !== "");
    const filteredTargetAudienceItems = targetAudienceItems.filter(item => item.trim() !== "");
    
    // Build course data
    const courseData = {
      title,
      subTitle,
      desc,
      categoryId,
      subCategoryId,
      status,
      paid,
      price: paid ? { currency, amount: parseFloat(price) } : undefined,
      level,
      language,
      whatWillLearn: filteredLearnItems,
      prerequisites: filteredPrerequisiteItems,
      whoIsThisCourseFor: filteredTargetAudienceItems
    };
    
    try {
      if (!id) throw new Error("Course ID is missing");
      
      await courseAPI.updateCourse(id, courseData);
      
      toast({
        title: "Success",
        description: "Course updated successfully!",
      });
      
      navigate('/instructor/dashboard');
    } catch (err: any) {
      console.error("Course update error:", err);
      setError(err.response?.data?.message || "Failed to update course");
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await courseAPI.publishCourse(id);
      setStatus(3); // Set to published
      toast({
        title: "Success",
        description: "Course published successfully!",
      });
    } catch (err: any) {
      console.error("Course publishing error:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to publish course",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <p>Loading course data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-4">
        <h1 className="text-3xl font-bold mb-6">Edit Course</h1>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Course Subtitle
                  </label>
                  <input
                    id="subTitle"
                    type="text"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-1">
                    Course Description
                  </label>
                  <textarea
                    id="desc"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            
            {/* Categories */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category: any) => (
                      <option key={category._id} value={category._id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory *
                  </label>
                  <select
                    id="subcategory"
                    value={subCategoryId}
                    onChange={(e) => setSubCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={!categoryId}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories.map((subCategory: any) => (
                      <option key={subCategory._id} value={subCategory._id}>
                        {subCategory.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Course Settings */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Course Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pricing
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="paid"
                        checked={paid}
                        onChange={() => setPaid(true)}
                        className="form-radio"
                      />
                      <span className="ml-2">Paid</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="free"
                        checked={!paid}
                        onChange={() => setPaid(false)}
                        className="form-radio"
                      />
                      <span className="ml-2">Free</span>
                    </label>
                  </div>
                </div>
                
                {paid && (
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <div className="flex">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-24 border border-gray-300 rounded-l-md"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                      <input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPriceAmount(e.target.value)}
                        className="w-full border border-gray-300 rounded-r-md"
                        placeholder="0.00"
                        required={paid}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    id="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all">All Levels</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="chinese">Chinese</option>
                    <option value="japanese">Japanese</option>
                    <option value="korean">Korean</option>
                    <option value="arabic">Arabic</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* What will students learn */}
            <div>
              <h2 className="text-xl font-semibold mb-4">What will students learn?</h2>
              {learnItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleLearnItemChange(index, e.target.value)}
                    placeholder="Enter learning point"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {learnItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLearnItem(index)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addLearnItem}>Add another learning point</Button>
            </div>
            
            {/* Prerequisites */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Prerequisites</h2>
              {prerequisiteItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handlePrerequisiteItemChange(index, e.target.value)}
                    placeholder="Enter prerequisite"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {prerequisiteItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrerequisiteItem(index)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addPrerequisiteItem}>Add another prerequisite</Button>
            </div>
            
            {/* Target Audience */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Target Audience</h2>
              {targetAudienceItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleTargetAudienceItemChange(index, e.target.value)}
                    placeholder="Enter target audience"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {targetAudienceItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTargetAudienceItem(index)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTargetAudienceItem}>Add another target audience</Button>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              
              {status !== 3 && (
                <Button 
                  type="button" 
                  onClick={handlePublish} 
                  disabled={isSaving}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Publish Course
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
