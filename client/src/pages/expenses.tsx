import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { ExpenseForm } from "@/components/expense-form";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2,
  Tv,
  Zap,
  Wifi,
  Tags
} from "lucide-react";

export default function Expenses() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
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

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses"],
    enabled: isAuthenticated,
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  // Type the data properly
  const expensesList = expenses as any[];
  const categoriesList = categories as any[];

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
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
        description: "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  const generateTasksMutation = useMutation({
    mutationFn: async () => {
      const currentDate = new Date();
      await apiRequest("POST", "/api/fin-tasks/generate", {
        targetMonth: currentDate.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fin-tasks"] });
      toast({
        title: "Success",
        description: "Monthly tasks generated successfully",
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
        description: "Failed to generate monthly tasks",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName?.toLowerCase()) {
      case "entertainment":
        return <Tv className="text-purple-600 text-sm" />;
      case "utilities":
        return <Zap className="text-yellow-600 text-sm" />;
      case "internet":
        return <Wifi className="text-blue-600 text-sm" />;
      default:
        return <Tags className="text-gray-600 text-sm" />;
    }
  };

  const getCategoryById = (id: number) => {
    return categoriesList?.find((cat: any) => cat.id === id);
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
              <p className="text-gray-600 mt-1">Manage your recurring expenses</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => generateTasksMutation.mutate()}
                disabled={generateTasksMutation.isPending}
                data-testid="button-generate-tasks"
              >
                {generateTasksMutation.isPending ? "Generating..." : "Generate Monthly Tasks"}
              </Button>
              <Button 
                className="bg-brand-500 text-white hover:bg-brand-600 flex items-center space-x-2"
                onClick={() => setIsFormOpen(true)}
                data-testid="button-add-expense"
              >
                <Plus className="h-4 w-4" />
                <span>Add Expense</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <Card data-testid="card-expense-management">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Expense Management</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Expense</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Due Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expensesLoading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          Loading expenses...
                        </td>
                      </tr>
                    ) : expensesList?.length > 0 ? (
                      expensesList.map((expense: any) => {
                        const category = getCategoryById(expense.categoryId);
                        return (
                          <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`expense-row-${expense.id}`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  {getCategoryIcon(category?.name)}
                                </div>
                                <span className="font-medium text-gray-900">{expense.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{category?.name || "No Category"}</td>
                            <td className="py-3 px-4 font-semibold text-gray-900">${expense.amount}</td>
                            <td className="py-3 px-4 text-gray-600">{expense.type}</td>
                            <td className="py-3 px-4 text-gray-600">{expense.dueDate}{expense.dueDate ? "th" : ""}</td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                {expense.isArchived ? "Archived" : "Active"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button 
                                  className="text-gray-400 hover:text-brand-500"
                                  onClick={() => handleEdit(expense)}
                                  data-testid={`button-edit-${expense.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  className="text-gray-400 hover:text-red-500"
                                  onClick={() => handleDelete(expense.id)}
                                  data-testid={`button-delete-${expense.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          No expenses found. Create your first expense to get started.
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

      {/* Expense Form Modal */}
      {isFormOpen && (
        <ExpenseForm
          expense={editingExpense}
          categories={categoriesList || []}
          onClose={closeForm}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
            closeForm();
          }}
        />
      )}
    </div>
  );
}
