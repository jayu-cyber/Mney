"use client";
import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { useTranslation } from "@/lib/use-translation";

export default function HeaderControls() {
  const { t } = useTranslation();

  return (
    <>
      <Link
        href="/dashboard"
        className="text-gray-600 hover:text-teal-300 flex items-center gap-2"
      >
        <Button variant="outline">
          <LayoutDashboard size={20} />
          <span className="hidden md:inline">{t("dashboard")}</span>
        </Button>
      </Link>

      <Link href="/transaction/create">
        <Button className="flex items-center gap2">
          <PenBox size={20} />
          <span className="hidden md:inline">{t("addTransaction")}</span>
        </Button>
      </Link>
    </>
  );
}
