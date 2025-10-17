"use client";

import { useEffect, useState } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, FileText, Ruler, Weight, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

// ✅ Type-safe MotionForm helper to avoid TS build errors
const MotionForm = motion.form as React.FC<
  React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  > &
    import("framer-motion").MotionProps
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

export default function UsersPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");

  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [notes, setNotes] = useState("");
  const [belt, setBelt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const profile = await res.json();
          setIsAdmin(profile.role === "admin");
        } else setIsAdmin(false);
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [router]);

  useEffect(() => {
    if (isAdmin !== true) return;
    async function fetchProfiles() {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        setProfiles(data || []);
        setFiltered(data || []);
      } catch (err) {
        console.error("Error fetching profiles:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, [isAdmin]);

  useEffect(() => {
    if (!search) return setFiltered(profiles);
    const term = search.toLowerCase();
    setFiltered(
      profiles.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(term) ||
          p.email?.toLowerCase().includes(term)
      )
    );
  }, [search, profiles]);

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
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_notes: notes, belt_level: belt }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to save`);
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
        <p className="text-gray-300 mb-6">No tienes permisos de administrador.</p>
        <button
          onClick={() => router.push("/profile")}
          className="px-6 py-3 rounded-lg bg-brand-red text-white hover:bg-brand-blue transition-colors"
        >
          Ir a Perfil
        </button>
      </section>
    );

  return (
    <motion.div
      className="relative z-10 p-6 md:p-8 bg-gradient-to-b from-black/40 via-black/20 to-transparent backdrop-blur-sm rounded-xl min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-red uppercase">
          Fichas de Peleadores
        </h1>
        <div className="flex items-center bg-black/50 border border-gray-700 rounded-lg px-3 py-2 w-full sm:w-auto">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full sm:w-64 text-gray-200 placeholder-gray-500"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((user, idx) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="bg-black/70 border border-gray-800 rounded-2xl p-5 shadow-glow flex flex-col justify-between hover:shadow-brand-blue/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-700">
                    <Image
                      src={user.avatar || "/images/avatar.jpeg"}
                      alt={user.full_name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user.full_name}</h3>
                    <p className="text-xs text-gray-400 truncate max-w-[160px]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-md uppercase ${
                    user.belt_level
                      ? "bg-brand-blue/20 text-brand-blue border border-brand-blue/40"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {user.belt_level || "Sin Cinta"}
                </span>
              </div>

              <div className="bg-gradient-to-r from-brand-red/10 to-brand-blue/10 rounded-lg border border-gray-700 px-3 py-2 flex flex-wrap justify-between text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-red" />
                  <span>{user.edad ? `${user.edad} años` : "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Weight className="w-4 h-4 text-brand-blue" />
                  <span>{user.peso ? `${user.peso} kg` : "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-brand-red" />
                  <span>{user.estatura ? `${user.estatura} m` : "—"}</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-400 flex justify-between">
                <span>
                  <Clock className="inline w-4 h-4 mr-1 text-brand-blue" />
                  Experiencia: {user.tiempoEntrenando || "—"}
                </span>
                <span className="text-gray-500">
                  {user.joinDate
                    ? new Date(user.joinDate).toLocaleDateString("es-MX")
                    : "—"}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => openNotesModal(user)}
                className="text-brand-blue hover:text-white transition"
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

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
