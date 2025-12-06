"use client";

import { useState } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { useRouter } from "next/navigation";
import { FiMail, FiSend } from "react-icons/fi";
import BackToLoginButton from "@/components/BackToLoginButton";

export default function ForgotPasswordPage() {
  const supabase = createClientSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo 📩");
    }

    setLoading(false);
  }

  return (
    <section className="pt-28 md:pt-36 pb-24 max-w-md mx-auto px-6 text-center">
      <h1 className="text-4xl font-heading text-brand-red mb-6">Recuperar Contraseña</h1>
      <p className="text-gray-300 mb-6">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
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

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-heading text-lg bg-brand-red text-white hover:bg-brand-blue transition-colors"
        >
          <FiSend />
          {loading ? "Enviando…" : "Enviar enlace"}
        </button>

        <BackToLoginButton />
      </form>
    </section>
  );
}
