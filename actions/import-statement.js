"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function importBankStatement(csvData, accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify account ownership
    const account = await db.account.findUnique({
      where: { id: accountId },
    });

    if (!account || account.userId !== user.id) {
      throw new Error("Account not found or unauthorized");
    }

    // Parse CSV data
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV file is empty");
    }

    // Extract header (first line)
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase().replace(/"/g, ""));

    // Find column indices (flexible for different formats)
    const dateIndex = headers.findIndex(
      (h) => h.includes("date") || h.includes("transaction")
    );
    const descIndex = headers.findIndex(
      (h) => h.includes("description") || h.includes("memo") || h.includes("narration")
    );
    const amountIndex = headers.findIndex(
      (h) => h.includes("amount") || h.includes("debit") || h.includes("credit")
    );
    const typeIndex = headers.findIndex(
      (h) => h.includes("type") || h.includes("transaction type")
    );

    if (dateIndex === -1 || amountIndex === -1) {
      throw new Error(
        "CSV must contain 'Date' and 'Amount' columns"
      );
    }

    // Parse transactions
    const transactions = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      try {
        // Parse CSV line (handle quoted values)
        const values = line
          .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
          .map((v) => v.trim().replace(/"/g, ""));

        const dateStr = values[dateIndex]?.trim();
        const description = values[descIndex]?.trim() || "Transaction";
        const amountStr = values[amountIndex]?.trim();
        const typeStr = values[typeIndex]?.trim().toUpperCase() || "";

        if (!dateStr || !amountStr) {
          errors.push(`Row ${i + 1}: Missing date or amount`);
          continue;
        }

        // Parse date (handle multiple formats)
        let date;
        try {
          date = parseDate(dateStr);
        } catch {
          errors.push(`Row ${i + 1}: Invalid date format "${dateStr}"`);
          continue;
        }

        // Parse amount
        const amount = parseFloat(
          amountStr.replace(/[^0-9.-]/g, "")
        );
        if (isNaN(amount) || amount === 0) {
          errors.push(`Row ${i + 1}: Invalid amount "${amountStr}"`);
          continue;
        }

        // Determine transaction type
        let type = "EXPENSE";
        if (typeStr.includes("INCOME") || typeStr.includes("CREDIT") || amount > 0) {
          type = "INCOME";
        } else if (typeStr.includes("EXPENSE") || typeStr.includes("DEBIT")) {
          type = "EXPENSE";
        }

        transactions.push({
          date,
          description,
          amount: Math.abs(amount),
          type,
        });
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    if (transactions.length === 0) {
      throw new Error(
        `No valid transactions found. ${errors.length > 0 ? "Errors: " + errors.join("; ") : ""}`
      );
    }

    // Create transactions in database
    const createdTransactions = await Promise.all(
      transactions.map((txn) =>
        db.transaction.create({
          data: {
            ...txn,
            amount: txn.amount,
            status: "COMPLETED",
            userId: user.id,
            accountId: account.id,
          },
        })
      )
    );

    // Update account balance
    let balanceChange = 0;
    createdTransactions.forEach((txn) => {
      if (txn.type === "INCOME") {
        balanceChange += parseFloat(txn.amount);
      } else {
        balanceChange -= parseFloat(txn.amount);
      }
    });

    await db.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: balanceChange,
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${accountId}`);

    return {
      success: true,
      message: `Successfully imported ${createdTransactions.length} transactions${
        errors.length > 0 ? `. ${errors.length} rows skipped.` : ""
      }`,
      imported: createdTransactions.length,
      skipped: errors.length,
      errors: errors.slice(0, 5), // Return first 5 errors
    };
  } catch (error) {
    console.error("Import error:", error);
    return {
      success: false,
      message: error.message || "Failed to import bank statement",
    };
  }
}

// Helper function to parse various date formats
function parseDate(dateStr) {
  // Try ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return new Date(dateStr);
  }

  // Try DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateStr)) {
    const [day, month, year] = dateStr.split("/");
    return new Date(`${year}-${month}-${day}`);
  }

  // Try MM/DD/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateStr)) {
    const [month, day, year] = dateStr.split("/");
    return new Date(`${year}-${month}-${day}`);
  }

  // Try DD-MM-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}/.test(dateStr)) {
    const [day, month, year] = dateStr.split("-");
    return new Date(`${year}-${month}-${day}`);
  }

  throw new Error(`Unsupported date format: ${dateStr}`);
}
