"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serialzeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Note: Arcjet rate limiting works best in API routes, not server actions.
    // Server actions don't have access to the Next.js Request object the same way.
    // If you need rate limiting here, consider using Arcjet in an API wrapper instead,
    // or use a simple in-memory rate limiter for server actions.

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User Not Found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not Found");
    }

    // For TRANSFER, validate destination account
    let toAccount = null;
    if (data.type === "TRANSFER") {
      if (!data.toAccountId) {
        throw new Error("Destination account is required for transfers");
      }
      if (data.accountId === data.toAccountId) {
        throw new Error("Source and destination accounts must be different");
      }

      toAccount = await db.account.findUnique({
        where: {
          id: data.toAccountId,
          userId: user.id,
        },
      });

      if (!toAccount) {
        throw new Error("Destination account not found");
      }
    }

    // Coerce and validate incoming fields to avoid invalid values (e.g. amount = NaN)
    const amountNum = Number(data.amount);
    if (Number.isNaN(amountNum)) throw new Error("Invalid amount");

    const dateObj = data.date ? new Date(data.date) : new Date();

    // Calculate balance changes
    let sourceBalanceChange = 0;
    let destinationBalanceChange = 0;

    if (data.type === "TRANSFER") {
      // Transfer: decrease from source, increase in destination
      sourceBalanceChange = -amountNum;
      destinationBalanceChange = amountNum;
    } else {
      // Income/Expense: only affect source account
      sourceBalanceChange = data.type === "EXPENSE" ? -amountNum : amountNum;
    }

    const newSourceBalance = account.balance.toNumber() + sourceBalanceChange;
    const newDestinationBalance = toAccount
      ? toAccount.balance.toNumber() + destinationBalanceChange
      : null;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          // only pass validated/coerced fields
          type: data.type,
          amount: amountNum,
          description: data.description || null,
          date: dateObj,
          isRecurring: Boolean(data.isRecurring),
          recurringInterval: data.recurringInterval || null,
          nextRecurrence:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(dateObj, data.recurringInterval)
              : null,
          accountId: data.accountId,
          toAccountId: data.type === "TRANSFER" ? data.toAccountId : null,
          userId: user.id,
        },
      });

      // Update source account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newSourceBalance },
      });

      // Update destination account balance for transfers
      if (data.type === "TRANSFER" && toAccount) {
        await tx.account.update({
          where: { id: data.toAccountId },
          data: { balance: newDestinationBalance },
        });
      }

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);
    if (data.type === "TRANSFER" && data.toAccountId) {
      revalidatePath(`/account/${data.toAccountId}`);
    }

    return { success: true, data: serialzeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
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

// Get transaction by ID for editing
export async function getTransaction(transactionId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User Not Found");
    }

    const transaction = await db.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id,
      },
      include: {
        account: true,
        toAccount: true,
      },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return {
      success: true,
      data: {
        ...serialzeAmount(transaction),
        date: transaction.date,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Update transaction
export async function updateTransaction(transactionId, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User Not Found");
    }

    // Get the existing transaction
    const existingTransaction = await db.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id,
      },
      include: {
        account: true,
        toAccount: true,
      },
    });

    if (!existingTransaction) {
      throw new Error("Transaction not found");
    }

    // Validate new account
    if (!data.accountId) {
      throw new Error("Account ID is required for updating a transaction");
    }
    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not Found");
    }

    // For TRANSFER, validate destination account
    let toAccount = null;
    if (data.type === "TRANSFER") {
      if (!data.toAccountId) {
        throw new Error("Destination account is required for transfers");
      }
      if (data.accountId === data.toAccountId) {
        throw new Error("Source and destination accounts must be different");
      }

      toAccount = await db.account.findUnique({
        where: {
          id: data.toAccountId,
          userId: user.id,
        },
      });

      if (!toAccount) {
        throw new Error("Destination account not found");
      }
    }

    // Coerce and validate incoming fields
    const amountNum = Number(data.amount);
    if (Number.isNaN(amountNum)) throw new Error("Invalid amount");

    const dateObj = data.date ? new Date(data.date) : new Date();

    // Calculate OLD transaction effect (reverse it)
    const oldAmount = existingTransaction.amount.toNumber();
    let oldSourceBalanceChange = 0;
    let oldDestinationBalanceChange = 0;

    if (existingTransaction.type === "TRANSFER") {
      oldSourceBalanceChange = oldAmount; // Reverse: add back to source
      oldDestinationBalanceChange = -oldAmount; // Reverse: subtract from destination
    } else {
      oldSourceBalanceChange = existingTransaction.type === "EXPENSE" ? oldAmount : -oldAmount;
    }

    // Calculate NEW transaction effect
    let newSourceBalanceChange = 0;
    let newDestinationBalanceChange = 0;

    if (data.type === "TRANSFER") {
      newSourceBalanceChange = -amountNum;
      newDestinationBalanceChange = amountNum;
    } else {
      newSourceBalanceChange = data.type === "EXPENSE" ? -amountNum : amountNum;
    }

    // Get current balances from database (they may have changed since transaction was created)
    const currentSourceAccount = await db.account.findUnique({
      where: { id: data.accountId },
    });
    const currentSourceBalance = currentSourceAccount.balance.toNumber();

    const oldSourceAccount = await db.account.findUnique({
      where: { id: existingTransaction.accountId },
    });
    const oldSourceBalance = oldSourceAccount.balance.toNumber();

    // Calculate final balances
    // Reverse old effect, then apply new effect
    let finalSourceBalance;
    let finalDestinationBalance = null;
    let oldSourceFinalBalance = null;
    let oldDestinationFinalBalance = null;

    if (data.accountId === existingTransaction.accountId) {
      // Same source account - reverse old, apply new
      finalSourceBalance = currentSourceBalance + oldSourceBalanceChange + newSourceBalanceChange;
    } else {
      // Different source account
      // Reverse old effect on old account
      oldSourceFinalBalance = oldSourceBalance + oldSourceBalanceChange;
      // Apply new effect on new account
      finalSourceBalance = currentSourceBalance + newSourceBalanceChange;
    }

    // Handle destination account for transfers
    if (data.type === "TRANSFER" && toAccount) {
      const currentDestAccount = await db.account.findUnique({
        where: { id: data.toAccountId },
      });
      const currentDestBalance = currentDestAccount.balance.toNumber();

      if (data.toAccountId === existingTransaction.toAccountId && existingTransaction.toAccount) {
        // Same destination account
        finalDestinationBalance = currentDestBalance + oldDestinationBalanceChange + newDestinationBalanceChange;
      } else {
        // Different destination account
        // Reverse old effect on old destination if it was a transfer
        if (existingTransaction.type === "TRANSFER" && existingTransaction.toAccount) {
          const oldDestAccount = await db.account.findUnique({
            where: { id: existingTransaction.toAccountId },
          });
          oldDestinationFinalBalance = oldDestAccount.balance.toNumber() + oldDestinationBalanceChange;
        }
        // Apply new effect on new destination
        finalDestinationBalance = currentDestBalance + newDestinationBalanceChange;
      }
    } else if (existingTransaction.type === "TRANSFER" && existingTransaction.toAccount) {
      // Old was transfer, new is not - reverse destination
      const oldDestAccount = await db.account.findUnique({
        where: { id: existingTransaction.toAccountId },
      });
      oldDestinationFinalBalance = oldDestAccount.balance.toNumber() + oldDestinationBalanceChange;
    }

    // Update transaction and balances
    const updatedTransaction = await db.$transaction(async (tx) => {
      // Update transaction
      const transaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          type: data.type,
          amount: amountNum,
          description: data.description || null,
          date: dateObj,
          isRecurring: Boolean(data.isRecurring),
          recurringInterval: data.recurringInterval || null,
          nextRecurrence:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(dateObj, data.recurringInterval)
              : null,
          accountId: data.accountId,
          toAccountId: data.type === "TRANSFER" ? data.toAccountId : null,
        },
      });

      // Update source account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: finalSourceBalance },
      });

      // Update old source account if different
      if (data.accountId !== existingTransaction.accountId && oldSourceFinalBalance !== null) {
        await tx.account.update({
          where: { id: existingTransaction.accountId },
          data: { balance: oldSourceFinalBalance },
        });
      }

      // Update destination account for transfers
      if (data.type === "TRANSFER" && toAccount && finalDestinationBalance !== null) {
        await tx.account.update({
          where: { id: data.toAccountId },
          data: { balance: finalDestinationBalance },
        });
      }

      // Update old destination account if different
      if (oldDestinationFinalBalance !== null) {
        await tx.account.update({
          where: { id: existingTransaction.toAccountId },
          data: { balance: oldDestinationFinalBalance },
        });
      }

      return transaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${updatedTransaction.accountId}`);
    if (data.type === "TRANSFER" && data.toAccountId) {
      revalidatePath(`/account/${data.toAccountId}`);
    }
    if (existingTransaction.accountId !== data.accountId) {
      revalidatePath(`/account/${existingTransaction.accountId}`);
    }

    return { success: true, data: serialzeAmount(updatedTransaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}
