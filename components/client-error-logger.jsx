"use client";

import { useEffect } from "react";

export default function ClientErrorLogger() {
  useEffect(() => {
    const onError = (e) => {
      try {
        console.groupCollapsed("Client Error captured by ClientErrorLogger");
        console.log("event:", e);
        // some ErrorEvents have an Error object under `error`
        if (e.error) console.error("error object:", e.error, e.error?.stack);
        console.log("message:", e.message);
        console.log("filename:", e.filename, "lineno:", e.lineno, "col:", e.colno);
        console.groupEnd();
      } catch (err) {
        console.error("ClientErrorLogger:onError failed", err);
      }
    };

    const onUnhandledRejection = (e) => {
      try {
        console.groupCollapsed("Unhandled rejection captured by ClientErrorLogger");
        console.log("event:", e);
        console.log("reason:", e.reason);
        // If the reason is an object, try to show stack/property details
        if (e.reason && e.reason.stack) console.error(e.reason.stack);
        console.groupEnd();
      } catch (err) {
        console.error("ClientErrorLogger:onUnhandledRejection failed", err);
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
