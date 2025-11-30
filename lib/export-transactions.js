// Utility functions for exporting transactions

/**
 * Convert transactions to CSV format
 */
export function exportToCSV(transactions, accountName = "Account") {
  // CSV Headers
  const headers = [
    "Date",
    "Type",
    "Description",
    "Amount",
    "To Account",
    "Recurring",
    "Status",
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map((tx) => {
    const date = new Date(tx.date).toLocaleDateString();
    const type = tx.type;
    const description = tx.description || "";
    const amount = tx.amount.toFixed(2);
    const toAccount = tx.toAccount?.name || "";
    const recurring = tx.isRecurring
      ? `${tx.recurringInterval || "N/A"}`
      : "No";
    const status = tx.status || "COMPLETED";

    // Escape commas and quotes in CSV
    const escapeCSV = (str) => {
      if (!str) return "";
      const string = String(str);
      if (string.includes(",") || string.includes('"') || string.includes("\n")) {
        return `"${string.replace(/"/g, '""')}"`;
      }
      return string;
    };

    return [
      escapeCSV(date),
      escapeCSV(type),
      escapeCSV(description),
      escapeCSV(amount),
      escapeCSV(toAccount),
      escapeCSV(recurring),
      escapeCSV(status),
    ].join(",");
  });

  // Combine headers and rows
  const csvContent = [headers.join(","), ...rows].join("\n");

  // Add BOM for Excel compatibility
  const BOM = "\uFEFF";
  return BOM + csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with date range
 */
export function generateFilename(accountName, startDate, endDate, format = "csv") {
  const formatDate = (date) => {
    if (!date) return "all";
    return new Date(date).toISOString().split("T")[0];
  };

  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const dateRange = start === end ? start : `${start}_to_${end}`;

  return `transactions_${accountName}_${dateRange}.${format}`.replace(/[^a-z0-9._-]/gi, "_");
}

