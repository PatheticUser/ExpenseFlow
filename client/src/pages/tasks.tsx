import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";
import { 
  Tv,
  Zap,
  Wifi,
  Tags
} from "lucide-react";

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState("all");
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

  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString();
  const currentYear = currentDate.getFullYear();

  const { data: finTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/fin-tasks", currentMonth, currentYear],
    queryFn: async () => {
      const res = await fetch(`/api/fin-tasks?month=${currentMonth}&year=${currentYear}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
      return await res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: expenses } = useQuery({
    queryKey: ["/api/expenses"],
    enabled: isAuthenticated,
  });

  // Type the data properly
  const tasksList = finTasks as any[];
  const expensesList = expenses as any[];

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/fin-tasks/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fin-tasks", currentMonth, currentYear] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Task status updated successfully",
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
        description: "Failed to update task status",
        variant: "destructive",
      });
    },
  });

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

  const getCategoryIcon = (expenseId: number) => {
    const expense = expensesList?.find((exp: any) => exp.id === expenseId);
    const categoryName = expense?.category?.name;
    
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

  const getExpenseName = (expenseId: number) => {
    const expense = expensesList?.find((exp: any) => exp.id === expenseId);
    return expense?.name || "Unknown Expense";
  };

  const filteredTasks = tasksList?.filter((task: any) => {
    if (statusFilter === "all") return true;
    return task.status === statusFilter;
  }) || [];

  const handleStatusUpdate = (taskId: number, status: string) => {
    updateTaskStatusMutation.mutate({ id: taskId, status });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Financial Tasks</h2>
              <p className="text-gray-600 mt-1">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <Card data-testid="card-task-management">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Financial Tasks - {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Task</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Due Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasksLoading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          Loading tasks...
                        </td>
                      </tr>
                    ) : filteredTasks.length > 0 ? (
                      filteredTasks.map((task: any) => (
                        <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`task-row-${task.id}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                {getCategoryIcon(task.expenseId)}
                              </div>
                              <span className="font-medium text-gray-900">{getExpenseName(task.expenseId)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">${task.amount}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {task.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border-emerald-200"
                                    onClick={() => handleStatusUpdate(task.id, "paid")}
                                    disabled={updateTaskStatusMutation.isPending}
                                    data-testid={`button-mark-paid-${task.id}`}
                                  >
                                    Mark Paid
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 border-amber-200"
                                    onClick={() => handleStatusUpdate(task.id, "hold")}
                                    disabled={updateTaskStatusMutation.isPending}
                                    data-testid={`button-hold-${task.id}`}
                                  >
                                    Hold
                                  </Button>
                                </>
                              )}
                              {task.status === "hold" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border-emerald-200"
                                  onClick={() => handleStatusUpdate(task.id, "paid")}
                                  disabled={updateTaskStatusMutation.isPending}
                                  data-testid={`button-mark-paid-${task.id}`}
                                >
                                  Mark Paid
                                </Button>
                              )}
                              {task.status === "paid" && (
                                <span className="text-sm text-gray-500">Completed</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          No financial tasks found for the current filter.
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
    </div>
  );
}
