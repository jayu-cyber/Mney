import React, { Suspense } from "react";
import DashboardPage from "./page";
import { BarLoader } from "react-spinners";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="px-5 md:px-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-2">
            <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage all your financial accounts and budgets in one place
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-96">
              <BarLoader className="mt-4" width={"100%"} color="#4f46e5" />
            </div>
          }
        >
          <DashboardPage />
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;
