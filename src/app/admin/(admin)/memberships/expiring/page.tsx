"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { CalendarClock, ClockAlert } from "lucide-react";

export default function ExpiringSoonPage() {
  const supabase = createClientSupabaseClient();
  const [expiring, setExpiring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExpiring() {
      setLoading(true);

      const today = new Date();
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(today.getDate() + 5);

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
        .gte("end_date", today.toISOString())
        .lte("end_date", fiveDaysFromNow.toISOString())
        .eq("active", true);

      if (error) console.error("Error loading expiring memberships:", error);
      else setExpiring(data || []);
      setLoading(false);
    }

    fetchExpiring();
  }, [supabase]);

  return (
    <motion.div
      className="p-6 space-y-8 bg-black/40 backdrop-blur-md rounded-xl border border-gray-800 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <CalendarClock className="text-brand-blue w-8 h-8" />
        <h2 className="text-2xl font-bold tracking-wide">Por Expirar</h2>
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : expiring.length === 0 ? (
        <p className="text-gray-400">
          No hay membresías próximas a vencer en los próximos 5 días.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm md:text-base">
            <thead className="bg-gray-900/70 text-gray-300 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Correo</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-right">Total Pagado</th>
                <th className="px-4 py-3 text-right">Vence</th>
              </tr>
            </thead>
            <tbody>
              {expiring.map((m) => (
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

      {!loading && expiring.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <ClockAlert className="text-yellow-400 w-4 h-4" />
          <span>
            Estos usuarios tienen membresías por expirar. Considera enviarles
            un recordatorio de pago.
          </span>
        </div>
      )}
    </motion.div>
  );
}
