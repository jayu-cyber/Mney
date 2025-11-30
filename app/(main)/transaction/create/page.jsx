import { getUserAccount } from "@/actions/dashboard";
import React from "react";
import AddTransactionForm from "../_components/transaction-form";
import { defaultCategories } from "@/data/categories";
import { TransactionPageTitle } from "./page-title";
import { fixDecimals } from "@/lib/serialize-decimals";

const AddTransactionPage = async ({ searchParams }) => {
  // ❌ searchParams is NOT async
  // Fetch accounts & convert all Decimal fields safely
  let accounts = await getUserAccount();
  accounts = fixDecimals(accounts);

  return (
    <div className="max-w-3xl mx-auto px-5">
      <TransactionPageTitle />
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={false}
        transactionData={null}
      />
    </div>
  );
};

export default AddTransactionPage;
