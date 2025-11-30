import { useApp } from "@/lib/app-context";
import { getTranslation } from "@/lib/i18n/translations";

export function useTranslation() {
  const { language } = useApp();

  const t = (key) => {
    return getTranslation(key, language);
  };

  return { t, language };
}
