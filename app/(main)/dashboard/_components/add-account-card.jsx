"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useTranslation } from "@/lib/use-translation";
import CreateAccountDrawer from "@/components/create-account-drawer";

export function AddAccountCard() {
  const { t } = useTranslation();

  return (
    <CreateAccountDrawer>
      <div className="h-full">
        <div className="bg-gradient-to-br from-white via-indigo-50 to-teal-50 dark:from-slate-900 dark:via-indigo-900/40 dark:to-teal-900/40 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center p-10 group">
          <div className="p-5 bg-gradient-to-br from-indigo-200 to-teal-200 dark:from-indigo-900/40 dark:to-teal-900/40 rounded-full mb-5 group-hover:scale-110 transition-transform shadow-md">
            <Plus className="h-10 w-10 text-indigo-700 dark:text-indigo-300" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">{t("createAccount")}</p>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-3 text-center group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">Add a new account to track your finances</p>
        </div>
      </div>
    </CreateAccountDrawer>
  );
}
