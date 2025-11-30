"use client";

import React, { useEffect, useState } from "react";
import { BankStatementUpload } from "@/components/bank-statement-upload";
import Link from "next/link";
import { ArrowLeft, Loader } from "lucide-react";
import { getUserAccount } from "@/actions/dashboard";

export default function ImportPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getUserAccount();
        setAccounts(data || []);
        if (data && data.length > 0) {
          // Set default account as selected
          const defaultAccount = data.find((acc) => acc.isDefault);
          setSelectedAccountId(defaultAccount?.id || data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <p className="text-yellow-900 dark:text-yellow-200">
            Please create an account first before importing bank statements.
          </p>
        </div>
      </div>
    );
  }

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Import Bank Statement
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Upload your bank statement CSV file to automatically create transactions
        </p>
      </div>

      {/* Account Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Account
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedAccountId(account.id)}
              className={`text-left p-4 border-2 rounded-lg transition-all ${
                selectedAccountId === account.id
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {account.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Balance: ₹{account.balance.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border-2 transition-all ${
                    selectedAccountId === account.id
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-gray-300"
                  }`}
                ></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Component */}
      {selectedAccount && (
        <BankStatementUpload
          accountId={selectedAccount.id}
          accountName={selectedAccount.name}
        />
      )}
    </div>
  );
}
