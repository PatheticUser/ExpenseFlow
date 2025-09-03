import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Tags
} from "lucide-react";

export default function Categories() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", type: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  // Type the data properly
  const categoriesList = categories as any[];

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; type: string }) => {
      if (editingCategory) {
        await apiRequest("PUT", `/api/categories/${editingCategory.id}`, data);
      } else {
        await apiRequest("POST", "/api/categories", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: editingCategory ? "Category updated successfully" : "Category created successfully",
      });
      closeForm();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: editingCategory ? "Failed to update category" : "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name, type: category.type });
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", type: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createCategoryMutation.mutate(formData);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
              <p className="text-gray-600 mt-1">Organize your expenses with categories</p>
            </div>
            <Button 
              className="bg-brand-500 text-white hover:bg-brand-600 flex items-center space-x-2"
              onClick={() => setIsFormOpen(true)}
              data-testid="button-add-category"
            >
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <Card data-testid="card-category-management">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Category Management</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoriesLoading ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          Loading categories...
                        </td>
                      </tr>
                    ) : categoriesList?.length > 0 ? (
                      categoriesList.map((category: any) => (
                        <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`category-row-${category.id}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Tags className="text-blue-600 text-sm" />
                              </div>
                              <span className="font-medium text-gray-900">{category.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 capitalize">{category.type}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="text-gray-400 hover:text-brand-500"
                                onClick={() => handleEdit(category)}
                                data-testid={`button-edit-${category.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                className="text-gray-400 hover:text-red-500"
                                onClick={() => handleDelete(category.id)}
                                data-testid={`button-delete-${category.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          No categories found. Create your first category to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Category Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="modal-category-form">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={closeForm}
                data-testid="button-close-modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Entertainment, Utilities"
                  className="w-full"
                  data-testid="input-category-name"
                />
              </div>

              <div>
                <Label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Type
                </Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger data-testid="select-category-type">
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={closeForm}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-brand-500 hover:bg-brand-600"
                  disabled={createCategoryMutation.isPending}
                  data-testid="button-submit"
                >
                  {createCategoryMutation.isPending
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}