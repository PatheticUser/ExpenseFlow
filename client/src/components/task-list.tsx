import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

interface TaskListProps {
  tasks: any[];
  expenses: any[];
}

export function TaskList({ tasks, expenses }: TaskListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/fin-tasks/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fin-tasks"] });
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

  const getExpenseName = (expenseId: number) => {
    const expense = expenses?.find((exp: any) => exp.id === expenseId);
    return expense?.name || "Unknown Expense";
  };

  const handleStatusUpdate = (taskId: number, status: string) => {
    updateTaskStatusMutation.mutate({ id: taskId, status });
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No financial tasks found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200" data-testid={`task-item-${task.id}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              task.status === "paid" ? "bg-emerald-500" : 
              task.status === "pending" ? "bg-amber-500" : "bg-blue-500"
            }`}></div>
            <div>
              <p className="font-medium text-gray-900">{getExpenseName(task.expenseId)}</p>
              <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">${task.amount}</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {task.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                    onClick={() => handleStatusUpdate(task.id, "paid")}
                    disabled={updateTaskStatusMutation.isPending}
                    data-testid={`button-mark-paid-${task.id}`}
                  >
                    Mark Paid
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200"
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
                  className="text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
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
          </div>
        </div>
      ))}
    </div>
  );
}
