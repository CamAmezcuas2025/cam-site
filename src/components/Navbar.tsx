"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";

const navItems = [
  { name: "Inicio", href: "/" },
  { name: "Sobre Nosotros", href: "/about" },
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClientSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    setIsDropdownOpen(false);
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

        {/* DESKTOP MENU (shows only from lg and up) */}
        <div className="hidden lg:flex gap-6 xl:gap-8 items-center">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-white hover:text-brand-blue transition-colors font-medium text-sm xl:text-base"
            >
              {item.name}
            </Link>
          ))}

          {/* AUTH BUTTONS */}
          <div className="flex gap-3 ml-4">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-3 py-2 rounded-lg bg-brand-blue text-white font-medium hover:bg-brand-red transition-colors text-sm flex items-center gap-1"
                >
                  Mi Perfil
                  <span className="text-xs">▾</span>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-black/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      <Link
                        href="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-3 text-white hover:bg-brand-blue/20 transition-colors text-sm border-b border-gray-800"
                      >
                        📋 Ver Perfil
                      </Link>
                      <Link
                        href="/profile/edit"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-3 text-white hover:bg-brand-blue/20 transition-colors text-sm border-b border-gray-800"
                      >
                        ✏️ Editar
                      </Link>
                      <Link
                        href="/waiver"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-3 text-white hover:bg-brand-blue/20 transition-colors text-sm border-b border-gray-800"
                      >
                        ✍️ Firmar Carta
                      </Link>
                      <Link
                        href="/videos"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-3 text-white hover:bg-brand-blue/20 transition-colors text-sm border-b border-gray-800"
                      >
                        📺 Mis Videos
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-900/20 transition-colors text-sm"
                      >
                        🚪 Salir
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-lg bg-brand-blue text-white font-medium hover:bg-brand-red transition-colors text-sm"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 rounded-lg bg-brand-red text-white font-medium hover:bg-brand-blue transition-colors text-sm"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>

        {/* MOBILE / TABLET MENU BUTTON (below lg) */}
        <button
          className="lg:hidden text-white text-2xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE / TABLET MENU PANEL */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden flex flex-col bg-black/95 px-6 py-5 space-y-4 border-t border-brand-red"
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
          {isLoggedIn ? (
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
    </nav>
  );
}
