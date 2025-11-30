import { getAccountWithTransactions } from "@/actions/accounts";
import CurrencyAmount from "@/components/currency-amount";
import { AccountTypeLabel } from "@/components/account-type-label";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import TransactionTable from "../_components/transactions-table";
import { BarLoader } from "react-spinners";
import AccountsChart from "../_components/account-chart";
import FinancialReports from "../_components/financial-reports";


const AccountsPage = async ({ params }) => {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);
  // ...

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;
  return (
    <div className="space-y-8 px-5 ">
        <div className="flex gap-4 items-end justify-between">

      <div>
        <h1 className="text-5xl sm:text-6xl font-bold  gradient-title capitalize">
          {account.name}
        </h1>
        <AccountTypeLabel type={account.type} />
      </div>
      <div className="text-right pb-2">
            <div className="text-xl sm:text-2xl font-bold">
              {/* Render currency using client-side context */}
              <CurrencyAmount amount={account.balance} />
            </div>
        <p className="text-sm text-muted-foreground">{account._count.transactions} Transactions</p>
        </div>
      </div>
      {/* chart secion */}

       <Suspense 
      fallback={<BarLoader className="mt-4" width={"100%"} color="#9333da"/>}
      >
        <AccountsChart transactions = {transactions}/>
      </Suspense>

      {/* Financial Reports */}
      <Suspense 
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333da"/>}
      >
        <FinancialReports transactions={transactions} />
      </Suspense>

      {/* transaction table */}
      <Suspense 
      fallback={<BarLoader className="mt-4" width={"100%"} color="#9333da"/>}
      >
        <TransactionTable transactions={transactions} accountName={account.name}/>  
      </Suspense>
    </div>
  );
};

export default AccountsPage;
