"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { FiLock, FiCheck } from "react-icons/fi";
import BackToLoginButton from "@/components/BackToLoginButton";

export default function ResetPasswordPage() {
  const supabase = createClientSupabaseClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("✅ Tu contraseña ha sido actualizada correctamente.");
      setTimeout(() => router.push("/login"), 2500);
    }

    setLoading(false);
  }

  return (
    <section className="pt-28 md:pt-36 pb-24 max-w-md mx-auto px-6 text-center">
      <h1 className="text-4xl font-heading text-brand-red mb-6">
        Restablecer Contraseña
      </h1>
      <p className="text-gray-300 mb-6">
        Crea una nueva contraseña segura para tu cuenta.
      </p>

      <form
        onSubmit={handleReset}
        className="bg-black/60 border border-gray-800 rounded-xl shadow-lg p-8 space-y-5"
      >
        {error && (
          <div className="text-red-400 bg-red-900/30 border border-red-700 p-2 rounded">
            {error}
          </div>
        )}
        {message && (
          <div className="text-green-400 bg-green-900/30 border border-green-700 p-2 rounded">
            {message}
          </div>
        )}

        <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-black/30 px-4">
          <FiLock className="text-gray-400" />
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent py-3 outline-none"
            required
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-black/30 px-4">
          <FiLock className="text-gray-400" />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full bg-transparent py-3 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-heading text-lg bg-brand-red text-white hover:bg-brand-blue transition-colors"
        >
          <FiCheck />
          {loading ? "Guardando…" : "Guardar nueva contraseña"}
        </button>

        <BackToLoginButton />
      </form>
    </section>
  );
}
