"use client";

import { useEffect, useState, useRef } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, FileText } from "lucide-react";
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
}

export default function UsersPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");

  // Modal state
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [notes, setNotes] = useState("");
  const [belt, setBelt] = useState("");
  const [saving, setSaving] = useState(false);

  // Ref to dedupe fetch
  const hasFetched = useRef(false);

  useEffect(() => {
    async function fetchProfiles() {
      // Guard against StrictMode double-run
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
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
  }, []);

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
        body: JSON.stringify({
          student_notes: notes,
          belt_level: belt,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to save`);
      }

      // update UI instantly
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

  if (loading) {
    return (
      <section className="pt-28 pb-24 max-w-6xl mx-auto px-6">
        <div className="text-center text-white">Cargando usuarios...</div>
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
          Usuarios Registrados
        </h1>

        {/* Search */}
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
                <th className="px-4 py-3 text-left">Fecha de Ingreso</th>
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
                        src={user.avatar || "/images/default-avatar.png"}
                        alt={user.full_name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{user.full_name}</td>
                  <td className="px-4 py-3 text-gray-300">{user.email}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {user.joinDate
                      ? new Date(user.joinDate).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
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

      {/* 📝 Notes + Belt Modal */}
      <AnimatePresence>
        {showNotesModal && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
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
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}