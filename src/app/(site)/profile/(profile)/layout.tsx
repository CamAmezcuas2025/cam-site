"use client";

import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { useState } from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClientSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Kept the logic in case you ever want custom logout behavior later
  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* ✅ Removed duplicate logout button — handled by ClientLayout */}
      <main className="pt-20">{children}</main>
    </div>
  );
}