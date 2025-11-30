import { sendEmail } from "@/actions/send-email";
import { db } from "../prisma";
import { inngest } from "./client";
import { revalidatePath } from "next/cache";
// import Email from "@/emails/template";
import EmailTemplate from "@/emails/template";

export const checkBudgetAlert = inngest.createFunction(
  { name: "check Budget Alerts", id: "check-budget-alerts" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budget", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue; // skip if no deafult account

      await step.run(`check-budget-${budget.id}`, async () => {
        const currentDate = new Date();
        const startMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const endMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );

        // Sum expenses for the current month for the user's default account
        const expense = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: {
              gte: startMonth,
              lte: endMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpense = expense._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount;
        const percentageUsed = (totalExpense / budgetAmount) * 100;

        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          //send Email
          console.log("Attempting to send email with data:", {
            email: budget.user.email,
            name: budget.user.name,
            percentageUsed,
            budgetAmount: parseFloat(budgetAmount).toFixed(1),
            totalExpenses: parseFloat(totalExpense).toFixed(1),
          });

          const emailResult = await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert", // Fixed casing to match template
              data: {
                percentageUsed,
                budgetAmount: parseFloat(budgetAmount).toFixed(1),
                totalExpenses: parseFloat(totalExpense).toFixed(1),
                accountName: defaultAccount.name,
              },
            }),
          });

          console.log("Email sending result:", emailResult);

          console.log("Email sent successfully");

          // Update lastAlertSent timestamp
          try {
            await db.budget.update({
              where: { id: budget.id },
              data: { lastAlertSent: new Date() },
            });
          } catch (err) {
            // If the record was removed or the update failed (P2025), log and try a safe non-throwing fallback
            console.error(
              "Failed to update budget last-alert timestamp for id",
              budget.id,
              err?.code ?? err?.message ?? err
            );
            try {
              const res = await db.budget.updateMany({
                where: { id: budget.id },
                data: { lastAlertSent: new Date() },
              });
              console.log("Fallback updateMany result count:", res.count);
            } catch (err2) {
              console.error(
                "Fallback updateMany also failed for budget id",
                budget.id,
                err2?.code ?? err2?.message ?? err2
              );
            }
          }
        }
      });
    }
  }
);

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

// Shared function to process recurring transactions
async function processRecurringTransactionsLogic(step) {
  const now = new Date();

  // Find all recurring transactions that are due
  const dueRecurringTransactions = await step.run(
    "fetch-due-recurring",
    async () => {
      return await db.transaction.findMany({
        where: {
          isRecurring: true,
          recurringInterval: {
            not: null, // Must have an interval
          },
          nextRecurrence: {
            not: null, // Must have a next recurrence date
            lte: now, // Due date is today or in the past
          },
        },
        include: {
          account: true,
          toAccount: true,
          user: true,
        },
      });
    }
  );

  console.log(
    `Found ${dueRecurringTransactions.length} recurring transactions to process`
  );

  if (dueRecurringTransactions.length === 0) {
    console.log("No recurring transactions due. Checking query conditions...");
    // Debug: Check all recurring transactions
    const allRecurring = await db.transaction.findMany({
      where: { isRecurring: true },
      select: {
        id: true,
        description: true,
        nextRecurrence: true,
        recurringInterval: true,
      },
    });
    console.log(
      "All recurring transactions:",
      JSON.stringify(allRecurring, null, 2)
    );
  }

  // Process each recurring transaction
  const processedTransactions = [];
  for (const recurringTx of dueRecurringTransactions) {
    const result = await step.run(
      `process-recurring-${recurringTx.id}`,
      async () => {
        try {
          const amount = recurringTx.amount.toNumber();
          const account = recurringTx.account;
          let toAccount = recurringTx.toAccount;

          console.log(`Processing recurring transaction:`, {
            id: recurringTx.id,
            type: recurringTx.type,
            amount: amount,
            description: recurringTx.description,
            accountId: account.id,
            accountName: account.name,
            nextRecurrence: recurringTx.nextRecurrence,
          });

          // Calculate balance changes
          let sourceBalanceChange = 0;
          let destinationBalanceChange = 0;

          if (recurringTx.type === "TRANSFER") {
            // Transfer: decrease from source, increase in destination
            sourceBalanceChange = -amount;
            destinationBalanceChange = amount;
          } else {
            // Income/Expense: only affect source account
            sourceBalanceChange =
              recurringTx.type === "EXPENSE" ? -amount : amount;
          }

          const newSourceBalance =
            account.balance.toNumber() + sourceBalanceChange;
          const newDestinationBalance = toAccount
            ? toAccount.balance.toNumber() + destinationBalanceChange
            : null;

          let newTransaction;
          // Create the new transaction and update balances in a transaction
          await db.$transaction(async (tx) => {
            // Create new transaction instance
            newTransaction = await tx.transaction.create({
              data: {
                type: recurringTx.type,
                amount: amount,
                description: recurringTx.description || null,
                date: now, // Use current date for the new transaction
                isRecurring: false, // The new transaction is not recurring itself
                accountId: recurringTx.accountId,
                toAccountId: recurringTx.toAccountId || null,
                userId: recurringTx.userId,
                status: "COMPLETED",
              },
            });

            // Update source account balance
            await tx.account.update({
              where: { id: account.id },
              data: { balance: newSourceBalance },
            });

            // Update destination account balance for transfers
            if (recurringTx.type === "TRANSFER" && toAccount) {
              await tx.account.update({
                where: { id: toAccount.id },
                data: { balance: newDestinationBalance },
              });
            }

            // Update the recurring transaction's nextRecurrence and lastRecurrence
            const nextRecurrence = calculateNextRecurringDate(
              now,
              recurringTx.recurringInterval
            );

            await tx.transaction.update({
              where: { id: recurringTx.id },
              data: {
                lastRecurrence: now,
                nextRecurrence: nextRecurrence,
              },
            });
          });

          // Revalidate paths to refresh UI
          revalidatePath("/dashboard");
          revalidatePath(`/account/${account.id}`);
          if (recurringTx.type === "TRANSFER" && toAccount) {
            revalidatePath(`/account/${toAccount.id}`);
          }

          console.log(
            `✅ Processed recurring transaction ${recurringTx.id}: Created new ${recurringTx.type} transaction ${newTransaction.id} for ${amount}`
          );

          return {
            success: true,
            transactionId: newTransaction.id,
            accountId: account.id,
            amount: amount,
            type: recurringTx.type,
          };
        } catch (error) {
          console.error(
            `❌ Error processing recurring transaction ${recurringTx.id}:`,
            error
          );
          return {
            success: false,
            error: error.message,
            transactionId: recurringTx.id,
          };
        }
      }
    );

    processedTransactions.push(result);
  }

  const successful = processedTransactions.filter((r) => r.success).length;
  const failed = processedTransactions.filter((r) => !r.success).length;

  return {
    processed: successful,
    failed: failed,
    total: dueRecurringTransactions.length,
    transactions: processedTransactions,
    message: `Processed ${successful} recurring transactions${failed > 0 ? `, ${failed} failed` : ""}`,
  };
}

