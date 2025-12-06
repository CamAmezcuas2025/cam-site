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
    try {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
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
          <Bug className="text-red-500 w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
            Reportes de Errores
          </h1>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-black/60 border border-gray-700 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Regresar
        </button>
      </div>

      {/* Table / Loader */}
      {loading ? (
        <p className="text-center text-gray-400">Cargando logs...</p>
      ) : logs.length === 0 ? (
        <p className="text-center text-gray-400">
          No se encontraron errores recientes.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700 bg-black/60 backdrop-blur-md shadow-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Nivel</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Mensaje</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Fuente</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Usuario</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-300">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 flex items-center gap-2">
                    {getLevelIcon(log.level)}
                    <span className="capitalize font-medium">{log.level}</span>
                  </td>
                  <td className="px-4 py-3 max-w-md break-words text-gray-300">{log.message}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{log.source}</td>
                  <td className="px-4 py-3 flex items-center gap-2 text-gray-400">
                    <User className="w-4 h-4" />
                    {log.userid || "Anon"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 text-sm">
                    <CalendarClock className="inline w-4 h-4 mr-1" />
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