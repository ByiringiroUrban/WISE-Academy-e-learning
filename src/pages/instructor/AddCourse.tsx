
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseAPI, categoryAPI, subcategoryAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function AddCourse() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
  
  const [learnItems, setLearnItems] = useState([""]);
  const [prerequisiteItems, setPrerequisiteItems] = useState([""]);
  const [targetAudienceItems, setTargetAudienceItems] = useState([""]);
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role !== 2) {
      toast({
        title: "Access Restricted",
        description: "Only instructors can create courses",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getCategories();
        setCategories(response.data.data.categories || []);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    fetchCategories();
  }, [toast]);

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const response = await subcategoryAPI.getSubcategories({ categoryId });
      setSubcategories(response.data.data.subCategories || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subcategories. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubCategoryId("");
      return;
    }
    
    fetchSubcategories(categoryId);
  }, [categoryId, toast]);

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
  
  const addLearnItem = () => setLearnItems([...learnItems, ""]);
  const addPrerequisiteItem = () => setPrerequisiteItems([...prerequisiteItems, ""]);
  const addTargetAudienceItem = () => setTargetAudienceItems([...targetAudienceItems, ""]);
  
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
    
    setIsSaving(true);
    setError("");
    
    const filteredLearnItems = learnItems.filter(item => item.trim() !== "");
    const filteredPrerequisiteItems = prerequisiteItems.filter(item => item.trim() !== "");
    const filteredTargetAudienceItems = targetAudienceItems.filter(item => item.trim() !== "");
    
    const courseData = {
      title,
      subTitle,
      desc,
      categoryId,
      subCategoryId,
      paid,
      price: paid ? { currency, amount: parseFloat(price) } : undefined,
      level,
      language,
      whatWillLearn: filteredLearnItems,
      prerequisites: filteredPrerequisiteItems,
      whoIsThisCourseFor: filteredTargetAudienceItems
    };
    
    try {
      await courseAPI.createCourse(courseData);
      
      toast({
        title: "Success",
        description: "Course created successfully!",
      });
      
      navigate('/instructor/dashboard');
    } catch (err: any) {
      console.error("Course creation error:", err);
      setError(err.response?.data?.message || "Failed to create course");
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-4">
        <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
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
              <Button type="button" onClick={addLearnItem}>Add another learning point</Button>
            </div>
            
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
              <Button type="button" onClick={addPrerequisiteItem}>Add another prerequisite</Button>
            </div>
            
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
              <Button type="button" onClick={addTargetAudienceItem}>Add another target audience</Button>
            </div>
            
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
