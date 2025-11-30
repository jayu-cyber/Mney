"use client";
import React from "react";
import { useTranslation } from "@/lib/use-translation";

export function AccountTypeLabel({ type }) {
  const { t } = useTranslation();
  
  const typeKey = type.charAt(0) + type.slice(1).toLowerCase(); // Convert "CURRENT" to "current"
  const translatedType = typeKey === "current" ? t("current") : typeKey === "savings" ? t("savings") : typeKey;
  
  return <p className="text-muted-foreground">{translatedType} {t("accountType")}</p>;
}
