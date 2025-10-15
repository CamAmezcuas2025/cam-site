"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const navItems = [
  { name: "Inicio", href: "/" },
  { name: "Sobre Nosotros", href: "/about" },
  { name: "Eventos", href: "/events" },
  { name: "Clases", href: "/classes" },
  { name: "Membresías", href: "/memberships" },
  { name: "Patrocinio", href: "/sponsors" },
  { name: "Ubicación", href: "/location" },
  { name: "Contacto", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // placeholder for auth later

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
              <Link
                href="/profile"
                className="px-3 py-2 rounded-lg bg-brand-blue text-white font-medium hover:bg-brand-red transition-colors text-sm"
              >
                Mi Perfil
              </Link>
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
            <Link
              href="/profile"
              className="px-4 py-2 rounded-lg bg-brand-blue text-white font-medium hover:bg-brand-red transition-colors text-center"
              onClick={() => setIsOpen(false)}
            >
              Mi Perfil
            </Link>
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
