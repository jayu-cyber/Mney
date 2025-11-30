"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { importBankStatement } from "@/actions/import-statement";
import { toast } from "sonner";
import { useTranslation } from "@/lib/use-translation";

export function BankStatementUpload({ accountId, accountName }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    setResult(null);

    // Handle CSV
    if (file.name.endsWith(".csv")) {
      try {
        const text = await file.text();
        const response = await importBankStatement(text, accountId);
        setResult(response);
        if (response.success) {
          toast.success(response.message);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to process file");
        setResult({
          success: false,
          message: "Failed to process file",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Handle PDF
    if (file.name.endsWith(".pdf")) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('accountId', accountId);
        const res = await fetch('/api/import/pdf', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const message = data.errors && data.errors.length > 0
            ? `Imported ${data.count} of ${data.total} transactions from PDF. Some transactions failed.`
            : `Imported ${data.count} transactions from PDF.`;
          setResult({ success: true, message });
          toast.success(message);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setResult({ success: false, message: data.error || 'Failed to import PDF.' });
          toast.error(data.error || 'Failed to import PDF.');
        }
      } catch (error) {
        console.error("PDF upload error:", error);
        toast.error("Failed to process PDF file");
        setResult({
          success: false,
          message: "Failed to process PDF file",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    toast.error("Please upload a CSV or PDF file");
    setIsLoading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/pdf": [".pdf"],
    },
    disabled: isLoading,
    multiple: false,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          {isLoading ? (
            <Loader className="h-12 w-12 text-indigo-600 animate-spin" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}

          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {isDragActive
                ? "Drop your CSV or PDF file here"
                : "Drag & drop your bank statement CSV or PDF"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              or click to select a file
            </p>
          </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Importing to: <span className="font-semibold text-gray-700 dark:text-gray-200">{accountName}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Accepted file types: <span className="font-semibold">CSV, PDF</span>
            </p>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <strong>CSV Format:</strong> Date, Description, Amount, Type (optional)
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              <strong>PDF:</strong> Bank statement PDF (auto-extracts transactions)
            </p>
          </div>
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div
          className={`mt-6 p-4 rounded-lg border ${
            result.success
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  result.success
                    ? "text-green-900 dark:text-green-200"
                    : "text-red-900 dark:text-red-200"
                }`}
              >
                {result.message}
              </p>

              {result.imported && (
                <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                  ✓ {result.imported} transactions imported
                  {result.skipped > 0 && ` • ${result.skipped} rows skipped`}
                </p>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="mt-2 text-sm">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Errors:</p>
                  <ul className="list-disc list-inside mt-1 text-gray-600 dark:text-gray-400">
                    {result.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSV Format Example */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Expected CSV Format:
        </p>
        <div className="overflow-x-auto">
          <pre className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-900 p-3 rounded border border-gray-200 dark:border-gray-700">
{`Date,Description,Amount,Type
2024-11-15,Salary Deposit,50000,INCOME
2024-11-14,Grocery Store,-2500,EXPENSE
2024-11-13,Online Transfer,10000,INCOME`}
          </pre>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Amount can be positive or negative. Type is optional (INCOME/EXPENSE).
        </p>
      </div>
    </div>
  );
}
