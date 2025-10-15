"use client";

import { useEffect, useState, useRef } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Dumbbell, Search, User, PlusCircle, Trash2, Edit3 } from "lucide-react";

// ✅ Correct fix for Framer Motion 11+ (no .create)
const MotionForm =
  motion.form as React.FC<
    React.DetailedHTMLProps<
      React.FormHTMLAttributes<HTMLFormElement>,
      HTMLFormElement
    >
  >;


interface GymClass {
  id: string;
  name: string;
  coach?: string;
  schedule?: string;
  capacity?: number;
  enrolled?: number;
}

export default function ClassesPage() {
  const supabase = createClientSupabaseClient();
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [filtered, setFiltered] = useState<GymClass[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    coach: "",
    schedule: "",
    capacity: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    async function fetchClasses() {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const { data, error } = await supabase
          .from("admin_classes")
          .select("id, name, coach, schedule, capacity, enrolled, created_at")
          .order("created_at", { ascending: true });
        if (error) throw error;
        setClasses(data || []);
        setFiltered(data || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(classes);
      return;
    }
    const term = search.toLowerCase();
    setFiltered(
      classes.filter(
        (c) =>
          c.name?.toLowerCase().includes(term) ||
          c.coach?.toLowerCase().includes(term)
      )
    );
  }, [search, classes]);

  function openAddModal() {
    setForm({ name: "", coach: "", schedule: "", capacity: "" });
    setIsEditing(false);
    setSelectedId(null);
    setShowModal(true);
  }

  function openEditModal(clase: GymClass) {
    setIsEditing(true);
    setSelectedId(clase.id);
    setForm({
      name: clase.name || "",
      coach: clase.coach || "",
      schedule: clase.schedule || "",
      capacity: clase.capacity?.toString() || "",
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.coach || !form.schedule) return;
    setSubmitting(true);
    try {
      if (isEditing && selectedId) {
        const { error } = await supabase
          .from("admin_classes")
          .update({
            name: form.name,
            coach: form.coach,
            schedule: form.schedule,
            capacity: Number(form.capacity) || 0,
          })
          .eq("id", selectedId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("admin_classes").insert([
          {
            name: form.name,
            coach: form.coach,
            schedule: form.schedule,
            capacity: Number(form.capacity) || 0,
            enrolled: 0,
          },
        ]);
        if (error) throw error;
      }
      await fetchClasses();
      setShowModal(false);
      setIsEditing(false);
      setSelectedId(null);
    } catch (err) {
      console.error("Error saving class:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteClass(id: string) {
    const confirmDelete = confirm("¿Eliminar esta clase?");
    if (!confirmDelete) return;
    try {
      const { error } = await supabase.from("admin_classes").delete().eq("id", id);
      if (error) throw error;
      setClasses((prev) => prev.filter((c) => c.id !== id));
      setFiltered((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting class:", err);
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
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-blue flex items-center gap-2">
          <Dumbbell className="w-7 h-7 text-brand-red" /> Clases Programadas
        </h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black/50 border border-gray-700 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar por nombre o coach..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-64 text-gray-200 placeholder-gray-500"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-red to-brand-blue px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all shadow-glow"
          >
            <PlusCircle className="w-5 h-5" />
            Nueva Clase
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center">Cargando clases...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-center">No hay clases disponibles.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/60 backdrop-blur-md shadow-glow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-brand-blue/30 to-brand-red/30 text-white uppercase text-xs tracking-wider">
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Coach</th>
                <th className="px-4 py-3 text-left">Horario</th>
                <th className="px-4 py-3 text-left">Capacidad</th>
                <th className="px-4 py-3 text-left">Inscritos</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((clase, idx) => (
                <motion.tr
                  key={clase.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-t border-gray-800 hover:bg-white/10 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-white">
                    {clase.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-blue" />
                    {clase.coach || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-red" />
                    {(() => {
                      try {
                        const parsed = new Date(clase.schedule);
                        return isNaN(parsed.getTime())
                          ? clase.schedule || "Horario no definido"
                          : parsed.toLocaleString("es-MX", {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                      } catch {
                        return clase.schedule || "Horario no definido";
                      }
                    })()}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{clase.capacity ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{clase.enrolled ?? "—"}</td>
                  <td className="px-4 py-3 text-center space-x-3">
                    <button
                      onClick={() => openEditModal(clase)}
                      className="text-brand-blue hover:text-white transition"
                    >
                      <Edit3 className="w-5 h-5 inline-block" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(clase.id)}
                      className="text-brand-red hover:text-white transition"
                    >
                      <Trash2 className="w-5 h-5 inline-block" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* ✅ Replaced <motion.form> with <MotionForm> */}
            {/* ✅ Using the MotionForm alias properly */}
<MotionForm
  onSubmit={handleSave as unknown as React.FormEventHandler<HTMLFormElement>}
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.9, opacity: 0 }}
  transition={{ duration: 0.3 }}
  className="bg-black/80 border border-gray-700 rounded-xl p-6 w-full max-w-md space-y-4 shadow-glow"
>
  <h2 className="text-2xl font-heading text-brand-red mb-2 text-center">
    {isEditing ? "Editar Clase" : "Añadir Nueva Clase"}
  </h2>

  <input
    type="text"
    placeholder="Nombre de la clase"
    value={form.name}
    onChange={(e) => setForm({ ...form, name: e.target.value })}
    className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red"
    required
  />
  <input
    type="text"
    placeholder="Coach"
    value={form.coach}
    onChange={(e) => setForm({ ...form, coach: e.target.value })}
    className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
    required
  />
  <input
    type="datetime-local"
    value={form.schedule}
    onChange={(e) => setForm({ ...form, schedule: e.target.value })}
    className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
    required
  />
  <input
    type="number"
    placeholder="Capacidad (opcional)"
    value={form.capacity}
    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
    className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red"
  />

  <div className="flex justify-between mt-4">
    <button
      type="button"
      onClick={() => setShowModal(false)}
      className="px-4 py-2 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
    >
      Cancelar
    </button>
    <button
      type="submit"
      disabled={submitting}
      className="px-4 py-2 rounded-md bg-gradient-to-r from-brand-red to-brand-blue text-white font-semibold hover:scale-105 transition-transform"
    >
      {submitting ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
    </button>
  </div>
</MotionForm>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
