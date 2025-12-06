"use client";

import { useRouter } from "next/navigation";

export default function BackToLoginButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/login")}
      className="text-sm text-gray-400 hover:text-brand-blue transition-colors underline underline-offset-2"
    >
      Volver a iniciar sesión
    </button>
  );
}
