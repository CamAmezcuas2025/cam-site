"use client";

import { useEffect, useState, useRef } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Users, 
  PlusCircle, 
  Trash2, 
  Edit3,
  TrendingUp,
  Award,
  Activity,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface AttendanceRecord {
  id: string;
  class_name: string;
  class_type: string;
  class_time: string;
  coach_name: string;
  students_attended: number;
  date: string;
  notes?: string;
  created_at: string;
}

// ============================================================================
// FIXED SCHEDULES
// ============================================================================

const CLASS_SCHEDULES = {
  boxeo: [
    { label: "Matutino", time: "7:00 am – 11:00 am", emoji: "🥊" },
    { label: "Tarde", time: "3:00 pm – 6:00 pm", emoji: "🥊" },
    { label: "Noche", time: "8:00 pm – 10:00 pm", emoji: "🥊" },
  ],
  kickboxing: [
    { label: "Matutino", time: "7:00 am – 11:00 am", emoji: "👊" },
    { label: "Tarde", time: "6:00 pm – 8:00 pm", emoji: "👊" },
    { label: "Noche", time: "9:00 pm – 10:00 pm", emoji: "👊" },
  ],
  mma: [
    { label: "Matutino", time: "7:00 am – 11:00 am", emoji: "🤼" },
    { label: "Tarde", time: "6:00 pm – 8:00 pm", emoji: "🤼" },
    { label: "Noche", time: "9:00 pm – 10:00 pm", emoji: "🤼" },
  ],
  jiu_jitsu: [
    { label: "Jóvenes/Adultos 1", time: "6:00 pm – 7:00 pm", emoji: "🤼‍♀️", days: "Lun, Mié, Vie" },
    { label: "Jóvenes/Adultos 2", time: "7:00 pm – 8:00 pm", emoji: "🤼‍♀️", days: "Lun, Mié, Vie" },
  ],
  limalama: [
    { label: "Niños", time: "4:00 pm – 5:00 pm", emoji: "🥋" },
    { label: "Jóvenes/Adultos", time: "6:00 pm – 8:00 pm", emoji: "🥋" },
  ],
  yoga: [
    { label: "Grupo 1 (Mixto)", time: "7:00 am – 8:00 am", emoji: "🧘‍♂️" },
    { label: "Grupo 2 (Mujeres)", time: "8:00 am – 9:00 am", emoji: "🧘‍♀️" },
    { label: "Grupo 3 (Mixto)", time: "7:00 pm – 8:00 pm", emoji: "🧘‍♂️" },
    { label: "Grupo 4 (Mujeres)", time: "8:00 pm – 9:00 pm", emoji: "🧘‍♀️" },
  ],
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClassAttendancePage() {
  const supabase = createClientSupabaseClient();
  
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    class_type: "boxeo",
    class_schedule: 0, // index into CLASS_SCHEDULES
    coach_name: "",
    students_attended: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const hasFetched = useRef(false);

  // ============================================================================
  // FETCH RECORDS
  // ============================================================================

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchRecords();
  }, []);

  async function fetchRecords() {
    try {
      const { data, error } = await supabase
        .from("admin_classes")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // CALCULATE STATS
  // ============================================================================

  const stats = {
    totalRecords: records.length,
    totalStudents: records.reduce((sum, r) => sum + r.students_attended, 0),
    avgPerClass: records.length > 0 
      ? Math.round(records.reduce((sum, r) => sum + r.students_attended, 0) / records.length)
      : 0,
    thisWeek: records.filter(r => {
      const recordDate = new Date(r.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return recordDate >= weekAgo;
    }).length,
  };

  // ============================================================================
  // MODAL ACTIONS
  // ============================================================================

  function openAddModal() {
    setForm({
      class_type: "boxeo",
      class_schedule: 0,
      coach_name: "",
      students_attended: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setIsEditing(false);
    setSelectedId(null);
    setShowModal(true);
  }

  function openEditModal(record: AttendanceRecord) {
    // Find the schedule index
    const schedules = CLASS_SCHEDULES[record.class_type as keyof typeof CLASS_SCHEDULES] || [];
    const scheduleIndex = schedules.findIndex(s => s.time === record.class_time);

    setForm({
      class_type: record.class_type,
      class_schedule: scheduleIndex >= 0 ? scheduleIndex : 0,
      coach_name: record.coach_name,
      students_attended: record.students_attended.toString(),
      date: record.date,
      notes: record.notes || "",
    });
    setIsEditing(true);
    setSelectedId(record.id);
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    
    const schedules = CLASS_SCHEDULES[form.class_type as keyof typeof CLASS_SCHEDULES];
    const selectedSchedule = schedules[form.class_schedule];
    
    const payload = {
      class_name: `${form.class_type.charAt(0).toUpperCase() + form.class_type.slice(1)} - ${selectedSchedule.label}`,
      class_type: form.class_type,
      class_time: selectedSchedule.time,
      coach_name: form.coach_name,
      students_attended: parseInt(form.students_attended) || 0,
      date: form.date,
      notes: form.notes || null,
    };

    setSubmitting(true);

    try {
      if (isEditing && selectedId) {
        const { error } = await supabase
          .from("admin_classes")
          .update(payload)
          .eq("id", selectedId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("admin_classes")
          .insert([payload]);
        if (error) throw error;
      }

      await fetchRecords();
      setShowModal(false);
      alert("✅ Asistencia registrada");
    } catch (err: any) {
      console.error("Error saving attendance:", err);
      alert("❌ Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este registro?")) return;

    setDeletingId(id);

    try {
      const { error } = await supabase
        .from("admin_classes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRecords(records.filter(r => r.id !== id));
      alert("✅ Registro eliminado");
    } catch (err: any) {
      console.error("Error deleting:", err);
      alert("❌ Error: " + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <section className="pt-28 pb-24 max-w-7xl mx-auto px-6">
        <div className="text-center text-white">Cargando asistencias...</div>
      </section>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-28 pb-24 px-4 md:px-8 text-white min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-blue flex items-center gap-2">
            <Activity className="w-8 h-8 text-brand-red" />
            Asistencia de Clases
          </h1>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-brand-red to-brand-blue font-semibold hover:opacity-90 transition shadow-glow"
          >
            <PlusCircle className="w-5 h-5" />
            Registrar Asistencia
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/40 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">Registros Totales</div>
            <div className="text-2xl font-bold text-brand-blue">{stats.totalRecords}</div>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">Estudiantes (Total)</div>
            <div className="text-2xl font-bold text-green-400">{stats.totalStudents}</div>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">Promedio por Clase</div>
            <div className="text-2xl font-bold text-purple-400">{stats.avgPerClass}</div>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">Clases Esta Semana</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.thisWeek}</div>
          </div>
        </div>

        {/* TABLE */}
        {records.length === 0 ? (
          <div className="text-center py-20 bg-black/40 rounded-2xl border border-gray-800">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg mb-4">
              No hay registros de asistencia aún
            </p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-brand-red to-brand-blue font-semibold hover:opacity-90 transition"
            >
              Registrar Primera Clase
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/60 backdrop-blur-md shadow-glow">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-brand-red/30 to-brand-blue/30 text-white uppercase text-xs tracking-wider">
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Clase</th>
                  <th className="px-4 py-3 text-left">Horario</th>
                  <th className="px-4 py-3 text-left">Coach</th>
                  <th className="px-4 py-3 text-left">Estudiantes</th>
                  <th className="px-4 py-3 text-left">Notas</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, idx) => {
                  const classType = record.class_type as keyof typeof CLASS_SCHEDULES;
                  const emoji = CLASS_SCHEDULES[classType]?.[0]?.emoji || "📚";

                  return (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-t border-gray-800 hover:bg-white/10 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-300">
                        {new Date(record.date).toLocaleDateString('es-MX', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        <span className="mr-2">{emoji}</span>
                        {record.class_name}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {record.class_time}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {record.coach_name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 font-semibold">
                          {record.students_attended}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">
                        {record.notes || "—"}
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => openEditModal(record)}
                          className="text-brand-blue hover:text-white transition"
                          title="Editar"
                        >
                          <Edit3 className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          disabled={deletingId === record.id}
                          className="text-brand-red hover:text-white transition disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/90 border border-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <form onSubmit={handleSave} className="space-y-4">
                <h2 className="text-2xl font-bold text-center mb-4">
                  {isEditing ? "Editar Asistencia" : "Registrar Asistencia"}
                </h2>

              {/* Date */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white outline-none focus:border-brand-blue"
                  required
                />
              </div>

              {/* Class Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipo de Clase</label>
                <select
                  value={form.class_type}
                  onChange={(e) => setForm({ ...form, class_type: e.target.value, class_schedule: 0 })}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white outline-none focus:border-brand-blue"
                >
                  <option value="boxeo">🥊 Boxeo</option>
                  <option value="kickboxing">👊 Kickboxing</option>
                  <option value="mma">🤼 MMA</option>
                  <option value="jiu_jitsu">🤼‍♀️ Jiu Jitsu</option>
                  <option value="limalama">🥋 Limalama Kombat</option>
                  <option value="yoga">🧘 Yoga</option>
                </select>
              </div>

              {/* Class Schedule */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Horario</label>
                <select
                  value={form.class_schedule}
                  onChange={(e) => setForm({ ...form, class_schedule: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white outline-none focus:border-brand-blue"
                >
                  {CLASS_SCHEDULES[form.class_type as keyof typeof CLASS_SCHEDULES].map((schedule, idx) => (
                    <option key={idx} value={idx}>
                      {schedule.label} - {schedule.time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coach Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre del Coach</label>
                <input
                  type="text"
                  value={form.coach_name}
                  onChange={(e) => setForm({ ...form, coach_name: e.target.value })}
                  placeholder="Ej: Coach Juan"
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white outline-none focus:border-brand-blue"
                  required
                />
              </div>

              {/* Students Attended */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Estudiantes que Asistieron</label>
                <input
                  type="number"
                  min="0"
                  value={form.students_attended}
                  onChange={(e) => setForm({ ...form, students_attended: e.target.value })}
                  placeholder="Ej: 15"
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white outline-none focus:border-brand-blue"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Notas (opcional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Ej: Clase especial de técnicas avanzadas"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white outline-none focus:border-brand-blue resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-brand-red to-brand-blue font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </motion.div>
  );
}