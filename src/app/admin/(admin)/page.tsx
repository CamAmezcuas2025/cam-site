"use client";

import { useEffect, useState, useRef } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Users,
  Ruler,
  Weight,
  Clock,
  Activity,
  Medal,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar?: string;
  role: string;
  belt_level?: string;
  edad?: number | null;
  estatura?: number | null;
  peso?: number | null;
  tiempoEntrenando?: string | null;
}

export default function PanelPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const hasFetched = useRef(false);

  // ✅ Fetch all non-admin profiles
  useEffect(() => {
    async function fetchProfiles() {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            id,
            full_name,
            email,
            avatar,
            role,
            belt_level,
            edad,
            estatura,
            peso,
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
  }, [supabase]);

  // ✅ Search logic
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

  if (loading) {
    return (
      <section className="pt-28 pb-24 max-w-6xl mx-auto px-6">
        <div className="text-center text-white">Cargando panel...</div>
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
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-blue flex items-center gap-2">
          <Users className="w-7 h-7 text-brand-red" /> Panel de Alumnos
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

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center">No hay alumnos registrados.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/60 backdrop-blur-md shadow-glow">
          <table className="min-w-full text-sm md:text-base">
            <thead className="bg-gradient-to-r from-brand-red/30 to-brand-blue/30 text-white uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Avatar</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Correo</th>
                <th className="px-4 py-3 text-left">Edad</th>
                <th className="px-4 py-3 text-left">Peso</th>
                <th className="px-4 py-3 text-left">Altura</th>
                <th className="px-4 py-3 text-left">Experiencia</th>
                <th className="px-4 py-3 text-left">Cinta</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
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
                    {user.edad || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {user.peso ? `${user.peso} kg` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {user.estatura ? `${user.estatura} m` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {user.tiempoEntrenando || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {user.belt_level || "—"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-10">
          <div className="flex flex-col items-center justify-center bg-black/50 border border-gray-800 rounded-lg py-3">
            <Users className="w-6 h-6 text-brand-red mb-1" />
            <p className="text-xs text-gray-400 uppercase">Total</p>
            <p className="text-lg font-bold">{filtered.length}</p>
          </div>
          <div className="flex flex-col items-center justify-center bg-black/50 border border-gray-800 rounded-lg py-3">
            <Clock className="w-6 h-6 text-brand-blue mb-1" />
            <p className="text-xs text-gray-400 uppercase">Edad Promedio</p>
            <p className="text-lg font-bold">
              {Math.round(
                filtered.reduce((a, b) => a + (b.edad || 0), 0) /
                  filtered.filter((p) => p.edad).length || 0
              ) || "—"}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center bg-black/50 border border-gray-800 rounded-lg py-3">
            <Weight className="w-6 h-6 text-brand-red mb-1" />
            <p className="text-xs text-gray-400 uppercase">Peso Promedio</p>
            <p className="text-lg font-bold">
              {Math.round(
                filtered.reduce((a, b) => a + (b.peso || 0), 0) /
                  filtered.filter((p) => p.peso).length || 0
              ) || "—"}
              kg
            </p>
          </div>
          <div className="flex flex-col items-center justify-center bg-black/50 border border-gray-800 rounded-lg py-3">
            <Ruler className="w-6 h-6 text-brand-blue mb-1" />
            <p className="text-xs text-gray-400 uppercase">Altura Promedio</p>
            <p className="text-lg font-bold">
              {(
                Math.round(
                  (filtered.reduce((a, b) => a + (b.estatura || 0), 0) /
                    filtered.filter((p) => p.estatura).length || 0) * 100
                ) / 100
              ).toFixed(2) || "—"}
              m
            </p>
          </div>
          <div className="flex flex-col items-center justify-center bg-black/50 border border-gray-800 rounded-lg py-3">
            <Activity className="w-6 h-6 text-purple-400 mb-1" />
            <p className="text-xs text-gray-400 uppercase">Con Experiencia</p>
            <p className="text-lg font-bold">
              {filtered.filter((p) => p.tiempoEntrenando).length}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
