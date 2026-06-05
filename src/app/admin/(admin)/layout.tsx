"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";

// ICONS
import { MdDashboardCustomize } from "react-icons/md";
import { GiBoxingRing, GiPhotoCamera, GiBugNet } from "react-icons/gi";
import { PiUserSquareBold } from "react-icons/pi";
import { IoTimerSharp } from "react-icons/io5";
import { GrSchedules } from "react-icons/gr";
import { FaChildren } from "react-icons/fa6";
import { IoIdCardSharp } from "react-icons/io5";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientSupabaseClient();
  const hasCheckedAccess = useRef(false);

  // ----------------------------------------------
  // CHECK ADMIN ACCESS
  // ----------------------------------------------
  useEffect(() => {
    async function checkAccess() {
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
        const adminRole = Array.isArray(rpcData)
          ? rpcData[0]?.is_admin ?? false
          : rpcData ?? false;

        setIsAdmin(adminRole);
      } catch (err) {
        console.error("Access check failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkAccess();
  }, []);

  // ----------------------------------------------
  // LOADING STATE
  // ----------------------------------------------
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

  // ----------------------------------------------
  // ACCESS DENIED
  // ----------------------------------------------
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <div className="text-white text-center">
          <p>Acceso denegado</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------
  // LOGOUT
  // ----------------------------------------------
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  // ----------------------------------------------
  // NAV ITEMS WITH ICONS
  // ----------------------------------------------
  const navItems = [
    { href: "/admin", label: "Panel Principal", Icon: MdDashboardCustomize },
    { href: "/admin/eventos", label: "Eventos", Icon: GiBoxingRing },
    { href: "/admin/gallery", label: "Galeria", Icon: GiPhotoCamera },
    { href: "/admin/logs", label: "Registros", Icon: IoTimerSharp },
    { href: "/admin/reports", label: "Reportes", Icon: GiBugNet },
    { href: "/admin/classes", label: "Clases", Icon: GrSchedules },
    { href: "/admin/memberships", label: "Membresías", Icon: IoIdCardSharp },
    { href: "/admin/team", label: "Equipo", Icon: PiUserSquareBold },

    {
      label: "📹 Videos",
      children: [
        { href: "/admin/videos/manage", label: "Administrar" },
        { href: "/admin/videos/upload", label: "Subir Nuevo" },
      ],
    },
  ];

  // ----------------------------------------------
  // ADMIN LAYOUT UI
  // ----------------------------------------------
  return (
    <div className="relative min-h-screen flex bg-black text-white overflow-hidden font-body">
      
      {/* BG Gradient */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0000] via-[#050026] to-[#00091f]" />
      </motion.div>

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-[#e60000] via-[#6b0030] to-[#0033cc] transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out shadow-2xl`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 bg-black/80 border-b border-gray-700 px-4">
          <span className="text-2xl font-heading uppercase tracking-wider text-white">
            Admin C.A.M.
          </span>
          <button
            className="text-white text-2xl md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="mt-5 px-3 space-y-2">

          {navItems.map((item) => {
            // ----------- PARENT WITH SUB-ITEMS -----------
            if (item.children) {
              return (
                <div key={item.label} className="space-y-1">
                  <div className="px-4 py-2 text-sm font-bold tracking-wide uppercase text-gray-300">
                    {item.label}
                  </div>

                  {item.children.map((child) => {
                    const active = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`relative flex items-center px-6 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all
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
                        <span className="relative z-10">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            }

            // ----------- SIMPLE TOP-LEVEL ITEM WITH ICON -----------
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
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

                <span className="relative z-10 flex items-center gap-3">
                  {item.Icon && <item.Icon className="w-5 h-5" />}
                  {item.label}
                </span>
              </Link>
            );
          })}

        </nav>
      </aside>

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative z-10">
        <header className="sticky top-0 bg-black/80 backdrop-blur-lg border-b border-gray-800 z-20 shadow-md">
          <div className="flex justify-between items-center px-4 sm:px-6 h-16">
            <div className="flex items-center">
              <button
                className="text-white mr-4 text-2xl"
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
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-brand-red to-brand-blue px-4 py-2 rounded-md text-sm font-semibold hover:scale-105 transition-all shadow-glow"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 relative">
          {children}
        </main>
      </div>

      {/* GLOW STYLE */}
      <style jsx global>{`
        .shadow-glow {
          box-shadow: 0 0 15px rgba(230, 0, 0, 0.6),
                      0 0 25px rgba(0, 80, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
