import React from "react";
import { getUserAccount } from "@/actions/dashboard";
import { getTransaction } from "@/actions/transaction";
import AddTransactionForm from "../../_components/transaction-form";
import { defaultCategories } from "@/data/categories";
import { TransactionPageTitle } from "../../create/page-title";
import { fixDecimals } from "@/lib/serialize-decimals";

const EditTransactionPage = async ({ params }) => {
  const { id } = await params;

  let accounts = await getUserAccount();
  accounts = fixDecimals(accounts);

  const transactionResponse = await getTransaction(id);
  const transactionData = fixDecimals(transactionResponse.data);

  return (
    <div className="max-w-3xl mx-auto px-5">
      <TransactionPageTitle titleKey="updateTransaction" />
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode
        transactionData={transactionData}
      />
    </div>
  );
};

export default EditTransactionPage;

