import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Play,
  Zap
} from "lucide-react";

export default function Schedule() {
  const [targetMonth, setTargetMonth] = useState(new Date().toISOString().slice(0, 7));
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

  const generateTasksMutation = useMutation({
    mutationFn: async (targetDate: string) => {
      await apiRequest("POST", "/api/fin-tasks/generate", {
        targetMonth: new Date(targetDate + "-01").toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fin-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
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

  const generateCurrentMonthTasks = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    generateTasksMutation.mutate(currentMonth);
  };

  const generateCustomMonthTasks = () => {
    if (!targetMonth) {
      toast({
        title: "Error",
        description: "Please select a target month",
        variant: "destructive",
      });
      return;
    }
    generateTasksMutation.mutate(targetMonth);
  };

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const currentDate = new Date();
  const currentMonth = currentDate.toISOString().slice(0, 7);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Task Scheduler</h2>
              <p className="text-gray-600 mt-1">Generate financial tasks for specific months</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Auto-runs 1st of each month at 00:01</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {/* Current Month Generation */}
          <Card data-testid="card-current-month">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Generate Current Month Tasks</h3>
                    <p className="text-gray-600">
                      Generate financial tasks for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={generateCurrentMonthTasks}
                  disabled={generateTasksMutation.isPending}
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
                  data-testid="button-generate-current"
                >
                  <Play className="h-4 w-4" />
                  <span>{generateTasksMutation.isPending ? "Generating..." : "Generate Now"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Month Generation */}
          <Card data-testid="card-custom-month">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Generate Tasks for Specific Month</h3>
                  <p className="text-gray-600">Choose a specific month and year to generate tasks</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <Label htmlFor="target-month" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Month
                  </Label>
                  <Input
                    id="target-month"
                    type="month"
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="w-full"
                    data-testid="input-target-month"
                  />
                </div>
                <div>
                  <Button
                    onClick={generateCustomMonthTasks}
                    disabled={generateTasksMutation.isPending}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
                    data-testid="button-generate-custom"
                  >
                    <Play className="h-4 w-4" />
                    <span>{generateTasksMutation.isPending ? "Generating..." : "Generate Tasks"}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automated Schedule Info */}
          <Card data-testid="card-schedule-info">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Automated Schedule</h3>
                  <p className="text-gray-600">Tasks are automatically generated every month</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">1st</div>
                    <div className="text-sm text-gray-600">Day of Month</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">00:01</div>
                    <div className="text-sm text-gray-600">Time (UTC)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">Auto</div>
                    <div className="text-sm text-gray-600">Recurring</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>How it works:</strong> Every 1st day of the month, the system automatically creates 
                    financial tasks for all your active recurring expenses. You can also manually generate 
                    tasks for specific months using the controls above.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}