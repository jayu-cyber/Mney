"use client";

import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import useFetch from "@/hooks/use-fetch";
import { useTranslation } from "@/lib/use-translation";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CurrencyAmount from "@/components/currency-amount";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ReceiptScanner } from "@/components/receipt-scanner";

const AddTransactionForm = ({
  accounts = [],
  categories = [],
  editMode = false,
  transactionData = null,
}) => {
  const { t } = useTranslation();

  const getDefaultValues = useCallback(
    (data) => {
      const fallbackAccountId =
        accounts.find((ac) => ac.isDefault)?.id || accounts[0]?.id || "";

      return {
        type: data?.type || "EXPENSE",
        amount:
          data?.amount !== undefined && data?.amount !== null
            ? String(data.amount)
            : "",
        description: data?.description || "",
        accountId: data?.accountId || fallbackAccountId || "",
        toAccountId: data?.toAccountId || "",
        date: data?.date ? new Date(data.date) : new Date(),
        isRecurring: data?.isRecurring ?? false,
        recurringInterval: data?.recurringInterval || undefined,
      };
    },
    [accounts]
  );

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: getDefaultValues(transactionData),
  });

  useEffect(() => {
    reset(getDefaultValues(transactionData));
  }, [transactionData, reset, getDefaultValues]);

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(async (payload) => {
    if (editMode) {
      if (!transactionData?.id) {
        throw new Error("Transaction ID is required for editing");
      }
      return updateTransaction(transactionData.id, payload);
    }

    return createTransaction(payload);
  });

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const router = useRouter();

  const onSubmit = async (data) => {
    const amountNum = parseFloat(data.amount);

    if (Number.isNaN(amountNum)) {
      setError("amount", { type: "manual", message: "Invalid amount" });
      toast.error(t("invalidAmount"));
      return;
    }

    if (amountNum <= 0) {
      setError("amount", {
        type: "manual",
        message: "Amount must be greater than 0",
      });
      toast.error(t("amountPositive"));
      return;
    }

    const formData = { ...data, amount: amountNum };

    transactionFn(formData);
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        t(editMode ? "transactionUpdatedSuccess" : "transactionCreatedSuccess")
      );
      if (!editMode) {
        reset(getDefaultValues(null));
      }
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [
    transactionResult?.success,
    transactionLoading,
    reset,
    router,
    t,
    editMode,
    getDefaultValues,
  ]);

  const handleReceiptScan = (data) => {
    if (data.amount) setValue("amount", String(data.amount));
    if (data.date) setValue("date", new Date(data.date));
    if (data.description) setValue("description", data.description);
    if (data.type) setValue("type", data.type);

    toast.success("Transaction form filled from receipt!");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-800"
    >
      <div className="mb-6">
        <ReceiptScanner onScanComplete={handleReceiptScan} />
      </div>

      <div className="space-y-4 w-full max-w-3xl mx-auto px-4 md:pl-20">
        {/* TYPE */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("type")}</label>
          <Select
            onValueChange={(value) => setValue("type", value)}
            defaultValue={type}
          >
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder={t("type")} />
            </SelectTrigger>
            <SelectContent className="w-full min-w-[250px]">
              <SelectItem value="EXPENSE">{t("expense")}</SelectItem>
              <SelectItem value="INCOME">{t("income")}</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-500">{errors.type.message}</p>
          )}
        </div>

        {/* AMOUNT + ACCOUNT */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("amount")}</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full h-10"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("account")}</label>
            <Select
              onValueChange={(value) => setValue("accountId", value)}
              defaultValue={getValues("accountId")}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder={t("account")} />
              </SelectTrigger>
              <SelectContent className="w-full min-w-[250px]">
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex justify-between w-full">
                      <span>{account.name}</span>
                      <span className="ml-2">
                        <CurrencyAmount amount={account.balance} />
                      </span>
                    </div>
                  </SelectItem>
                ))}
                <CreateAccountDrawer>
                  <Button variant="ghost" className="w-full text-sm">
                    {t("createAccount")}
                  </Button>
                </CreateAccountDrawer>
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-sm text-red-500">{errors.accountId.message}</p>
            )}
          </div>
        </div>

        {/* TRANSFER → TO ACCOUNT */}
        {type === "TRANSFER" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">To Account</label>
            <Select
              onValueChange={(value) => setValue("toAccountId", value)}
              defaultValue={getValues("toAccountId")}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select destination account" />
              </SelectTrigger>
              <SelectContent className="w-full min-w-[250px]">
                {accounts
                  .filter((acc) => acc.id !== getValues("accountId"))
                  .map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.toAccountId && (
              <p className="text-sm text-red-500">
                {errors.toAccountId.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* DATE PICKER */}
      <div className="space-y-2 w-full max-w-3xl mx-auto px-4 md:pl-20">
        <label className="text-sm font-medium">{t("date")}</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full pl-3 text-left">
              {date ? format(date, "PP") : <span>{t("pickDate")}</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => setValue("date", d)}
              disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-2 w-full max-w-3xl mx-auto px-4 md:pl-20">
        <label className="text-sm font-medium">{t("description")}</label>
        <Input placeholder={t("description")} {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* RECURRING */}
      <div className="w-full max-w-3xl mx-auto px-4 md:pl-20">
        <div className="flex items-center justify-between border p-3 rounded-md">
          <div>
            <label className="text-base font-medium">{t("recurring")}</label>
            <p className="text-sm text-muted-foreground">{t("recurring")}</p>
          </div>
          <Switch
            checked={isRecurring}
            onCheckedChange={(checked) => setValue("isRecurring", checked)}
          />
        </div>
      </div>

      {isRecurring && (
        <div className="space-y-2 w-full max-w-3xl mx-auto px-4 md:pl-20">
          <label className="text-sm font-medium">
            {t("recurringInterval")}
          </label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder={t("recurringInterval")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">{t("daily")}</SelectItem>
              <SelectItem value="WEEKLY">{t("weekly")}</SelectItem>
              <SelectItem value="MONTHLY">{t("monthly")}</SelectItem>
              <SelectItem value="YEARLY">{t("yearly")}</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="w-full max-w-3xl mx-auto px-4 md:pl-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full"
            onClick={() => router.back()}
          >
            {t("cancel")}
          </Button>

          <Button
            type="submit"
            className="h-12 w-full md:col-span-2"
            disabled={transactionLoading}
          >
            {transactionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t(editMode ? "updateTransaction" : "createTransaction")}
              </>
            ) : (
              t(editMode ? "updateTransaction" : "createTransaction")
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddTransactionForm;
