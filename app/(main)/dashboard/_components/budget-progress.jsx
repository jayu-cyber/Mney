"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "@/lib/use-translation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, X } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { updateBudget, getCurrentBudget } from "@/actions/budget";

export function BudgetProgress({ initialBudget, currentExpenses, accountId }) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [budget, setBudget] = useState(initialBudget);
  const [expenses, setExpenses] = useState(currentExpenses);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  // Refresh budget data periodically or when page comes into focus
  useEffect(() => {
    if (!accountId) return;

    const refreshBudgetData = async () => {
      try {
        const data = await getCurrentBudget(accountId);
        setBudget(data.budget);
        setExpenses(data.currentExpenses || 0);
      } catch (err) {
        console.error("Error refreshing budget:", err);
      }
    };

    // Refresh on mount and when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshBudgetData();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [accountId]);

  const percentUsed = budget ? (expenses / budget.amount) * 100 : 0;

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error(t("invalidAmount"));
      return;
    }

    await updateBudgetFn(amount);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      setBudget(updatedBudget.data);
      setNewBudget(updatedBudget.data.amount.toString());
      toast.success(t("budgetUpdated"));
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || t("failedUpdateBudget"));
    }
  }, [error]);

  const handleCancel = () => {
    setNewBudget(budget?.amount?.toString() || "");
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-indigo-100 dark:border-indigo-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("monthlyBudget")} ({t("defaultAccount")})
          </h3>
          {budget && typeof expenses === "number" ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                ${expenses.toFixed(2)}
              </span>{" "}
              {t("of")}{" "}
              <span className="font-semibold text-indigo-600">
                ${Number(budget?.amount ?? 0).toFixed(2)}
              </span>{" "}
              {t("spent")}
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {t("noBudgetSet")}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {!budget && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t("noBudgetSet")}
            </p>
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Pencil className="h-4 w-4 mr-2" />
              {t("createBudget") || "Create Budget"}
            </Button>
          </div>
        )}
        {budget && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress
                </p>
                <span
                  className={`text-sm font-bold ${
                    percentUsed >= 90
                      ? "text-red-600 dark:text-red-400"
                      : percentUsed >= 75
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {percentUsed.toFixed(1)}% {t("used")}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    percentUsed >= 90
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : percentUsed >= 75
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                        : "bg-gradient-to-r from-indigo-600 to-teal-500"
                  }`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Budget Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Budget
                </p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  ${Number(budget?.amount ?? 0).toFixed(0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Spent
                </p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                  ${expenses.toFixed(0)}
                </p>
              </div>
              <div
                className={`bg-gradient-to-br ${
                  percentUsed >= 90
                    ? "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20"
                    : percentUsed >= 75
                      ? "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20"
                      : "from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20"
                } rounded-lg p-4`}
              >
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Remaining
                </p>
                <p
                  className={`text-xl font-bold mt-1 ${
                    percentUsed >= 90
                      ? "text-red-600 dark:text-red-400"
                      : percentUsed >= 75
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-teal-600 dark:text-teal-400"
                  }`}
                >
                  $
                  {Math.max(0, Number(budget?.amount ?? 0) - expenses).toFixed(
                    0
                  )}
                </p>
              </div>
            </div>

            {/* Edit Budget */}
            <div className="mt-6 pt-4 border-t border-indigo-100 dark:border-indigo-900">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="flex-1"
                    placeholder={t("enterNewBudget")}
                    autoFocus
                    disabled={isLoading}
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdateBudget}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                  {t("editBudget") || "Edit Budget"}
                </Button>
              )}
            </div>
          </div>
        )}
        {isEditing && !budget && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="flex-1"
              placeholder={t("enterNewBudget")}
              autoFocus
              disabled={isLoading}
            />
            <Button
              size="sm"
              onClick={handleUpdateBudget}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetProgress;
