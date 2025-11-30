"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/use-translation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
// import { categoryColors } from "@/data/categories"; // removed
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { bulkDeleteTransacton } from "@/actions/accounts";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";
import {
  exportToCSV,
  downloadCSV,
  generateFilename,
} from "@/lib/export-transactions";
// import { currentUser } from "@clerk/nextjs/server";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS_KEYS = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

const TransactionTable = ({ transactions, accountName }) => {
  // const router = useRouter();
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransacton);

  const filtredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    //Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }

    //Apply recurring filter
    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    //apply type filter
    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    //Apply sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;

        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(
    filtredAndSortedTransactions.length / ITEMS_PER_PAGE
  );
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtredAndSortedTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filtredAndSortedTransactions, currentPage]);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field == field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item != id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === filtredAndSortedTransactions.length
        ? []
        : filtredAndSortedTransactions.map((t) => t.id)
    );
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `${t("confirmDeleteTransactions")} ${selectedIds.length} ${t("transactions")}?`
      )
    ) {
      return;
    }
    await deleteFn(selectedIds);
    // Force reload to update dashboard/account balances
    window.location.reload();
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.success(t("transactionDeletedSuccess"));
    }
  }, [deleted, deleteLoading, t]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    try {
      // Export filtered transactions (all pages, not just current page)
      const transactionsToExport = filtredAndSortedTransactions;

      if (transactionsToExport.length === 0) {
        toast.error("No transactions to export");
        return;
      }

      // Use provided account name or fallback
      const exportAccountName =
        accountName || transactionsToExport[0]?.account?.name || "Account";

      // Generate CSV
      const csvContent = exportToCSV(transactionsToExport, exportAccountName);

      // Generate filename (oldest date first, newest date last)
      const sortedByDate = [...transactionsToExport].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      const filename = generateFilename(
        exportAccountName,
        sortedByDate[0]?.date, // oldest
        sortedByDate[sortedByDate.length - 1]?.date, // newest
        "csv"
      );

      // Download
      downloadCSV(csvContent, filename);
      toast.success(
        `Exported ${transactionsToExport.length} transactions to CSV`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export transactions");
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedIds([]); // Clear selections on page change
  };
  // console.log(selectedIds)
  return (
    <div className="space-y-4 ">
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9334eb" />
      )}
      {/* filter */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchTransactions")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder={t("allTypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">{t("income")}</SelectItem>
              <SelectItem value="EXPENSE">{t("expense")}</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={recurringFilter}
            onValueChange={(value) => setRecurringFilter(value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("allTransactions")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">{t("recurringOnly")}</SelectItem>
              <SelectItem value="non-recurring">
                {t("nonRecurringOnly")}
              </SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                {t("deleteSelected")} ({selectedIds.length})
                <Trash className="h-4 w-4 mr-2" />
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            title="Export to CSV"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title={t("clearFilters")}
            >
              <X className="h-4 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* transactions */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  onCheckedChange={handleSelectAll}
                  checked={
                    selectedIds.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  }
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  {t("date")}
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>{t("description")}</TableHead>
              {/* Category column removed */}
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  {t("amount")}
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>{t("recurring")}</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  {t("noTransactionsFound")}
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(transaction.id)}
                      onCheckedChange={() => handleSelect(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.date), "PP ")}
                  </TableCell>
                  <TableCell>
                    {transaction.description || "No description"}
                    {transaction.type === "TRANSFER" &&
                      transaction.toAccount && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          → {transaction.toAccount.name}
                        </span>
                      )}
                  </TableCell>
                  {/* Category cell removed */}
                  <TableCell
                    className="text-right font-medium"
                    style={{
                      color:
                        transaction.type === "EXPENSE" ||
                        transaction.type === "TRANSFER"
                          ? "red"
                          : "green",
                    }}
                  >
                    {transaction.type === "EXPENSE" ||
                    transaction.type === "TRANSFER"
                      ? "-"
                      : "+"}
                    {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {transaction.isRecurring ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className="gap-1 bg-indigo-600 hover:bg-indigo-400"
                          >
                            <RefreshCw className="h-3 w-3" />
                            {t(
                              RECURRING_INTERVALS_KEYS[
                                transaction.recurringInterval
                              ]
                            )}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <div className="font-medium">{t("nextDate")}</div>
                            <div>
                              {format(
                                new Date(transaction.nextRecurrence),
                                "PP "
                              )}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {t("oneTime")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            router.push(`/transaction/${transaction.id}/edit`);
                          }}
                        >
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteFn([transaction.id])}
                        >
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {t("page")} {currentPage} {t("of")} {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
