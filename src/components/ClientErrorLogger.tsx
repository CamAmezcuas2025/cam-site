"use client";

import { useEffect } from "react";
import { initClientErrorLogging } from "@/app/lib/errorLogger";

// Lightweight client component that runs once on load
export default function ClientErrorLogger() {
  useEffect(() => {
    initClientErrorLogging();
  }, []);

  return null; // nothing rendered to DOM
}
