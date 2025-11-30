"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { includes, success } from "zod";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };

  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }

  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }

  return serialized;
};

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not Found");
    }

    // Logging for debugging
    console.log("updateDefaultAccount called by clerkUserId:", userId, "targetAccountId:", accountId);

    // Check the account exists and belongs to the user
    const targetAccount = await db.account.findUnique({ where: { id: accountId } });
    if (!targetAccount) {
      throw new Error("Account not found");
    }
    if (targetAccount.userId !== user.id) {
      throw new Error("Unauthorized to modify this account");
    }

    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    const account = await db.account.update({
      where: {
        id: accountId,
      },
      data: { isDefault: true },
    });

    console.log("Successfully set default account", { accountId: account.id, userId: user.id });

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAccountWithTransactions(accountId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not Found");
  }

  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      transactions: {
        include: {
          toAccount: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account) return null;

  return {
    ...serializeTransaction(account),
    transactions: account.transactions.map(serializeTransaction),
  };
}

export async function deleteAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    if (!accountId) {
      throw new Error("Account ID is required");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not Found");
    }

    // Check the account exists and belongs to the user in a single query
    const account = await db.account.findFirst({
      where: { 
        id: accountId,
        userId: user.id, // Ensure it belongs to the user
      },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!account) {
      throw new Error("Account not found or you don't have permission to delete it");
    }

    // Prevent deleting the default account if it's the only account
    const allAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    if (allAccounts.length === 1) {
      throw new Error("Cannot delete the last account. Please create another account first.");
    }

    // If this is the default account, set another account as default
    if (account.isDefault && allAccounts.length > 1) {
      const otherAccount = allAccounts.find((acc) => acc.id !== accountId);
      if (otherAccount) {
        await db.account.update({
          where: { id: otherAccount.id },
          data: { isDefault: true },
        });
      }
    }

    // Delete the account (transactions will be deleted via cascade)
    await db.account.delete({
      where: { id: accountId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    return { success: true };
  } catch (error) {
    console.error("Delete account error:", error);
    return { success: false, error: error.message };
  }
}

export async function bulkDeleteTransacton(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not Found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      let amount = transaction.amount;
      if (typeof amount !== "number" || isNaN(amount)) {
        console.warn("Skipping transaction with invalid amount:", transaction);
        return acc;
      }
      const change = transaction.type === "EXPENSE" ? -amount : amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transaction and update account balance in transaction
    await db.$transaction(async (tx) => {
      // delete transaction
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
        const incrementValue = typeof balanceChange === "number" ? balanceChange : Number(balanceChange);
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: incrementValue,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message };
  }
}
