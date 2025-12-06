// src/app/lib/errorLogger.ts
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";

export function initClientErrorLogging() {
  const supabase = createClientSupabaseClient();

  window.addEventListener("error", async (event) => {
    try {
      await supabase.from("logs").insert([
        {
          level: "error",
          source: "client",
          message: event.message,
          stacktrace: event.error?.stack || null,
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        },
      ]);
    } catch (err) {
      console.error("Failed to log client error:", err);
    }
  });

  window.addEventListener("unhandledrejection", async (event) => {
    try {
      const reason = event.reason;
      await supabase.from("logs").insert([
        {
          level: "error",
          source: "client-promise",
          message:
            typeof reason === "string"
              ? reason
              : reason?.message || "Promise rejection",
          stacktrace: reason?.stack || null,
          context: {},
        },
      ]);
    } catch (err) {
      console.error("Failed to log promise rejection:", err);
    }
  });
}
