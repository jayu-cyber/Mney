
import { inngest } from "@/lib/inngest/client";
import { checkBudgetAlert, generateMonthlyReports, processRecurringTransactions, processRecurringTransactionsEvent } from "@/lib/inngest/function";
import { serve } from "inngest/next";
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlert,
    processRecurringTransactions,
    processRecurringTransactionsEvent,
    generateMonthlyReports,
  ],
});