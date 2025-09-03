import {
  users,
  categories,
  expenses,
  finTasks,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Expense,
  type InsertExpense,
  type FinTask,
  type InsertFinTask,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  createCategory(userId: string, category: InsertCategory): Promise<Category>;
  updateCategory(userId: string, id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(userId: string, id: number): Promise<void>;
  
  // Expense operations
  getExpenses(userId: string): Promise<Expense[]>;
  getExpense(userId: string, id: number): Promise<Expense | undefined>;
  createExpense(userId: string, expense: InsertExpense): Promise<Expense>;
  updateExpense(userId: string, id: number, expense: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(userId: string, id: number): Promise<void>;
  
  // Financial task operations
  getFinTasks(userId: string, month?: string, year?: number): Promise<FinTask[]>;
  createFinTask(userId: string, task: InsertFinTask): Promise<FinTask>;
  updateFinTaskStatus(userId: string, id: number, status: string): Promise<FinTask>;
  generateMonthlyTasks(userId: string, targetMonth: Date): Promise<FinTask[]>;
  
  // Dashboard stats
  getDashboardStats(userId: string): Promise<{
    totalExpenses: number;
    pendingTasks: number;
    completedTasks: number;
    categories: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(desc(categories.createdAt));
  }

  async createCategory(userId: string, category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values({ 
        name: category.name,
        type: category.type,
        userId 
      })
      .returning();
    return newCategory;
  }

  async updateCategory(userId: string, id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(userId: string, id: number): Promise<void> {
    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  }

  // Expense operations
  async getExpenses(userId: string): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.isArchived, false)))
      .orderBy(desc(expenses.createdAt));
  }

  async getExpense(userId: string, id: number): Promise<Expense | undefined> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    return expense;
  }

  async createExpense(userId: string, expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db
      .insert(expenses)
      .values({ 
        name: expense.name,
        amount: expense.amount,
        currency: expense.currency,
        type: expense.type,
        categoryId: expense.categoryId,
        dueDate: expense.dueDate,
        generatedAt: expense.generatedAt,
        userId 
      })
      .returning();
    return newExpense;
  }

  async updateExpense(userId: string, id: number, expense: Partial<InsertExpense>): Promise<Expense> {
    const [updatedExpense] = await db
      .update(expenses)
      .set({ ...expense, updatedAt: new Date() })
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return updatedExpense;
  }

  async deleteExpense(userId: string, id: number): Promise<void> {
    await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  }

  // Financial task operations
  async getFinTasks(userId: string, month?: string, year?: number): Promise<FinTask[]> {
    let whereConditions = [eq(finTasks.userId, userId)];

    if (month && year) {
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0);
      whereConditions.push(
        gte(finTasks.generatedAt, startDate.toISOString().split('T')[0]),
        lte(finTasks.generatedAt, endDate.toISOString().split('T')[0])
      );
    }

    return await db
      .select()
      .from(finTasks)
      .where(and(...whereConditions))
      .orderBy(desc(finTasks.dueDate));
  }

  async createFinTask(userId: string, task: InsertFinTask): Promise<FinTask> {
    const [newTask] = await db
      .insert(finTasks)
      .values({ 
        expenseId: task.expenseId,
        amount: task.amount,
        status: task.status || 'pending',
        generatedAt: task.generatedAt,
        dueDate: task.dueDate,
        userId 
      })
      .returning();
    return newTask;
  }

  async updateFinTaskStatus(userId: string, id: number, status: string): Promise<FinTask> {
    const [updatedTask] = await db
      .update(finTasks)
      .set({ status, updatedAt: new Date().toISOString().split('T')[0] })
      .where(and(eq(finTasks.id, id), eq(finTasks.userId, userId)))
      .returning();
    return updatedTask;
  }

  async generateMonthlyTasks(userId: string, targetMonth: Date): Promise<FinTask[]> {
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        eq(expenses.isArchived, false),
        eq(expenses.type, "recurring")
      ));

    const tasks: FinTask[] = [];
    const year = targetMonth.getFullYear();
    const month = targetMonth.getMonth();

    for (const expense of userExpenses) {
      const dueDate = new Date(year, month, expense.dueDate);
      const generatedAt = targetMonth.toISOString().split('T')[0];

      const [task] = await db
        .insert(finTasks)
        .values({
          expenseId: expense.id,
          amount: expense.amount,
          status: "pending",
          generatedAt,
          dueDate: dueDate.toISOString().split('T')[0],
          userId,
        })
        .returning();

      tasks.push(task);
    }

    return tasks;
  }

  async getDashboardStats(userId: string): Promise<{
    totalExpenses: number;
    pendingTasks: number;
    completedTasks: number;
    categories: number;
  }> {
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.isArchived, false)));

    const currentMonth = new Date();
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyTasks = await db
      .select()
      .from(finTasks)
      .where(
        and(
          eq(finTasks.userId, userId),
          gte(finTasks.generatedAt, startDate.toISOString().split('T')[0]),
          lte(finTasks.generatedAt, endDate.toISOString().split('T')[0])
        )
      );

    const userCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));

    const totalExpenses = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const pendingTasks = monthlyTasks.filter(task => task.status === "pending").length;
    const completedTasks = monthlyTasks.filter(task => task.status === "paid").length;

    return {
      totalExpenses,
      pendingTasks,
      completedTasks,
      categories: userCategories.length,
    };
  }
}

export const storage = new DatabaseStorage();
