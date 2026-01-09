"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/lib/use-translation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, X, Plus } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { updateBudget, createBudget } from "@/actions/budget";
import CurrencyAmount from "@/components/currency-amount";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  // Prevent divide-by-zero
  const percentUsed =
    initialBudget?.amount > 0
      ? (currentExpenses / initialBudget.amount) * 100
      : 0;

  // Fetch hooks for update and create
  const {
    loading: updating,
    fn: updateBudgetFn,
    data: updatedData,
    error: updateError,
  } = useFetch(updateBudget);

  const {
    loading: creating,
    fn: createBudgetFn,
    data: createdData,
    error: createError,
  } = useFetch(createBudget);

  const handleSave = async () => {
    const amount = Number(newBudget);

    if (!amount || amount <= 0) {
      toast.error("Enter a valid budget amount");
      return;
    }

    if (initialBudget) {
      await updateBudgetFn({ id: initialBudget.id, amount });
    } else {
      await createBudgetFn({ amount });
    }
  };

  // success handling
  useEffect(() => {
    if (updatedData?.success) {
      toast.success("Budget updated successfully");
      setIsEditing(false);
    }
    if (createdData?.success) {
      toast.success("Budget created successfully");
      setIsEditing(false);
    }
  }, [updatedData, createdData]);

  // error handlers
  useEffect(() => {
    if (updateError) toast.error(updateError.message || "Failed to update budget");
    if (createError) toast.error(createError.message || "Failed to create budget");
  }, [updateError, createError]);

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  const loading = updating || creating;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden border-indigo-100 dark:border-indigo-900 ${loading ? "opacity-50 pointer-events-none" : ""}`}>

      {/* Header */}
      <div className="p-6 border-b border-indigo-100 dark:border-indigo-900">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("monthlyBudget")} ({t("defaultAccount")})
        </h3>

        {initialBudget ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span className="font-semibold">
              <CurrencyAmount amount={currentExpenses} />
            </span>{" "}
            {t("of")}{" "}
            <span className="font-semibold text-indigo-600">
              <CurrencyAmount amount={initialBudget.amount} />
            </span>{" "}
            {t("spent")}
          </p>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            No budget set
          </p>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">

        {/* If NO budget → show Add form */}
        {!initialBudget && !isEditing && (
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Enter your budget amount"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
            />
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        )}

        {/* If budget exists → show progress + edit */}
        {initialBudget && (
          <div className="space-y-6">

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</p>
                <span className="text-sm font-bold">
                  {percentUsed.toFixed(1)}% used
                </span>
              </div>

              <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentUsed >= 90
                      ? "bg-red-600"
                      : percentUsed >= 75
                      ? "bg-yellow-500"
                      : "bg-indigo-600"
                  }`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Budget Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                <p className="text-xs text-gray-600 dark:text-gray-400">Budget</p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  <CurrencyAmount amount={initialBudget.amount} />
                </p>
              </div>

              <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/20">
                <p className="text-xs text-gray-600 dark:text-gray-400">Spent</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                  <CurrencyAmount amount={currentExpenses} />
                </p>
              </div>

              <div className="p-4 rounded-lg bg-teal-100 dark:bg-teal-900/20">
                <p className="text-xs text-gray-600 dark:text-gray-400">Remaining</p>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                  <CurrencyAmount amount={Math.max(initialBudget.amount - currentExpenses, 0)} />
                </p>
              </div>
            </div>

            {/* Edit Budget Section */}
            <div className="border-t pt-4 dark:border-indigo-800">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={handleSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Budget
                </Button>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetProgress;
