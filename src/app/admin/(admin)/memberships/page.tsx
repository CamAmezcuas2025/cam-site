"use client";

import { useEffect, useState, useRef } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Users,
  CalendarDays,
  DollarSign,
  PiggyBank,
  CreditCard,
  ClockAlert,
} from "lucide-react";

interface Membership {
  id: string;
  type: string;
  price: string;
  duration: string;
  active_members: number;
  total_revenue: number;
  created_at: string;
  status?: string;
}

export default function MembershipsPage() {
  const supabase = createClientSupabaseClient();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "",
    price: "",
    duration: "",
    active_members: "",
  });
  const [saving, setSaving] = useState(false);

  const [assignModal, setAssignModal] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);

  // Ref to dedupe fetch/subscribe (prevents StrictMode doubles in dev)
  const hasFetched = useRef(false);

  useEffect(() => {
    // Initial fetch with guard
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchMemberships();
    }

    // Realtime subscription
    const channel = supabase
      .channel("user_memberships_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_memberships" }, fetchMemberships)
      .subscribe();

    // Cleanup unsubscribe on unmount
    return () => supabase.removeChannel(channel);
  }, []);

  // 🧠 Fetch memberships + aggregates
  async function fetchMemberships() {
    setLoading(true);

    const { data: memberships, error: memError } = await supabase
      .from("admin_memberships")
      .select("*")
      .order("created_at", { ascending: false });

    if (memError) {
      console.error("Memberships fetch error:", memError);
      setLoading(false);
      return;
    }

    if (!memberships) {
      setLoading(false);
      return;
    }

    // Aggregate user_memberships per membership_id
    const { data: aggregates, error: aggError } = await supabase
      .from("user_memberships")
      .select("membership_id, total_paid, active");

    if (aggError) {
      console.error("Aggregates fetch error:", aggError);
    }

    const counts: Record<string, number> = {};
    const revenues: Record<string, number> = {};

    aggregates?.forEach((row) => {
      if (row.membership_id) {
        if (row.active) {
          counts[row.membership_id] = (counts[row.membership_id] || 0) + 1;
        }
        revenues[row.membership_id] =
          (revenues[row.membership_id] || 0) + (Number(row.total_paid) || 0);
      }
    });

    const enriched = memberships.map((m) => ({
      ...m,
      active_members: counts[m.id] || 0,
      total_revenue: revenues[m.id] || 0,
    }));

    setMemberships(enriched);
    setLoading(false);
  }

  // CRUD
  function openAddModal() {
    setIsEditing(false);
    setForm({ type: "", price: "", duration: "", active_members: "" });
    setShowModal(true);
  }

  function openEditModal(m: Membership) {
    setIsEditing(true);
    setSelectedId(m.id);
    setForm({
      type: m.type,
      price: m.price,
      duration: m.duration,
      active_members: m.active_members.toString(),
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing && selectedId) {
        await supabase
          .from("admin_memberships")
          .update({
            type: form.type,
            price: form.price,
            duration: form.duration,
          })
          .eq("id", selectedId);
      } else {
        await supabase.from("admin_memberships").insert([
          {
            type: form.type,
            price: form.price,
            duration: form.duration,
          },
        ]);
      }
      await fetchMemberships();
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este plan de membresía?")) return;
    await supabase.from("admin_memberships").delete().eq("id", id);
    setMemberships((prev) => prev.filter((m) => m.id !== id));
  }

  function closeModal() {
    setShowModal(false);
    setIsEditing(false);
    setSelectedId(null);
  }

  // Assign
  async function openAssignModal(m: Membership) {
    setSelectedMembership(m);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .neq("role", "admin");
    setUsers(data || []);
    setAssignModal(true);
  }

  async function assignMembership(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !selectedMembership) return;
    await supabase.from("user_memberships").insert([
      {
        user_id: selectedUser,
        membership_id: selectedMembership.id,
        active: true,
      },
    ]);
    setAssignModal(false);
    await fetchMemberships();
  }

  function getStatusBadge(status?: string) {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-300 border border-green-600";
      case "expiring_soon":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-600 animate-pulse";
      case "expired":
        return "bg-red-500/20 text-red-300 border border-red-600";
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-700";
    }
  }

  return (
    <motion.div
      className="relative z-10 p-6 md:p-8 bg-gradient-to-b from-black/40 via-black/20 to-transparent backdrop-blur-sm rounded-xl min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* ✅ Header + Navigation buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-red flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-blue" /> Membresías
          </h1>

          <div className="flex gap-2">
            <Link
              href="/admin/memberships/pending"
              className="flex items-center gap-2 bg-yellow-600/20 border border-yellow-500/40 text-yellow-300 text-sm px-3 py-2 rounded-md hover:bg-yellow-600/40 transition"
            >
              <CreditCard className="w-4 h-4" /> Pagos Pendientes
            </Link>
            <Link
              href="/admin/memberships/expiring"
              className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/40 text-blue-300 text-sm px-3 py-2 rounded-md hover:bg-blue-600/40 transition"
            >
              <ClockAlert className="w-4 h-4" /> Por Expirar
            </Link>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-blue px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all shadow-glow w-full sm:w-auto"
        >
          <PlusCircle className="w-5 h-5" /> Nueva Membresía
        </button>
      </div>

      {/* ✅ Membership grid unchanged */}
      {loading ? (
        <p className="text-gray-400 text-center">Cargando membresías...</p>
      ) : memberships.length === 0 ? (
        <p className="text-gray-400 text-center">No hay planes disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {memberships.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0px 0px 30px rgba(230,0,0,0.4), 0px 0px 50px rgba(0,80,255,0.4)",
              }}
              className="relative overflow-hidden bg-black/60 border border-gray-800 rounded-xl p-6 shadow-glow transition-all duration-300"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
              />
              <div className="relative z-10">
                <h2 className="text-2xl font-heading text-white mb-2">{m.type}</h2>
                <p className="flex items-center text-brand-red text-lg font-semibold">
                  <DollarSign className="w-5 h-5 mr-1 text-brand-blue" />
                  {m.price} MXN
                </p>
                <p className="flex items-center text-gray-400 mt-1">
                  <CalendarDays className="w-4 h-4 mr-1 text-brand-red" />
                  {m.duration}
                </p>

                <div className="mt-3 text-sm text-gray-300 space-y-1">
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-blue" />
                    <span className="font-semibold text-white">
                      {m.active_members}
                    </span>{" "}
                    alumnos activos
                  </p>
                  <p className="flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-brand-red" />
                    <span
                      className={`font-semibold ${
                        m.total_revenue > 0 ? "text-green-400" : "text-gray-400"
                      }`}
                    >
                      ${m.total_revenue.toLocaleString("es-MX")} MXN
                    </span>{" "}
                    generados
                  </p>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => openAssignModal(m)}
                    className="text-brand-blue/80 hover:text-white transition"
                  >
                    <Users className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openEditModal(m)}
                    className="text-brand-blue hover:text-white transition"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-brand-red hover:text-white transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ✅ Existing Add/Edit modal unchanged */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={handleSave}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/80 border border-gray-700 rounded-xl p-6 w-[90%] max-w-md space-y-4 shadow-glow"
            >
              <h2 className="text-2xl font-heading text-brand-blue mb-2 text-center">
                {isEditing ? "Editar Membresía" : "Nueva Membresía"}
              </h2>

              <input
                type="text"
                placeholder="Tipo (Mensual, Anual...)"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-brand-blue"
                required
              />

              <input
                type="text"
                placeholder="Precio ($)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-brand-red"
                required
              />

              <input
                type="text"
                placeholder="Duración (30 días, 90 días...)"
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
                  {saving
                    ? "Guardando..."
                    : isEditing
                    ? "Actualizar"
                    : "Guardar"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Assign modal unchanged */}
      <AnimatePresence>
        {assignModal && selectedMembership && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/80 border border-gray-700 rounded-xl p-6 w-[90%] max-w-md space-y-4 shadow-glow"
            >
              <h2 className="text-2xl font-heading text-brand-blue mb-2 text-center">
                Asignar Membresía: {selectedMembership.type}
              </h2>
              <form onSubmit={assignMembership}>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-brand-red"
                  required
                >
                  <option value="">Seleccionar usuario</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name}
                    </option>
                  ))}
                </select>
                <div className="flex justify-between mt-5">
                  <button
                    type="button"
                    onClick={() => setAssignModal(false)}
                    className="px-4 py-2 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-gradient-to-r from-brand-red to-brand-blue text-white font-semibold hover:scale-105 transition-transform"
                  >
                    Asignar
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