"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";


interface RoleContextType {
  isAdmin: boolean | null;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const supabase = createClientSupabaseClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        const { data: rpcData } = await supabase.rpc("is_admin");
        const adminRole = Array.isArray(rpcData) ? rpcData[0]?.is_admin ?? false : rpcData ?? false;
        setIsAdmin(adminRole);
      } catch (err) {
        console.error("Role check failed:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }
    checkRole();
  }, [supabase]);

  return (
    <RoleContext.Provider value={{ isAdmin, loading }}>
      {children}
    </RoleContext.Provider>
  );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isProfileArea = pathname.startsWith("/profile") || pathname.startsWith("/waiver");

  if (isProfileArea) {
    return (
      <main className="min-h-screen bg-black text-white relative">
        <div className="pt-20">{children}</div>
      </main>
    );
  }

  if (isAdmin) {
    return (
      <RoleProvider>
        <main className="min-h-screen bg-gray-900 p-4">{children}</main>
      </RoleProvider>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20">{children}</main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}