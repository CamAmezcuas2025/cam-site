"use client";

import { useEffect } from "react";

export default function AuthRedirect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.includes("access_token=")) {
        // Redirect to /set-password, preserving the full token hash
        window.location.replace(`/set-password${hash}`);
      }
    }
  }, []);

  return null;
}
