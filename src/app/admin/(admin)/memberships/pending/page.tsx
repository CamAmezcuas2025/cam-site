"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import {
  CreditCard,
  AlertTriangle,
  DollarSign,
  XCircle,
  ArrowLeftCircle,
} from "lucide-react";

export default function PendingPaymentsPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPending() {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_memberships")
        .select(`
          user_id,
          membership_id,
          total_paid,
          end_date,
          profiles(full_name, email),
          admin_memberships(type)
        `)
        .lt("end_date", new Date().toISOString())
        .eq("active", true);

      if (error) console.error("Error loading pending payments:", error);
      else setMembers(data || []);
      setLoading(false);
    }

    fetchPending();
  }, [supabase]);

  return (
    <motion.div
      className="p-6 space-y-8 bg-black/40 backdrop-blur-md rounded-xl border border-gray-800 text-white min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-red to-brand-blue text-white px-3 py-2 rounded-md text-sm font-semibold hover:scale-105 transition-transform"
          >
            <ArrowLeftCircle className="w-5 h-5" />
            Volver
          </button>
          <CreditCard className="text-brand-red w-8 h-8" />
          <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-wide">
            Pagos Pendientes
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-600/50 rounded-lg px-3 py-2 text-red-300 text-sm">
          <XCircle className="w-4 h-4" />
          <span>Pagos vencidos</span>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center">Cargando...</p>
      ) : members.length === 0 ? (
        <p className="text-gray-400 text-center">No hay membresías con pago pendiente.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="min-w-full text-sm md:text-base">
            <thead className="bg-gradient-to-r from-brand-red/30 to-brand-blue/30 text-gray-100 uppercase text-xs md:text-sm tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Correo</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-right">Total Pagado</th>
                <th className="px-4 py-3 text-right">Venció</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const expiredDays =
                  Math.ceil(
                    (new Date().getTime() - new Date(m.end_date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) || 0;

                return (
                  <tr
                    key={m.user_id}
                    className="border-b border-gray-800 hover:bg-white/10 transition"
                  >
                    <td className="px-4 py-3">{m.profiles?.full_name}</td>
                    <td className="px-4 py-3 text-gray-300">{m.profiles?.email}</td>
                    <td className="px-4 py-3">{m.admin_memberships?.type}</td>
                    <td className="px-4 py-3 text-right">${m.total_paid}</td>
                    <td className="px-4 py-3 text-right">
                      {new Date(m.end_date).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs md:text-sm font-medium bg-red-600/20 text-red-300 border border-red-600`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {expiredDays > 1
                          ? `${expiredDays} días vencido`
                          : "Venció hoy"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && members.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <DollarSign className="text-green-400 w-4 h-4" />
          <span>
            Los usuarios en esta lista tienen pagos vencidos y deben ser notificados.
          </span>
        </div>
      )}
    </motion.div>
  );
}
