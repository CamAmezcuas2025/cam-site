"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { CreditCard, AlertTriangle } from "lucide-react";

export default function PendingPaymentsPage() {
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
      className="p-6 space-y-8 bg-black/40 backdrop-blur-md rounded-xl border border-gray-800 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="text-brand-red w-8 h-8" />
        <h2 className="text-2xl font-bold tracking-wide">Pagos Pendientes</h2>
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : members.length === 0 ? (
        <p className="text-gray-400">No hay membresías con pago pendiente.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm md:text-base">
            <thead className="bg-gray-900/70 text-gray-300 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Correo</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-right">Total Pagado</th>
                <th className="px-4 py-3 text-right">Venció</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.user_id}
                  className="border-b border-gray-800 hover:bg-gray-800/40 transition"
                >
                  <td className="px-4 py-3">{m.profiles?.full_name}</td>
                  <td className="px-4 py-3">{m.profiles?.email}</td>
                  <td className="px-4 py-3">{m.admin_memberships?.type}</td>
                  <td className="px-4 py-3 text-right">${m.total_paid}</td>
                  <td className="px-4 py-3 text-right">
                    {new Date(m.end_date).toLocaleDateString("es-MX")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && members.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <AlertTriangle className="text-yellow-400 w-4 h-4" />
          <span>
            Los usuarios en esta lista tienen pagos vencidos y deben ser
            notificados.
          </span>
        </div>
      )}
    </motion.div>
  );
}
