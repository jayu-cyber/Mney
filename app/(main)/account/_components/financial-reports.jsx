"use client";

import React, { useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from "date-fns";
import CurrencyAmount from "@/components/currency-amount";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function FinancialReports({ transactions }) {
  const [period, setPeriod] = React.useState("month");
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    if (period === "month") {
      return {
        start: startOfMonth(selectedMonth),
        end: endOfMonth(selectedMonth),
      };
    } else if (period === "year") {
      return {
        start: startOfYear(selectedMonth),
        end: endOfYear(selectedMonth),
      };
    } else {
      // All time
      return {
        start: new Date(0), // Beginning of time
        end: now,
      };
    }
  }, [period, selectedMonth]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= dateRange.start && txDate <= dateRange.end;
    });
  }, [transactions, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransfer = 0;
    const transactionCount = filteredTransactions.length;

    filteredTransactions.forEach((tx) => {
      const amount = typeof tx.amount === "number" ? tx.amount : parseFloat(tx.amount);
      if (tx.type === "INCOME") {
        totalIncome += amount;
      } else if (tx.type === "EXPENSE") {
        totalExpense += amount;
      } else if (tx.type === "TRANSFER") {
        totalTransfer += amount;
      }
    });

    const netAmount = totalIncome - totalExpense;
    const avgTransaction = transactionCount > 0 ? (totalIncome + totalExpense) / transactionCount : 0;

    return {
      totalIncome,
      totalExpense,
      totalTransfer,
      netAmount,
      transactionCount,
      avgTransaction,
    };
  }, [filteredTransactions]);

  // Monthly trends (last 6 months)
  const monthlyTrends = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthTransactions = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return txDate >= monthStart && txDate <= monthEnd;
      });

      let income = 0;
      let expense = 0;

      monthTransactions.forEach((tx) => {
        const amount = typeof tx.amount === "number" ? tx.amount : parseFloat(tx.amount);
        if (tx.type === "INCOME") income += amount;
        else if (tx.type === "EXPENSE") expense += amount;
      });

      months.push({
        month: format(monthDate, "MMM yyyy"),
        income,
        expense,
        net: income - expense,
      });
    }

    return months;
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
        {period === "month" && (
          <Select
            value={format(selectedMonth, "yyyy-MM")}
            onValueChange={(value) => {
              const [year, month] = value.split("-");
              setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1));
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = subMonths(new Date(), i);
                return (
                  <SelectItem key={i} value={format(date, "yyyy-MM")}>
                    {format(date, "MMMM yyyy")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <CurrencyAmount amount={stats.totalIncome} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.transactionCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              <CurrencyAmount amount={stats.totalExpense} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.transactionCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            {stats.netAmount >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.netAmount >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <CurrencyAmount amount={Math.abs(stats.netAmount)} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.netAmount >= 0 ? "Surplus" : "Deficit"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyAmount amount={stats.avgTransaction} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Last 6 Months Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthlyTrends.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{month.month}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-xs">
                      <span className="text-green-600">Income: </span>
                      <CurrencyAmount amount={month.income} />
                    </div>
                    <div className="text-xs">
                      <span className="text-red-600">Expense: </span>
                      <CurrencyAmount amount={month.expense} />
                    </div>
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ${
                    month.net >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {month.net >= 0 ? "+" : ""}
                  <CurrencyAmount amount={Math.abs(month.net)} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

