"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientSupabaseClient();

  // Ref to dedupe access check
  const hasCheckedAccess = useRef(false);

  // ✅ Role verification with loading state
  useEffect(() => {
    async function checkAccess() {
      // Guard against double-run in Strict Mode
      if (hasCheckedAccess.current) return;
      hasCheckedAccess.current = true;

      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }
        const { data: rpcData } = await supabase.rpc("is_admin");
        const adminRole = Array.isArray(rpcData) ? rpcData[0]?.is_admin ?? false : rpcData ?? false;
        setIsAdmin(adminRole);
        console.log("Admin role check:", adminRole); // Debug log

        // No redirect—middleware handles non-admins
      } catch (err) {
        console.error("Access check failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkAccess();
  }, []);  // Run once on mount

  // If loading, show a full-screen loader to prevent flash
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <motion.div
          className="text-white text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
          <p>Verificando acceso...</p>
        </motion.div>
      </div>
    );
  }

  // If not admin, show denied (middleware should prevent this)
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <div className="text-white text-center">
          <p>Acceso denegado</p>
        </div>
      </div>
    );
  }

  // ✅ Handle logout
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const navItems = [
    { href: "/admin", label: "Panel Principal" },
    { href: "/admin/users", label: "Usuarios" },
    { href: "/admin/logs", label: "Registros" },
    { href: "/admin/reports", label: "Reportes" },
    { href: "/admin/classes", label: "Clases" },
    { href: "/admin/memberships", label: "Membresías" },
  ];

  return (
    <div className="relative min-h-screen flex bg-black text-white overflow-hidden font-body">
      {/* 🔥 Gradient background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0000] via-[#050026] to-[#00091f]" />
      </motion.div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-[#e60000] via-[#6b0030] to-[#0033cc] transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out md:static md:inset-auto shadow-2xl`}
      >
        <div className="flex items-center justify-center h-16 bg-black/80 border-b border-gray-700 text-2xl font-heading uppercase tracking-wider text-white shadow-glow">
          Admin C.A.M.
        </div>
        <nav className="mt-5 px-3 space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all
                  ${
                    active
                      ? "text-white shadow-glow bg-black/70 border border-white"
                      : "text-gray-300 hover:text-white hover:scale-[1.02]"
                  }`}
              >
                {active && (
                  <motion.span
                    layoutId="activeGlow"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#e60000]/30 via-transparent to-[#0033cc]/30 pointer-events-none"
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10">
        <header className="sticky top-0 bg-black/80 backdrop-blur-lg border-b border-gray-800 z-20 shadow-md">
          <div className="flex justify-between items-center px-4 sm:px-6 h-16">
            <div className="flex items-center">
              <button
                className="md:hidden text-white mr-4 text-2xl"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </button>
              <h1 className="text-lg font-heading text-white">
                <span className="text-brand-red">C.A.M.</span> Amezcuas{" "}
                <span className="text-brand-blue">Admin</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Buscar..."
                className="hidden sm:block px-3 py-2 bg-gray-900/90 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red text-sm"
              />
              <span className="text-gray-400 text-sm">Administrador</span>

              {/* ✅ Logout button */}
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-brand-red to-brand-blue px-4 py-2 rounded-md text-sm font-semibold hover:scale-105 transition-all shadow-glow"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 relative">
          {children}
        </main>
      </div>

      {/* Glow animation & styling */}
      <style jsx global>{`
        .shadow-glow {
          box-shadow: 0 0 15px rgba(230, 0, 0, 0.6),
                      0 0 25px rgba(0, 80, 255, 0.5);
        }
      `}</style>
    </div>
  );
}