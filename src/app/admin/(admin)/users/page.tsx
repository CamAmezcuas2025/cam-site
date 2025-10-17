"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  FileText,
  Users,
  Clock,
  Weight,
  Ruler,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ✅ Motion <form>
const MotionForm = motion.form as unknown as React.FC<
  React.HTMLAttributes<HTMLFormElement> &
    React.FormHTMLAttributes<HTMLFormElement> &
    import("framer-motion").MotionProps &
    React.RefAttributes<HTMLFormElement>
>;

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar?: string;
  joinDate?: string;
  classes?: string[];
  role: string;
  student_notes?: string;
  belt_level?: string;
  edad?: number | null;
  peso?: number | null;
  estatura?: number | null;
  tiempoEntrenando?: string | null;
}

// ✅ Stat card
function StatCard({
  label,
  value,
  Icon,
  color,
}: {
  label: string;
  value: string | number;
  Icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-black/60 to-black/30 border border-gray-800 rounded-xl px-4 py-4 shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:scale-[1.03] transition-transform duration-200">
      <Icon className={`w-6 h-6 mb-2 ${color}`} />
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-white mt-1 truncate max-w-[8rem]">
        {value}
      </p>
    </div>
  );
}

export default function UsersPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");

  // Modal
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [notes, setNotes] = useState("");
  const [belt, setBelt] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ Admin check
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const profile = await res.json();
          setIsAdmin(profile.role === "admin");
        } else setIsAdmin(false);
      } catch (err) {
        console.error("Admin check failed:", err);
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [router]);

  // ✅ Fetch profiles directly from Supabase (like dashboard)
  useEffect(() => {
    if (isAdmin !== true) return;

    async function fetchProfiles() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            id,
            full_name,
            email,
            avatar,
            joinDate,
            role,
            classes,
            student_notes,
            belt_level,
            edad,
            peso,
            estatura,
            tiempoEntrenando
          `
          )
          .neq("role", "admin")
          .order("full_name", { ascending: true });

        if (error) throw error;
        setProfiles(data || []);
        setFiltered(data || []);
      } catch (err) {
        console.error("Error fetching profiles:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfiles();
  }, [isAdmin, supabase]);

  // ✅ Search
  useEffect(() => {
    if (!search) {
      setFiltered(profiles);
      return;
    }
    const term = search.toLowerCase();
    setFiltered(
      profiles.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(term) ||
          p.email?.toLowerCase().includes(term)
      )
    );
  }, [search, profiles]);

  // ✅ Notes modal
  function openNotesModal(user: Profile) {
    setSelectedUser(user);
    setNotes(user.student_notes || "");
    setBelt(user.belt_level || "");
    setShowNotesModal(true);
  }

  async function handleSaveNotes(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          student_notes: notes,
          belt_level: belt,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      setProfiles((prev) =>
        prev.map((p) =>
          p.id === selectedUser.id
            ? { ...p, student_notes: notes, belt_level: belt }
            : p
        )
      );
      setFiltered((prev) =>
        prev.map((p) =>
          p.id === selectedUser.id
            ? { ...p, student_notes: notes, belt_level: belt }
            : p
        )
      );

      setShowNotesModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error saving notes:", err);
    } finally {
      setSaving(false);
    }
  }

  // ✅ Averages
  const { avgAge, avgWeight, avgHeight, avgExp } = useMemo(() => {
    const safeNum = (n: number | null | undefined) =>
      typeof n === "number" ? n : 0;
    const getAvg = (arr: number[]) =>
      arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    const ages = filtered.map((p) => safeNum(p.edad)).filter((n) => n > 0);
    const weights = filtered.map((p) => safeNum(p.peso)).filter((n) => n > 0);
    const heights = filtered.map((p) => safeNum(p.estatura)).filter((n) => n > 0);
    const avgAge = getAvg(ages);
    const avgWeight = getAvg(weights);
    const avgHeight =
      heights.length > 0
        ? Math.round(
            (heights.reduce((a, b) => a + b, 0) / heights.length) * 100
          ) / 100
        : 0;

    const expMatches = filtered
      .map((p) =>
        parseFloat(
          (p.tiempoEntrenando || "").match(/\d+(\.\d+)?/)?.[0] || "0"
        )
      )
      .filter((n) => n > 0);
    const avgExp = expMatches.length
      ? (expMatches.reduce((a, b) => a + b, 0) / expMatches.length).toFixed(1)
      : "—";

    return { avgAge, avgWeight, avgHeight, avgExp };
  }, [filtered]);

  // ✅ Load states
  if (isAdmin === null || loading)
    return (
      <section className="pt-28 pb-24 max-w-6xl mx-auto px-6">
        <div className="text-center text-white">Cargando usuarios...</div>
      </section>
    );

  if (isAdmin === false)
    return (
      <section className="pt-28 pb-24 max-w-md mx-auto px-6 text-center">
        <h1 className="text-4xl font-heading text-brand-red mb-4">
          Acceso Denegado
        </h1>
        <p className="text-gray-300 mb-6">
          No tienes permisos de administrador.
        </p>
        <button
          onClick={() => router.push("/profile")}
          className="px-6 py-3 rounded-lg bg-brand-red text-white hover:bg-brand-blue transition-colors"
        >
          Ir a Perfil
        </button>
      </section>
    );

  // ✅ Main UI
  return (
    <motion.div
      className="relative z-10 p-6 md:p-8 bg-gradient-to-b from-black/40 via-black/20 to-transparent backdrop-blur-sm rounded-xl min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-red">
            Usuarios Registrados
          </h1>

          <div className="flex items-center bg-black/50 border border-gray-700 rounded-lg px-3 py-2 w-full md:w-auto">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full md:w-64 text-gray-200 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Stats */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              label="Total Alumnos"
              value={filtered.length}
              Icon={Users}
              color="text-brand-red"
            />
            <StatCard
              label="Edad Promedio"
              value={avgAge || "—"}
              Icon={Clock}
              color="text-brand-blue"
            />
            <StatCard
              label="Peso Promedio"
              value={avgWeight ? `${avgWeight} kg` : "—"}
              Icon={Weight}
              color="text-brand-red"
            />
            <StatCard
              label="Altura Promedio"
              value={avgHeight ? `${avgHeight} m` : "—"}
              Icon={Ruler}
              color="text-brand-blue"
            />
            <StatCard
              label="Experiencia Promedio"
              value={avgExp ? `${avgExp} años` : "—"}
              Icon={Activity}
              color="text-purple-400"
            />
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center">No se encontraron usuarios.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/60 backdrop-blur-md shadow-glow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-brand-red/30 to-brand-blue/30 text-white uppercase text-xs tracking-wider">
                <th className="px-4 py-3 text-left">Avatar</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Correo</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Edad</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">
                  Peso (kg)
                </th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">
                  Altura (m)
                </th>
                <th className="px-4 py-3 text-left hidden md:table-cell">
                  Experiencia
                </th>
                <th className="px-4 py-3 text-left">Clases</th>
                <th className="px-4 py-3 text-left">Cinta</th>
                <th className="px-4 py-3 text-left">Notas</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-t border-gray-800 hover:bg-white/10 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700">
                      <Image
                        src={user.avatar || "/images/avatar.jpeg"}
                        alt={user.full_name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{user.full_name}</td>
                  <td className="px-4 py-3 text-gray-300">{user.email}</td>
                  <td className="px-4 py-3 text-gray-300 hidden sm:table-cell">
                    {user.edad ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300 hidden sm:table-cell">
                    {user.peso ? `${user.peso}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300 hidden sm:table-cell">
                    {user.estatura ? `${user.estatura}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300 hidden md:table-cell">
                    {user.tiempoEntrenando || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {user.classes?.length ? user.classes.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {user.belt_level || "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => openNotesModal(user)}
                      className="text-brand-blue hover:text-white transition"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes Modal */}
      <AnimatePresence>
        {showNotesModal && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MotionForm
              onSubmit={handleSaveNotes}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/80 border border-gray-700 rounded-xl p-6 w-[90%] max-w-md space-y-4 shadow-glow"
            >
              <h2 className="text-2xl font-heading text-brand-blue mb-2 text-center">
                Notas del Entrenador
              </h2>
              <p className="text-sm text-gray-400 text-center mb-3">
                {selectedUser.full_name}
              </p>

              <label className="block text-sm text-gray-400 mb-1">
                Nivel de Cinta (si aplica)
              </label>
              <input
                type="text"
                value={belt}
                onChange={(e) => setBelt(e.target.value)}
                placeholder="Ej. Blanca, Azul, Morada..."
                className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-brand-red mb-3"
              />

              <label className="block text-sm text-gray-400 mb-1">
                Observaciones / Notas
              </label>
              <textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-900 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-brand-blue resize-none"
                placeholder="Escribe tus observaciones o notas aquí..."
              />

              <div className="flex justify-between mt-5">
                <button
                  type="button"
                  onClick={() => setShowNotesModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-brand-red to-brand-blue text-white font-semibold hover:scale-105 transition-transform"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </MotionForm>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
