import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { 
  ArrowUp, 
  Clock, 
  CheckCircle, 
  Tags, 
  Plus, 
  Bell,
  Tv,
  Zap,
  Wifi
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses"],
    enabled: isAuthenticated,
  });

  const { data: finTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/fin-tasks"],
    enabled: isAuthenticated,
  });

  // Type the data properly
  const dashboardStats = stats as any;
  const expensesList = expenses as any[];
  const tasksList = finTasks as any[];

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-emerald-800 bg-emerald-100";
      case "pending":
        return "text-amber-800 bg-amber-100";
      case "hold":
        return "text-blue-800 bg-blue-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName?.toLowerCase()) {
      case "entertainment":
        return <Tv className="text-purple-600" />;
      case "utilities":
        return <Zap className="text-yellow-600" />;
      case "internet":
        return <Wifi className="text-blue-600" />;
      default:
        return <Tags className="text-gray-600" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-600 mt-1">Manage your financial tasks and expenses</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                className="bg-brand-500 text-white hover:bg-brand-600 flex items-center space-x-2"
                onClick={() => setLocation("/expenses")}
                data-testid="button-add-expense"
              >
                <Plus className="h-4 w-4" />
                <span>Add Expense</span>
              </Button>
              <button className="text-gray-400 hover:text-gray-600" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-stats-expenses">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Monthly Expenses</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ${statsLoading ? "..." : dashboardStats?.totalExpenses?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <ArrowUp className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">Monthly total</p>
              </CardContent>
            </Card>

            <Card data-testid="card-stats-pending">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {statsLoading ? "..." : dashboardStats?.pendingTasks || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">Due this month</p>
              </CardContent>
            </Card>

            <Card data-testid="card-stats-completed">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {statsLoading ? "..." : dashboardStats?.completedTasks || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">This month</p>
              </CardContent>
            </Card>

            <Card data-testid="card-stats-categories">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {statsLoading ? "..." : dashboardStats?.categories || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Tags className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">Active categories</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tasks & Expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Financial Tasks */}
            <Card data-testid="card-recent-tasks">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Financial Tasks</h3>
                  <Button 
                    variant="ghost" 
                    className="text-brand-500 hover:text-brand-600 font-medium text-sm"
                    data-testid="button-view-all-tasks"
                  >
                    View All
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {tasksLoading ? (
                    <div>Loading tasks...</div>
                  ) : tasksList?.length > 0 ? (
                    tasksList.slice(0, 3).map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`task-item-${task.id}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            task.status === "paid" ? "bg-emerald-500" : 
                            task.status === "pending" ? "bg-amber-500" : "bg-red-500"
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{task.expense?.name || "Unknown Task"}</p>
                            <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${task.amount}</p>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No financial tasks found. Generate tasks from your expenses.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card data-testid="card-recent-expenses">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
                  <Button 
                    variant="ghost" 
                    className="text-brand-500 hover:text-brand-600 font-medium text-sm"
                    data-testid="button-view-all-expenses"
                  >
                    View All
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {expensesLoading ? (
                    <div>Loading expenses...</div>
                  ) : expensesList?.length > 0 ? (
                    expensesList.slice(0, 3).map((expense: any) => (
                      <div key={expense.id} className="flex items-center justify-between" data-testid={`expense-item-${expense.id}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            {getCategoryIcon(expense.category?.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{expense.name}</p>
                            <p className="text-sm text-gray-500">{expense.category?.name || "No Category"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${expense.amount}</p>
                          <p className="text-sm text-gray-500">{expense.type}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No expenses found. Create your first expense to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
