"use client";
import React from "react";
import { useApp } from "@/lib/app-context";
import { formatCurrency, getLocale, convertCurrency } from "@/lib/currency";

export default function CurrencyAmount({ amount }) {
  const { currency, language } = useApp();
  const locale = getLocale(language);

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  // Convert from INR (base currency stored in database) to selected currency
  const convertedAmount = convertCurrency(num, "INR", currency);
  return <span>{formatCurrency(convertedAmount, currency, locale)}</span>;
}
