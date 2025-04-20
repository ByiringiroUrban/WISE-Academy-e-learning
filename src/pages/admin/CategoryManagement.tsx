
import { useState, useEffect } from "react";
import { categoryAPI, subcategoryAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Folder, FolderPlus, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Category {
  _id: string;
  title: string;
  slug: string;
  desc?: string;
}

interface SubCategory {
  _id: string;
  title: string;
  slug: string;
  desc?: string;
  categoryId: string | Category;
}

export default function CategoryManagement() {
  const { verified } = useRequireAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [categoryTitle, setCategoryTitle] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");

  const [subcategoryTitle, setSubcategoryTitle] = useState("");
  const [subcategoryDesc, setSubcategoryDesc] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [editingSubcategoryId, setEditingSubcategoryId] = useState("");

  useEffect(() => {
    if (!verified) return;
    fetchCategories();
    fetchSubcategories();
  }, [verified]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data.data.categories || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load categories");
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await subcategoryAPI.getSubcategories();
      setSubcategories(response.data.data.subCategories || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load subcategories",
        variant: "destructive",
      });
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Category title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCategoryId) {
        await categoryAPI.updateCategory(editingCategoryId, {
          title: categoryTitle,
          desc: categoryDesc,
        });
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        await categoryAPI.createCategory({
          title: categoryTitle,
          desc: categoryDesc,
        });
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }
      setCategoryTitle("");
      setCategoryDesc("");
      setEditingCategoryId("");
      fetchCategories();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subcategoryTitle.trim() || !selectedCategoryId) {
      toast({
        title: "Validation Error",
        description: "Subcategory title and category selection are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSubcategoryId) {
        await subcategoryAPI.updateSubcategory(editingSubcategoryId, {
          title: subcategoryTitle,
          desc: subcategoryDesc,
          categoryId: selectedCategoryId,
        });
        toast({
          title: "Success",
          description: "Subcategory updated successfully",
        });
      } else {
        await subcategoryAPI.createSubcategory({
          title: subcategoryTitle,
          desc: subcategoryDesc,
          categoryId: selectedCategoryId,
        });
        toast({
          title: "Success",
          description: "Subcategory created successfully",
        });
      }
      setSubcategoryTitle("");
      setSubcategoryDesc("");
      setSelectedCategoryId("");
      setEditingSubcategoryId("");
      fetchSubcategories();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create subcategory",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setCategoryTitle(category.title);
    setCategoryDesc(category.desc || "");
    setEditingCategoryId(category._id);
  };

  const handleEditSubcategory = (subcategory: SubCategory) => {
    setSubcategoryTitle(subcategory.title);
    setSubcategoryDesc(subcategory.desc || "");
    setSelectedCategoryId(typeof subcategory.categoryId === 'string' ? subcategory.categoryId : subcategory.categoryId._id);
    setEditingSubcategoryId(subcategory._id);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await categoryAPI.deleteCategory(id);
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        fetchCategories();
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to delete category",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await subcategoryAPI.deleteSubcategory(id);
        toast({
          title: "Success",
          description: "Subcategory deleted successfully",
        });
        fetchSubcategories();
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to delete subcategory",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading && !categories.length) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Category Management</h1>
      <p className="text-gray-600 mb-8">Create and manage course categories and subcategories</p>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FolderPlus className="h-5 w-5" />
                {editingCategoryId ? "Edit Category" : "Create Category"}
              </h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Category Title *
                  </label>
                  <Input
                    id="title"
                    value={categoryTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategoryTitle(e.target.value)}
                    placeholder="Enter category title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description (Optional)
                  </label>
                  <Textarea
                    id="description"
                    value={categoryDesc}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCategoryDesc(e.target.value)}
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingCategoryId ? "Update Category" : "Create Category"}
                  </Button>
                  {editingCategoryId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCategoryTitle("");
                        setCategoryDesc("");
                        setEditingCategoryId("");
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Categories List
              </h2>
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
                  {error}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left border">Title</th>
                      <th className="px-4 py-2 text-left border">Slug</th>
                      <th className="px-4 py-2 text-left border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category._id} className="border-b">
                        <td className="px-4 py-2 border">{category.title}</td>
                        <td className="px-4 py-2 border">{category.slug}</td>
                        <td className="px-4 py-2 border">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteCategory(category._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-center">
                          No categories found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subcategories">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FolderPlus className="h-5 w-5" />
                {editingSubcategoryId ? "Edit Subcategory" : "Create Subcategory"}
              </h2>
              <form onSubmit={handleCreateSubcategory} className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1">
                    Parent Category *
                  </label>
                  <select
                    id="category"
                    className="w-full p-2 border rounded-md"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="subcategoryTitle" className="block text-sm font-medium mb-1">
                    Subcategory Title *
                  </label>
                  <Input
                    id="subcategoryTitle"
                    value={subcategoryTitle}
                    onChange={(e) => setSubcategoryTitle(e.target.value)}
                    placeholder="Enter subcategory title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subcategoryDescription" className="block text-sm font-medium mb-1">
                    Description (Optional)
                  </label>
                  <Textarea
                    id="subcategoryDescription"
                    value={subcategoryDesc}
                    onChange={(e) => setSubcategoryDesc(e.target.value)}
                    placeholder="Enter subcategory description"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingSubcategoryId ? "Update Subcategory" : "Create Subcategory"}
                  </Button>
                  {editingSubcategoryId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSubcategoryTitle("");
                        setSubcategoryDesc("");
                        setSelectedCategoryId("");
                        setEditingSubcategoryId("");
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Subcategories List
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left border">Title</th>
                      <th className="px-4 py-2 text-left border">Category</th>
                      <th className="px-4 py-2 text-left border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subcategories.map((subcategory) => (
                      <tr key={subcategory._id} className="border-b">
                        <td className="px-4 py-2 border">{subcategory.title}</td>
                        <td className="px-4 py-2 border">
                          {typeof subcategory.categoryId === 'object' 
                            ? subcategory.categoryId.title
                            : 'Unknown Category'}
                        </td>
                        <td className="px-4 py-2 border">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSubcategory(subcategory)}
                            >
                              <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSubcategory(subcategory._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {subcategories.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-center">
                          No subcategories found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
