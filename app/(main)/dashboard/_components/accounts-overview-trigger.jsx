"use client";

import React, { useState } from "react";
import { AccountsOverviewDialog } from "./accounts-overview-dialog";

export default function AccountsOverviewTrigger({ accounts }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-indigo-100 dark:border-indigo-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Accounts</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{accounts.length}</p>
          </div>
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
      <AccountsOverviewDialog accounts={accounts} open={open} onOpenChange={setOpen} />
    </>
  );
}

