"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Scan, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ReceiptScanner({ onScanComplete }) {
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState(null);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Start scanning
    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/receipt/scan", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Receipt scanned successfully!");
        if (onScanComplete) {
          onScanComplete(data.data);
        }
      } else {
        toast.error(data.error || "Failed to scan receipt");
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to scan receipt. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    disabled: isScanning,
    multiple: false,
  });

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
        } ${isScanning ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {isScanning ? (
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
          ) : (
            <Scan className="h-12 w-12 text-gray-400" />
          )}
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {isScanning
                ? "Scanning receipt..."
                : isDragActive
                ? "Drop receipt image here"
                : "AI Receipt Scanner"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isScanning
                ? "Extracting transaction details..."
                : "Upload a receipt image to auto-fill transaction"}
            </p>
          </div>
        </div>
      </div>

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Receipt preview"
            className="w-full max-w-md mx-auto rounded-lg border border-gray-200 dark:border-gray-700"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearPreview}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

