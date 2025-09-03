import cron from "node-cron";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";

export function startScheduler() {
  // Run on the 1st day of every month at 00:01
  cron.schedule('1 0 1 * *', async () => {
    console.log('Starting monthly task generation...');
    
    try {
      // Get all users
      const allUsers = await db.select().from(users);
      
      const currentDate = new Date();
      
      for (const user of allUsers) {
        try {
          const tasks = await storage.generateMonthlyTasks(user.id, currentDate);
          console.log(`Generated ${tasks.length} tasks for user ${user.id}`);
        } catch (error) {
          console.error(`Error generating tasks for user ${user.id}:`, error);
        }
      }
      
      console.log('Monthly task generation completed');
    } catch (error) {
      console.error('Error in monthly task generation:', error);
    }
  });

  console.log('Scheduler started - Monthly task generation will run on the 1st of each month at 00:01');
}
