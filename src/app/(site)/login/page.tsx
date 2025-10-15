"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.redirected) {
        // Follow server redirect client-side (in case of SPA navigation)
        router.push(new URL(res.url, window.location.origin).pathname);
      } else if (res.ok) {
        // Fallback if no redirect (e.g., success without nav)
        router.push("/profile");
      } else {
        const data = await res.json();
        setError(data.error || "Credenciales inválidas");
      }
    } catch (err) {
      setError("Error en el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="pt-28 md:pt-36 pb-24 max-w-md mx-auto px-6 text-center">
      <h1 className="text-5xl font-heading text-brand-red mb-6">Iniciar Sesión</h1>
      <p className="text-gray-300 mb-6">Accede a tu perfil y entrena con nosotros 👊🔥</p>

      <form
        onSubmit={handleSubmit}
        className="bg-black/60 border border-gray-800 rounded-xl shadow-lg p-8 space-y-5"
      >
        {error && (
          <div className="text-red-400 bg-red-900/30 border border-red-700 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-black/30 px-4">
          <FiMail className="text-gray-400" />
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent py-3 outline-none"
            required
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-black/30 px-4">
          <FiLock className="text-gray-400" />
          <input
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent py-3 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-heading text-lg bg-brand-red text-white hover:bg-brand-blue transition-colors"
        >
          <FiLogIn />
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </section>
  );
}