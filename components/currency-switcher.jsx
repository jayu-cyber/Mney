"use client";
import React from "react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DollarSign } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";

export function CurrencySwitcher() {
  const { currency, updateCurrency } = useApp();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700"
        >
          <DollarSign className="h-4 w-4" />
          <span className="sr-only">Switch currency</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(CURRENCIES).map(([code, info]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => updateCurrency(code)}
            className={currency === code ? "bg-accent" : ""}
          >
            <span>{info.symbol} {code}</span>
            {currency === code && <span className="ml-2">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
