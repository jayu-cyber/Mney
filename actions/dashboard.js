"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not Found");
    }

    //convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid Balance Amount");
    }

    // if this account should be default ,unset other default accounts
    const existingAccount = await db.account.findMany({
      where: { userId: user.id },
    });

    const shouldDefaut = existingAccount.length === 0 ? true : data.isDefault;

    if (shouldDefaut) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldDefaut,
      },
    });

    const serializedAccount = serializeTransaction(account);
    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getUserAccount() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not Found");
  }

  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Get income and expense totals for each account
  const accountsWithTotals = await Promise.all(
    accounts.map(async (account) => {
      const transactions = await db.transaction.findMany({
        where: { accountId: account.id },
        select: {
          type: true,
          amount: true,
        },
      });

      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach((txn) => {
        const amount = txn.amount.toNumber();
        if (txn.type === "INCOME") {
          totalIncome += amount;
        } else if (txn.type === "EXPENSE") {
          totalExpense += amount;
        }
      });

      return {
        ...serializeTransaction(account),
        totalIncome,
        totalExpense,
      };
    })
  );

  return accountsWithTotals;
}

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get all user transactions
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map(serializeTransaction);
}