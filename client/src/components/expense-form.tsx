import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { X } from "lucide-react";

const expenseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  type: z.string().min(1, "Type is required"),
  categoryId: z.number().optional(),
  dueDate: z.number().min(1).max(31),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense?: any;
  categories: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ExpenseForm({ expense, categories, onClose, onSuccess }: ExpenseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: expense?.name || "",
      amount: expense?.amount || 0,
      currency: expense?.currency || "USD",
      type: expense?.type || "recurring",
      categoryId: expense?.categoryId || undefined,
      dueDate: expense?.dueDate || 1,
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      if (expense) {
        await apiRequest("PUT", `/api/expenses/${expense.id}`, data);
      } else {
        await apiRequest("POST", "/api/expenses", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: expense ? "Expense updated successfully" : "Expense created successfully",
      });
      onSuccess();
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
        description: expense ? "Failed to update expense" : "Failed to create expense",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    createExpenseMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="modal-expense-form">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {expense ? "Edit Expense" : "Add New Expense"}
          </h3>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
            data-testid="button-close-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Expense Name
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Netflix Subscription"
              className="w-full"
              data-testid="input-expense-name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                placeholder="0.00"
                className="w-full"
                data-testid="input-expense-amount"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </Label>
              <Select 
                value={watch("currency")} 
                onValueChange={(value) => setValue("currency", value)}
              >
                <SelectTrigger data-testid="select-currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </Label>
            <Select 
              value={watch("categoryId")?.toString()} 
              onValueChange={(value) => setValue("categoryId", parseInt(value))}
            >
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </Label>
            <Select 
              value={watch("type")} 
              onValueChange={(value) => setValue("type", value)}
            >
              <SelectTrigger data-testid="select-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">Recurring</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Day of Month)
            </Label>
            <Input
              id="dueDate"
              type="number"
              min="1"
              max="31"
              {...register("dueDate", { valueAsNumber: true })}
              placeholder="15"
              className="w-full"
              data-testid="input-due-date"
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-brand-500 hover:bg-brand-600"
              disabled={createExpenseMutation.isPending}
              data-testid="button-submit"
            >
              {createExpenseMutation.isPending
                ? "Saving..."
                : expense
                ? "Update Expense"
                : "Create Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
