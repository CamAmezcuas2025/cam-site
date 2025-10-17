"use client";

import { useEffect, useState } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion } from "framer-motion";
import {
  Bug,
  AlertTriangle,
  Info,
  Server,
  User,
  CalendarClock,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Log {
  id: string;
  timestamp: string;
  level: string;
  source: string;
  message: string;
  stacktrace?: string | null;
  context?: any;
  userid?: string | null;
}

export default function ReportsPage() {
  const supabase = createClientSupabaseClient();
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching logs:", error);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  }

  function getLevelIcon(level: string) {
    switch (level) {
      case "error":
        return <Bug className="text-red-500 w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="text-yellow-400 w-5 h-5" />;
      case "info":
        return <Info className="text-blue-400 w-5 h-5" />;
      default:
        return <Server className="text-gray-400 w-5 h-5" />;
    }
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
        <div className="flex items-center gap-3">
          <Bug className="text-brand-red w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-blue">
            Error Reports
          </h1>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-gray-800/70 border border-gray-700 px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Regresar
        </button>
      </div>

      {/* Table / Loader */}
      {loading ? (
        <p className="text-gray-400 text-center">Cargando logs...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-400 text-center">
          No se encontraron errores recientes.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/60 backdrop-blur-md shadow-glow">
          <table className="min-w-full text-sm md:text-base">
            <thead className="bg-gradient-to-r from-brand-red/30 to-brand-blue/30 text-gray-100 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Nivel</th>
                <th className="px-4 py-3 text-left">Mensaje</th>
                <th className="px-4 py-3 text-left">Fuente</th>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-t border-gray-800 hover:bg-white/10 transition-colors"
                >
                  <td className="px-4 py-3 flex items-center gap-2">
                    {getLevelIcon(log.level)}
                    <span className="capitalize">{log.level}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">{log.message}</td>
                  <td className="px-4 py-3 text-gray-400">{log.source}</td>
                  <td className="px-4 py-3 flex items-center gap-2 text-gray-400">
                    <User className="w-4 h-4 text-brand-blue" />
                    {log.userid ? log.userid.slice(0, 8) : "Anon"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    <CalendarClock className="inline w-4 h-4 mr-1 text-gray-500" />
                    {new Date(log.timestamp).toLocaleString("es-MX")}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
