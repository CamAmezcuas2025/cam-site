"use client";

import { useEffect, useState } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, FileText, SortAsc, SortDesc } from "lucide-react";
import { useRouter } from "next/navigation";

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
  estatura?: number | null;
  peso?: number | null;
  tiempoEntrenando?: string | null;
}

function getBeltColor(belt?: string) {
  const colorMap: Record<string, string> = {
    blanca: "bg-gray-400 text-black",
    azul: "bg-blue-500 text-white",
    morada: "bg-purple-500 text-white",
    marrón: "bg-amber-700 text-white",
    negra: "bg-black text-white border border-gray-300",
    roja: "bg-red-600 text-white",
  };
  return colorMap[belt?.toLowerCase() || ""] || "bg-gray-700 text-gray-200";
}

/** ✅ Framer Motion <form> typing fix (TS-safe) */
const MotionForm = motion.form as unknown as React.FC<
  React.HTMLAttributes<HTMLFormElement> &
    React.FormHTMLAttributes<HTMLFormElement> &
    import("framer-motion").MotionProps &
    React.RefAttributes<HTMLFormElement>
>;

export default function UsersPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Profile | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [notes, setNotes] = useState("");
  const [belt, setBelt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/profile");
        const profile = res.ok ? await res.json() : null;
        setIsAdmin(profile?.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [router]);

  useEffect(() => {
    if (isAdmin !== true) return;
    async function fetchProfiles() {
      const res = await fetch("/api/admin/users");
      if (!res.ok) return;
      const data = await res.json();
      setProfiles(data);
      setFiltered(data);
      setLoading(false);
    }
    fetchProfiles();
  }, [isAdmin]);

  // Search
  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      !term
        ? profiles
        : profiles.filter(
            (p) =>
              p.full_name?.toLowerCase().includes(term) ||
              p.email?.toLowerCase().includes(term)
          )
    );
  }, [search, profiles]);

  // Sort handler
  function toggleSort(key: keyof Profile) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey] ?? 0;
    const valB = b[sortKey] ?? 0;
    if (typeof valA === "string" && typeof valB === "string") {
      return sortDir === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return sortDir === "asc"
      ? (valA as number) - (valB as number)
      : (valB as number) - (valA as number);
  });

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
    await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_notes: notes, belt_level: belt }),
    });
    setShowNotesModal(false);
    setSaving(false);
  }

  if (isAdmin === null || loading)
    return (
      <div className="text-center text-white pt-20">Cargando usuarios...</div>
    );

  if (isAdmin === false)
    return (
      <div className="text-center text-white pt-20">
        No tienes permisos de administrador.
      </div>
    );

  return (
    <motion.div
      className="relative z-10 p-6 md:p-8 bg-gradient-to-b from-black/40 via-black/20 to-transparent backdrop-blur-sm min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-red">
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

      {/* Sort Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { key: "edad", label: "Edad" },
          { key: "peso", label: "Peso" },
          { key: "estatura", label: "Altura" },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => toggleSort(btn.key as keyof Profile)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md border ${
              sortKey === btn.key
                ? "bg-gradient-to-r from-brand-red to-brand-blue border-transparent"
                : "border-gray-600"
            }`}
          >
            {btn.label}
            {sortKey === btn.key &&
              (sortDir === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              ))}
          </button>
        ))}
      </div>

      {/* Card Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sorted.map((user, idx) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            className="bg-black/60 border border-gray-800 rounded-xl p-5 shadow-glow hover:scale-[1.02] transition-transform"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-700">
                  <Image
                    src={user.avatar || "/images/avatar.jpeg"}
                    alt={user.full_name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{user.full_name}</h3>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${getBeltColor(
                  user.belt_level
                )}`}
              >
                {user.belt_level || "Sin Cinta"}
              </span>
            </div>

            {/* Fighter Stats */}
            <div className="flex gap-2 text-center mb-3">
              <div className="flex-1 bg-gray-900/60 p-2 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Edad</p>
                <p className="text-lg font-bold">{user.edad ?? "—"}</p>
              </div>
              <div className="flex-1 bg-gray-900/60 p-2 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Peso</p>
                <p className="text-lg font-bold">{user.peso ?? "—"}kg</p>
              </div>
              <div className="flex-1 bg-gray-900/60 p-2 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Altura</p>
                <p className="text-lg font-bold">{user.estatura ?? "—"}m</p>
              </div>
            </div>

            <div className="text-sm text-gray-300 mb-2">
              <span className="text-gray-400">Experiencia:</span>{" "}
              {user.tiempoEntrenando || "—"}
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>
                {user.joinDate
                  ? new Date(user.joinDate).toLocaleDateString("es-MX")
                  : "—"}
              </span>
              <button
                onClick={() => openNotesModal(user)}
                className="text-brand-blue hover:text-white"
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

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
              <input
                type="text"
                value={belt}
                onChange={(e) => setBelt(e.target.value)}
                placeholder="Nivel de Cinta"
                className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-brand-red mb-3"
              />
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