// Recurring Transaction Processor - Runs daily to create recurring transactions (Cron)
export const processRecurringTransactions = inngest.createFunction(
  {
    name: "Trigger Recurring Transactions",
    id: "process-recurring-transactions-cron",
  },
  { cron: "0 0 * * *" }, // Run daily at midnight
  async ({ step }) => {
    return await processRecurringTransactionsLogic(step);
  }
);

// Event-based Recurring Transaction Processor - Can be triggered manually
export const processRecurringTransactionsEvent = inngest.createFunction(
  {
    name: "process-recurring-transaction",
    id: "process-recurring-transactions-event",
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    return await processRecurringTransactionsLogic(step);
  }
);

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: {
          accounts: true,
        },
      });
    });
    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });
        const insights = await generateFinancialInsights(stats, monthName);
        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report", // Fixed casing to match template
            data: {
              stats,
              month: monthName,
              insights,
            },
          }),
        });
      });
    }
    return { processed: users.length };
  }
);

async function generateFinancialInsights(stats, month) {
  // Basic insights based on spending patterns
  const insights = [];
  const balance = stats.totalIncome - stats.totalExpenses;
  const expenseRatio =
    stats.totalIncome > 0 ? (stats.totalExpenses / stats.totalIncome) * 100 : 0;

  if (expenseRatio > 80) {
    insights.push(
      `You spent ${expenseRatio.toFixed(1)}% of your income in ${month}. Consider reducing expenses.`
    );
  } else if (expenseRatio < 50 && stats.totalIncome > 0) {
    insights.push(
      `Great job! You only spent ${expenseRatio.toFixed(1)}% of your income in ${month}.`
    );
  }

  if (balance > 0) {
    insights.push(`You saved $${balance.toFixed(2)} this month.`);
  } else if (balance < 0) {
    insights.push(
      `You spent $${Math.abs(balance).toFixed(2)} more than you earned this month.`
    );
  }

  return insights.length > 0
    ? insights
    : ["Keep tracking your finances for better financial health!"];
}
const getMonthlyStats = async (userId, month) => {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const transactions = await db.transaction.findMany({
    where: {
      userId: userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },

    {
      totalExpenses: 0,
      totalIncome: 0,
      transactioncount: transactions.length,
    }
  );
};
