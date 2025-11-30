"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import CurrencyAmount from "@/components/currency-amount";
import { Trash2, X } from "lucide-react";
import { deleteAccount } from "@/actions/accounts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { getCurrentBudget } from "@/actions/budget";

export function AccountsOverviewDialog({ accounts, open, onOpenChange }) {
  const router = useRouter();
  const [deletingAccountId, setDeletingAccountId] = useState(null);

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleteResult,
  } = useFetch(deleteAccount);

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalIncome = accounts.reduce((sum, acc) => sum + (acc.totalIncome || 0), 0);
  const totalExpense = accounts.reduce((sum, acc) => sum + (acc.totalExpense || 0), 0);
  const defaultAccount = accounts.find((acc) => acc.isDefault);

  const handleDelete = async (accountId, accountName) => {
    if (!accountId) {
      toast.error("Invalid account ID");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete "${accountName}"? This will also delete all transactions associated with this account. This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingAccountId(accountId);
    try {
      const result = await deleteFn(accountId);

      if (result?.success) {
        toast.success(`Account "${accountName}" deleted successfully`);
        router.refresh();
        // Close dialog if no accounts left
        if (accounts.length <= 1) {
          onOpenChange(false);
        }
      } else {
        toast.error(result?.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(error?.message || "Failed to delete account");
    } finally {
      setDeletingAccountId(null);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-bold">Accounts Overview</DrawerTitle>
          <DrawerDescription>
            Manage your accounts, view transactions, and budget information
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                Total Balance
              </p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                <CurrencyAmount amount={totalBalance} />
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                Total Income
              </p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                <CurrencyAmount amount={totalIncome} />
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                Total Expense
              </p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                <CurrencyAmount amount={totalExpense} />
              </p>
            </div>
          </div>

          {/* Budget Section */}
          {defaultAccount && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Budget Information
              </h3>
              <BudgetInfo accountId={defaultAccount.id} />
            </div>
          )}

          {/* Accounts List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              All Accounts ({accounts.length})
            </h3>
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {account.name}
                          {account.isDefault && (
                            <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-1">
                          {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          <CurrencyAmount amount={account.balance} />
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          <CurrencyAmount amount={account.totalIncome || 0} />
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Expense</p>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                          <CurrencyAmount amount={account.totalExpense || 0} />
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(account.id, account.name)}
                    disabled={deleteLoading || deletingAccountId === account.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ml-4"
                  >
                    {deletingAccountId === account.id ? (
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// Budget Info Component
function BudgetInfo({ accountId }) {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchBudget = async () => {
      try {
        const data = await getCurrentBudget(accountId);
        setBudgetData(data);
      } catch (error) {
        console.error("Failed to fetch budget:", error);
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchBudget();
    }
  }, [accountId]);

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading budget...</p>
      </div>
    );
  }

  if (!budgetData?.budget) {
    return (
      <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No budget set for the default account
        </p>
      </div>
    );
  }

  const budgetAmount = budgetData.budget.amount || 0;
  const currentExpenses = budgetData.currentExpenses || 0;
  const percentage = budgetAmount > 0 ? (currentExpenses / budgetAmount) * 100 : 0;
  const remaining = budgetAmount - currentExpenses;

  return (
    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Budget</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          <CurrencyAmount amount={budgetAmount} />
        </p>
      </div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">Spent</p>
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          <CurrencyAmount amount={currentExpenses} />
        </p>
      </div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
        <p className={`text-sm font-semibold ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          <CurrencyAmount amount={remaining} />
        </p>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage >= 100
              ? "bg-red-600"
              : percentage >= 80
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {percentage.toFixed(1)}% of budget used
      </p>
    </div>
  );
}

