"use client";

import { motion } from "framer-motion";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { useEffect, useState } from "react";

interface Log {
  id: string;
  user_id: string;
  user_email?: string;
  action: string;
  description?: string;
  created_at: string;
}

export default function ReportsPage() {
  const supabase = createClientSupabaseClient();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("logs")
          .select("id, user_id, user_email, action, description, created_at")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          console.error("Error fetching logs:", error);
          setLogs([]);
        } else {
          setLogs(data || []);
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [supabase]);

  if (loading) {
    return (
      <section className="pt-28 pb-24 max-w-6xl mx-auto px-6">
        <div className="text-center text-white">Cargando registros...</div>
      </section>
    );
  }

  return (
    <motion.div
      className="relative z-10 p-6 md:p-8 bg-gradient-to-b from-black/40 via-black/20 to-transparent backdrop-blur-sm rounded-xl min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-red">
          Registros de Actividad
        </h1>
        <div className="text-gray-400 text-sm">
          Últimos 50 registros
        </div>
      </div>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <p className="text-gray-400 text-center">No se encontraron registros.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/60 backdrop-blur-md shadow-glow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-brand-red/30 to-brand-blue/30 text-white uppercase text-xs tracking-wider">
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Acción</th>
                <th className="px-4 py-3 text-left">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-t border-gray-800 hover:bg-white/10 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(log.created_at).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 font-semibold">{log.user_email || log.user_id}</td>
                  <td className="px-4 py-3 text-brand-red">{log.action}</td>
                  <td className="px-4 py-3 text-gray-300">{log.description || "—"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}