


"use client";

import React, { useEffect, useState } from "react";
import CurrencyAmount from "@/components/currency-amount";
import { useTranslation } from "@/lib/use-translation";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import useFetch from "@/hooks/use-fetch";
import { updateDefaultAccount } from "@/actions/accounts";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AccountCard = ({ account }) => {
  const { t } = useTranslation();
  const { name, type, balance, id, isDefault, totalIncome = 0, totalExpense = 0 } = account;

  // Local optimistic state
  const [localDefault, setLocalDefault] = useState(isDefault);
  const [localUpdating, setLocalUpdating] = useState(false);

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  // Sync local state when prop changes (e.g., after revalidation)
  useEffect(() => {
    setLocalDefault(isDefault);
  }, [isDefault]);

  const handleDeafultChange = async (event) => {
    event.preventDefault();

    // If already default, prevent turning off here
    if (localDefault) {
      toast.warning(t("needDefaultAccount"));
      return;
    }

    // Optimistic UI: mark as default immediately and show loading state
    setLocalDefault(true);
    setLocalUpdating(true);

    // Fire server action (useFetch will update `updatedAccount` / `error`)
    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success(t("defaultAccountUpdated"));
      // server confirmed - clear updating state
      setLocalUpdating(false);
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || t("failedUpdateAccount"));
      // revert optimistic change on error
      setLocalDefault(isDefault);
      setLocalUpdating(false);
    }
  }, [error, isDefault]);

  return (
    <Link href={`/account/${id}`}>
      <div className="group cursor-pointer h-full">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 h-full flex flex-col overflow-hidden">
          {/* Header Section with Gradient Background */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white capitalize tracking-tight">
                {name}
              </h3>
              <div className="flex items-center gap-2.5">
                <Switch
                  checked={localDefault}
                  onClick={handleDeafultChange}
                  disabled={updateDefaultLoading || localUpdating}
                  className="transition-transform"
                />
                {localUpdating && (
                  <svg className="animate-spin h-4 w-4 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
              </div>
            </div>

            {/* Balance Amount - Large and Bold */}
            <div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-mono tracking-tight">
                <CurrencyAmount amount={balance} />
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {type.charAt(0) + type.slice(1).toLowerCase()} Account
              </p>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Footer with Income/Expense - Improved Layout */}
          <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-800/30 border-t border-gray-100 dark:border-gray-800 flex flex-row gap-4 items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                  <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="ml-2 text-xs font-semibold text-green-700 dark:text-green-400">{t("income")}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-green-600 dark:bg-green-700 text-white border-0">
                <div className="text-base font-bold">
                  <CurrencyAmount amount={totalIncome} />
                </div>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="ml-2 text-xs font-semibold text-red-700 dark:text-red-400">{t("expense")}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-red-600 dark:bg-red-700 text-white border-0">
                <div className="text-base font-bold">
                  <CurrencyAmount amount={totalExpense} />
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AccountCard;
