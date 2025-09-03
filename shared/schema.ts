import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  doublePrecision,
  text,
  boolean,
  smallint,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Category table
export const categories = pgTable("category", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").notNull().references(() => users.id),
});

// Expense table
export const expenses = pgTable("expense", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  type: text("type").notNull(), // recurring, one-time
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  generatedAt: smallint("generated_at"), // day of month when tasks are generated
  dueDate: smallint("due_date").notNull(), // day of month when payment is due
  isArchived: boolean("is_archived").default(false),
  userId: varchar("user_id").notNull().references(() => users.id),
});

// Financial task table
export const finTasks = pgTable("fin_task", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  expenseId: integer("expense_id").notNull().references(() => expenses.id),
  amount: doublePrecision("amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, hold
  createdAt: timestamp("created_at").defaultNow(),
  generatedAt: date("generated_at").notNull(),
  dueDate: date("due_date").notNull(),
  updatedAt: date("updated_at").defaultNow(),
  userId: varchar("user_id").notNull().references(() => users.id),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  expenses: many(expenses),
  finTasks: many(finTasks),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
  finTasks: many(finTasks),
}));

export const finTasksRelations = relations(finTasks, ({ one }) => ({
  user: one(users, {
    fields: [finTasks.userId],
    references: [users.id],
  }),
  expense: one(expenses, {
    fields: [finTasks.expenseId],
    references: [expenses.id],
  }),
}));

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories, {
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
}).pick({
  name: true,
  type: true,
});

export const insertExpenseSchema = createInsertSchema(expenses, {
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  type: z.string().min(1, "Type is required"),
  dueDate: z.number().min(1).max(31, "Due date must be between 1-31"),
}).pick({
  name: true,
  amount: true,
  currency: true,
  type: true,
  categoryId: true,
  dueDate: true,
  generatedAt: true,
});

export const insertFinTaskSchema = createInsertSchema(finTasks, {
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  expenseId: z.number().min(1, "Expense ID is required"),
  generatedAt: z.string(),
  dueDate: z.string(),
}).pick({
  expenseId: true,
  amount: true,
  status: true,
  generatedAt: true,
  dueDate: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type FinTask = typeof finTasks.$inferSelect;
export type InsertFinTask = z.infer<typeof insertFinTaskSchema>;
