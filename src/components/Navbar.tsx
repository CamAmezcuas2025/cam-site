"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";

const navItems = [
  { name: "Inicio", href: "/" },
  { name: "Sobre Nosotros", href: "/about" },
  { name: "Nuestro Equipo", href: "/team" },
  { name: "Galeria", href: "/gallery" },
  { name: "Eventos", href: "/events" },
  { name: "Clases", href: "/classes" },
  { name: "Membresías", href: "/memberships" },
  { name: "Patrocinio", href: "/sponsors" },
  { name: "Ubicación", href: "/location" },
  { name: "Contacto", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const supabase = createClientSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setAuthLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, !!session);
      setIsLoggedIn(!!session);
      setAuthLoading(false);

      // Refresh router to update server components
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full top-0 left-0 bg-black/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4">
        {/* LOGO + TEXT */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/images/logo.png"
            alt="C.A.M Amezcuas Logo"
            width={38}
            height={38}
            className="rounded-full sm:w-10 sm:h-10"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-white font-heading text-xl sm:text-2xl font-bold">
              <span className="text-brand-red">C.A.M</span> AMEZCUAS
            </span>
            <span className="ml-10 sm:ml-16 -mt-1 text-brand-red text-xs sm:text-sm font-normal underline">
              SANTA FE TIJUANA
            </span>
          </div>
        </Link>

        {/* HAMBURGER MENU BUTTON (all screen sizes) */}
        <button
          className="flex items-center gap-2 text-white focus:outline-none px-3 py-2 hover:bg-white/10 rounded-lg transition-colors group"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span className="font-heading text-lg hidden sm:block group-hover:text-brand-red transition-colors">
            {isOpen ? "CERRAR" : "MENÚ"}
          </span>
          <svg
            className="w-7 h-7"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* MENU PANEL (all screen sizes) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col bg-black/95 backdrop-blur-lg px-6 py-5 space-y-3 border-t border-brand-red overflow-hidden"
          >
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-white hover:text-brand-red transition-colors font-medium text-lg"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {/* MOBILE AUTH BUTTONS */}
          {authLoading ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-700">
              <div className="h-10 rounded-lg bg-gray-800/50 animate-pulse"></div>
              <div className="h-10 rounded-lg bg-gray-800/50 animate-pulse"></div>
            </div>
          ) : isLoggedIn ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-700">
              <Link
                href="/profile"
                className="px-4 py-2 rounded-lg bg-brand-blue/20 text-white hover:bg-brand-blue transition-colors text-center"
                onClick={() => setIsOpen(false)}
              >
                📋 Ver Perfil
              </Link>
              <Link
                href="/profile/edit"
                className="px-4 py-2 rounded-lg bg-brand-blue/20 text-white hover:bg-brand-blue transition-colors text-center"
                onClick={() => setIsOpen(false)}
              >
                ✏️ Editar
              </Link>
              <Link
                href="/waiver"
                className="px-4 py-2 rounded-lg bg-brand-blue/20 text-white hover:bg-brand-blue transition-colors text-center"
                onClick={() => setIsOpen(false)}
              >
                ✍️ Firmar Carta
              </Link>
              <Link
                href="/videos"
                className="px-4 py-2 rounded-lg bg-brand-blue/20 text-white hover:bg-brand-blue transition-colors text-center"
                onClick={() => setIsOpen(false)}
              >
                📺 Mis Videos
              </Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors text-center"
              >
                🚪 Salir
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-brand-blue text-white font-medium hover:bg-brand-red transition-colors text-center"
                onClick={() => setIsOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-brand-red text-white font-medium hover:bg-brand-blue transition-colors text-center"
                onClick={() => setIsOpen(false)}
              >
                Registrarse
              </Link>
            </>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </nav>
  );
}
