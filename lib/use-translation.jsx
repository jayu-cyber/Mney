"use client";
import { useApp } from "@/lib/app-context";
import { getTranslation } from "@/lib/i18n/translations";
import { useCallback } from "react";

export function useTranslation() {
  const { language } = useApp();

  // Use useCallback to ensure t function is stable but depends on language
  const t = useCallback(
    (key) => {
      return getTranslation(key, language);
    },
    [language] // Re-create function when language changes
  );

  return { t };
}
