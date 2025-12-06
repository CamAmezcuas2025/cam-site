"use client";

import { Suspense, useState, useEffect } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

function SetPasswordInner() {
  const supabase = createClientSupabaseClient();
  const router = useRouter();
  const search = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  // ✅ NEW: handle both #access_token and ?access_token
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      const params = new URLSearchParams(window.location.hash.replace("#", "?"));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        // clean up the hash so it doesn’t clutter the URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [supabase]);

  // Check for active Supabase session
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setHasSession(!!data.session);
    })();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  // Form submission handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSession) {
      setMsg("No hay una sesión activa. Abre el enlace del correo de invitación otra vez.");
      return;
    }
    if (password.length < 8) {
      setMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setMsg("Las contraseñas no coinciden.");
      return;
    }

    setBusy(true);
    setMsg(null);

    const { error } = await supabase.auth.updateUser({ password });

    setBusy(false);
    if (error) {
      setMsg("Error al actualizar la contraseña: " + error.message);
      return;
    }

    setMsg("Contraseña creada. Redirigiendo al panel…");
    setTimeout(() => router.push("/dashboard"), 800);
  }

  const hasToken = search.get("token") || search.get("access_token");

  return (
    <div className="min-h-screen grid place-items-center bg-black text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Crear contraseña</h1>

        {hasSession === false && (
          <p className="text-sm bg-yellow-900/30 border border-yellow-700 rounded p-2">
            No hay sesión activa. Abre el enlace del correo de invitación para llegar aquí.
          </p>
        )}
        {!hasToken && hasSession === null && (
          <p className="text-xs text-gray-400">
            Si llegaste aquí manualmente, usa el enlace del correo de invitación.
          </p>
        )}

        <input
          type="password"
          placeholder="Nueva contraseña (mín. 8)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red"
          required
          minLength={8}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          required
          minLength={8}
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2 rounded-md bg-gradient-to-r from-brand-red to-brand-blue font-semibold hover:scale-105 transition"
        >
          {busy ? "Guardando..." : "Guardar contraseña"}
        </button>

        {msg && <p className="text-sm text-center mt-2">{msg}</p>}
      </form>
    </div>
  );
}

// ✅ Keep Suspense boundary
export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-white">Cargando...</div>}>
      <SetPasswordInner />
    </Suspense>
  );
}
