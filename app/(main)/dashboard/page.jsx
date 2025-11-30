import { getDashboardData, getUserAccount } from "@/actions/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Upload } from "lucide-react";
import React, { Suspense } from "react";
import AccountCard from "./_components/account-card";
import { AddAccountCard } from "./_components/add-account-card";
import { getCurrentBudget } from "@/actions/budget";
import BudgetProgress from "./_components/budget-progress";
import Link from "next/link";
import AccountsOverviewTrigger from "./_components/accounts-overview-trigger";
import CurrencyAmount from "@/components/currency-amount";

async function DashboardPage() {
  const accounts = await getUserAccount();
  const defaultAccunt = accounts?.find((account)=> account.isDefault);

  let budgetData = null;
  if(defaultAccunt){
    budgetData = await getCurrentBudget(defaultAccunt.id);
  }

  return (
    <div className="space-y-8">
      {/* Header with Import Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Link
          href="/import"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto"
        >
          <Upload className="h-4 w-4" />
          Import Statement
        </Link>
      </div>

      {/* Budget Progress Section */}
      {defaultAccunt && (
        <div className="">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Default Account Budget</h2>
          <BudgetProgress
            initialBudget={budgetData?.budget}
            currentExpenses={budgetData?.currentExpenses || 0}
          />
        </div>
      )}

     
      
      {/* Quick Stats Section */}
      {accounts.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AccountsOverviewTrigger accounts={accounts} />

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-indigo-100 dark:border-indigo-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Balance</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  <CurrencyAmount amount={accounts.reduce((total, acc) => total + (acc.balance || 0), 0)} />
                </p>
              </div>
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-indigo-100 dark:border-indigo-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Default Account</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-2 capitalize">{defaultAccunt?.name || 'N/A'}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Accounts Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Accounts</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AddAccountCard />

          {accounts.length > 0 && accounts?.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
