"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login after 3s or home
    setTimeout(() => router.push("/login"), 3000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Acceso Denegado</h1>
        <p className="mb-4">No tienes permisos de administrador. Redirigiendo al login...</p>
        <button onClick={() => router.push("/login")} className="bg-brand-red text-white px-6 py-2 rounded-lg hover:bg-brand-blue">
          Ir al Login
        </button>
      </div>
    </div>
  );
}