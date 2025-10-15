"use client";

import { useEffect, useState, useRef } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Search,
  User,
  Mail,
  PlusCircle,
  Edit3,
  Trash2,
} from "lucide-react";

interface LogEntry {
  id: string;
  class_name: string;
  instructor: string;
  date: string;
  duration: number;
  user_id: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  }[];
}

interface GymClass {
  id: string;
  name: string;
  instructor: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

export default function LogsPage() {
  const supabase = createClientSupabaseClient();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filtered, setFiltered] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    user_id: "",
    class_name: "",
    instructor: "",
    date: "",
    duration: "",
  });
  const [saving, setSaving] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    async function fetchAll() {
      if (hasFetched.current) return;
      hasFetched.current = true;
      fetchLogs();
      fetchProfiles();
      fetchClasses();
    }
    fetchAll();
  }, []);

  async function fetchLogs() {
    const { data, error } = await supabase
      .from("admin_logs")
      .select(`
        id,
        class_name,
        instructor,
        date,
        duration,
        user_id,
        profiles ( full_name, email )
      `)
      .order("date", { ascending: false });
    if (!error && data) {
      const flattened = data.map((item: any) => ({
        ...item,
        profiles: item.profiles || [],
      }));
      setLogs(flattened);
      setFiltered(flattened);
    }
    setLoading(false);
  }

  async function fetchProfiles() {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "user")
      .order("full_name");
    if (data) setProfiles(data);
  }

  async function fetchClasses() {
    const { data } = await supabase
      .from("admin_classes")
      .select("id, name, instructor")
      .order("name");
    if (data) setClasses(data);
  }

  useEffect(() => {
    if (!search) return setFiltered(logs);
    const term = search.toLowerCase();
    setFiltered(
      logs.filter(
        (l) =>
          l.class_name.toLowerCase().includes(term) ||
          l.instructor.toLowerCase().includes(term) ||
          l.profiles?.[0]?.full_name?.toLowerCase().includes(term) ||
          l.profiles?.[0]?.email?.toLowerCase().includes(term)
      )
    );
  }, [search, logs]);

  async function handleAddOrEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.user_id || !form.class_name || !form.instructor || !form.date || !form.duration)
      return;
    setSaving(true);
    try {
      if (isEditing && selectedId) {
        await supabase
          .from("admin_logs")
          .update({
            user_id: form.user_id,
            class_name: form.class_name,
            instructor: form.instructor,
            date: form.date,
            duration: Number(form.duration),
          })
          .eq("id", selectedId);
      } else {
        await supabase.from("admin_logs").insert([
          {
            user_id: form.user_id,
            class_name: form.class_name,
            instructor: form.instructor,
            date: form.date,
            duration: Number(form.duration),
          },
        ]);
      }
      await fetchLogs();
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(log: LogEntry) {
    setIsEditing(true);
    setSelectedId(log.id);
    setForm({
      user_id: log.user_id,
      class_name: log.class_name,
      instructor: log.instructor,
      date: new Date(log.date).toISOString().slice(0, 16),
      duration: log.duration.toString(),
    });
    setShowModal(true);
  }

  async function handleDelete(logId: string) {
    if (!confirm("¿Eliminar este registro de asistencia?")) return;
    await supabase.from("admin_logs").delete().eq("id", logId);
    setLogs((prev) => prev.filter((l) => l.id !== logId));
    setFiltered((prev) => prev.filter((l) => l.id !== logId));
  }

  function closeModal() {
    setShowModal(false);
    setIsEditing(false);
    setSelectedId(null);
    setForm({ user_id: "", class_name: "", instructor: "", date: "", duration: "" });
  }

 // ✅ Fix for Framer Motion typing issue (v11+ + TS strict)
const MotionForm = motion("form") as React.FC<
  React.HTMLAttributes<HTMLFormElement> & React.RefAttributes<HTMLFormElement>
>;

  return (
    <motion.div
      className="relative z-10 p-6 md:p-8 bg-gradient-to-b from-black/40 via-black/20 to-transparent backdrop-blur-sm rounded-xl min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-red flex items-center gap-2">
          <CalendarDays className="w-7 h-7 text-brand-blue" /> Registros de Entrenamiento
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-black/50 border border-gray-700 rounded-lg px-3 py-2 w-full sm:w-64">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar por alumno, clase o instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1 text-gray-200 placeholder-gray-500"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-blue px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all shadow-glow w-full sm:w-auto"
          >
            <PlusCircle className="w-5 h-5" />
            Nuevo Registro
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-800 bg-black/60 backdrop-blur-md shadow-glow">
        {loading ? (
          <p className="text-gray-400 text-center py-6">Cargando registros...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No hay registros disponibles.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-brand-red/30 to-brand-blue/30 text-white uppercase text-xs tracking-wider">
                <th className="px-4 py-3 text-left">Alumno</th>
                <th className="px-4 py-3 text-left">Correo</th>
                <th className="px-4 py-3 text-left">Clase</th>
                <th className="px-4 py-3 text-left">Instructor</th>
                <th className="px-4 py-3 text-left">Fecha / Hora</th>
                <th className="px-4 py-3 text-left">Duración</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, idx) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-t border-gray-800 hover:bg-white/10 transition-colors"
                >
                  <td className="px-4 py-3">{log.profiles?.[0]?.full_name}</td>
                  <td className="px-4 py-3 text-gray-400">{log.profiles?.[0]?.email}</td>
                  <td className="px-4 py-3 text-gray-300">{log.class_name}</td>
                  <td className="px-4 py-3 text-gray-400">{log.instructor}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(log.date).toLocaleString("es-MX")}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{log.duration} min</td>
                  <td className="px-4 py-3 flex gap-3">
                    <button onClick={() => openEditModal(log)} className="text-brand-blue hover:text-white transition">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(log.id)} className="text-brand-red hover:text-white transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filtered.map((log) => (
          <div key={log.id} className="bg-black/60 border border-gray-800 rounded-xl p-4 shadow-glow">
            <h3 className="font-heading text-lg text-white">{log.class_name}</h3>
            <p className="text-sm text-gray-400">
              <User className="inline w-4 h-4 text-brand-blue mr-1" />
              {log.profiles?.[0]?.full_name}
            </p>
            <p className="text-sm text-gray-400">
              <Mail className="inline w-4 h-4 text-brand-red mr-1" />
              {log.profiles?.[0]?.email}
            </p>
            <p className="text-sm text-gray-400">
              <Clock className="inline w-4 h-4 text-brand-blue mr-1" />
              {log.duration} min — {new Date(log.date).toLocaleString("es-MX")}
            </p>
            <div className="flex justify-end gap-3 mt-3">
              <button onClick={() => openEditModal(log)} className="text-brand-blue hover:text-white transition">
                <Edit3 className="w-5 h-5" />
              </button>
              <button onClick={() => handleDelete(log.id)} className="text-brand-red hover:text-white transition">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MotionForm
              onSubmit={handleAddOrEdit}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/80 border border-gray-700 rounded-xl p-6 w-[90%] max-w-md space-y-4 shadow-glow"
            >
              <h2 className="text-2xl font-heading text-brand-blue mb-2 text-center">
                {isEditing ? "Editar Registro" : "Añadir Registro"}
              </h2>
              <select
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-brand-blue"
                required
              >
                <option value="">Seleccionar alumno</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.email})
                  </option>
                ))}
              </select>
              <select
                value={form.class_name}
                onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-brand-red"
                required
              >
                <option value="">Seleccionar clase</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Instructor"
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-brand-blue"
                required
              />
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-brand-red"
                required
              />
              <input
                type="number"
                placeholder="Duración (min)"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-brand-blue"
                required
              />
              <div className="flex justify-between mt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-brand-red to-brand-blue text-white font-semibold hover:scale-105 transition-transform"
                >
                  {saving ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </MotionForm>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
