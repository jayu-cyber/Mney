"use client";
import React from "react";
import { useTranslation } from "@/lib/use-translation";

export function TransactionPageTitle({ titleKey = "addTransaction" }) {
  const { t } = useTranslation();
  return <h1 className="px-8 text-5xl gradient-title mb-8">{t(titleKey)}</h1>;
}
