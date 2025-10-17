"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import {
  CalendarClock,
  ClockAlert,
  Timer,
  BadgeAlert,
  ArrowLeftCircle,
} from "lucide-react";

export default function ExpiringSoonPage() {
  const router = useRouter();
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
          <CalendarClock className="text-brand-blue w-8 h-8" />
          <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-wide">
            Membresías Por Expirar
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-600/50 rounded-lg px-3 py-2 text-yellow-300 text-sm">
          <Timer className="w-4 h-4" />
          <span>Próximos 5 días</span>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center">Cargando...</p>
      ) : expiring.length === 0 ? (
        <p className="text-gray-400 text-center">
          No hay membresías próximas a vencer en los próximos 5 días.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="min-w-full text-sm md:text-base">
            <thead className="bg-gradient-to-r from-brand-blue/30 to-brand-red/30 text-gray-100 uppercase text-xs md:text-sm tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Correo</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-right">Total Pagado</th>
                <th className="px-4 py-3 text-right">Vence</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {expiring.map((m) => {
                const daysLeft = Math.ceil(
                  (new Date(m.end_date).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                let badgeColor =
                  daysLeft <= 2
                    ? "bg-red-600/20 text-red-300 border border-red-600"
                    : "bg-yellow-600/20 text-yellow-300 border border-yellow-600";

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
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs md:text-sm font-medium ${badgeColor}`}
                      >
                        <BadgeAlert className="w-4 h-4" />
                        {daysLeft <= 2 ? "Urgente" : `${daysLeft} días`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && expiring.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <ClockAlert className="text-yellow-400 w-4 h-4" />
          <span>
            Estos usuarios tienen membresías por expirar. Considera enviarles un recordatorio.
          </span>
        </div>
      )}
    </motion.div>
  );
}
