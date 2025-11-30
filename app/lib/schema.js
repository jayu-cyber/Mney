import { X } from "lucide-react";
import z from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.string().min(1, "Intial balance is required"),
  isDefault: z.boolean().default(false),
});
export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    // Coerce amount to a number on the client using zod's coercion helper.
    // This ensures the resolver provides a numeric `amount` to the form values.
    amount: z
      .coerce
      .number({ invalid_type_error: "Amount must be a number" })
      .refine((v) => v > 0, { message: "Amount must be greater than 0" }),
    description: z.string().optional(),
    // fix option name for required error
    date: z.date({ required_error: "Date is Required" }),
    accountId: z.string().min(1, "Account is required"),
    toAccountId: z.string().optional(), // For TRANSFER transactions
    // category: z.string().min(1, "Category is required"), // removed
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transaction",
        path: ["recurringInterval"],
      });
    }
    if (data.type === "TRANSFER" && !data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Destination account is required for transfers",
        path: ["toAccountId"],
      });
    }
    if (data.type === "TRANSFER" && data.accountId === data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Source and destination accounts must be different",
        path: ["toAccountId"],
      });
    }
  });
