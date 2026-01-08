"use client";
export const dynamic = "force-dynamic";
import Link from 'next/link';

import { Suspense, useEffect, useMemo, useState } from "react";
import {
  FiMail,
  FiMapPin,
  FiCalendar,
  FiAward,
  FiTrendingUp,
  FiActivity,
  FiCreditCard,
  FiUsers,
  FiFileText,
  FiEdit,
  FiUploadCloud,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";

/* ---------- tiny UI helpers ---------- */
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={[
        "relative rounded-2xl border border-gray-800 bg-black/60",
        "shadow-[0_0_40px_rgba(255,0,0,0.18),inset_0_0_80px_rgba(0,102,255,0.12)]",
        "backdrop-blur-2xl",
        className,
      ].join(" ")}
    >
      {children}
    </motion.div>
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      whileHover={{ scale: 1.05, y: -2 }}
      className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-red/25 via-brand-blue/15 to-brand-red/25 border border-white/20 text-gray-200 font-medium shadow-[0_0_10px_rgba(255,0,0,0.35)] backdrop-blur-sm inline-flex items-center gap-1"
    >
      {children}
    </motion.span>
  );
}
function getClassEmoji(className: string) {
  const map: Record<string, string> = {
    Boxeo: "🥊",
    "Jiu Jitsu": "🤼‍♀️",
    MMA: "🤼‍♂️",
    Kickboxing: "👊",
    Yoga: "🧘",
    "Lima Lama": "🥋",
    "Karate Kids": "🥋",
  };
  return map[className] || "🏋️";
}
function ProgressBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = Math.min(100, (value / (max || 1)) * 100);
  return (
    <div className="group">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="relative w-full h-2 rounded-full overflow-hidden bg-gray-900/80 ring-1 ring-gray-800 shadow-[0_0_12px_rgba(0,0,0,0.35),inset_0_0_20px_rgba(0,102,255,0.18)]">
        <motion.div
          className="h-2 bg-gradient-to-r from-brand-red via-brand-blue to-brand-red shadow-[0_0_14px_rgba(255,0,0,0.55)]"
          animate={{ backgroundPositionX: ["0%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ width: `${pct}%`, backgroundSize: "200% 100%" }}
        />
      </div>
    </div>
  );
}

/* ---------- types ---------- */
type Training = {
  streak: number;
  totalHours: number;
  weeklyHours: number;
  monthlyHours: number;
};
type Child = {
  id: string;
  full_name: string;
  birthDate?: string;
  avatar?: string;
  edad?: number;
  estatura?: number;
  peso?: number;
  tiempoEntrenando?: string;
  belt_level?: string;
  classes?: string[];
  student_notes: string;
  admin_notes?: string;
  created_at: string;
  streak: number;
  training: Training;
};
type Profile = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  address?: string;
  joinDate?: string;
  nextPayment?: string;
  belt_level?: string;
  student_notes?: string;
  admin_notes?: string;
  training?: Training;
  classes?: string[];
  children?: Child[];
  isParent?: boolean;
  membershipName?: string;
  membershipType?: string;
};

/* ---------- page ---------- */
function ProfilePageContent() {
  const supabase = createClientSupabaseClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authChecked, setAuthChecked] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [activeTab, setActiveTab] = useState<"progreso" | "hijos" | "notas">(
    "progreso"
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [deletingChildId, setDeletingChildId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const beltOptions = useMemo(
    () => ["Blanca", "Amarilla", "Naranja", "Verde", "Azul", "Morada", "Marrón", "Negra"],
    []
  );

  const availableClasses = useMemo(
    () => ["Boxeo", "Karate Kids", "Jiu Jitsu", "MMA", "Kickboxing", "Yoga", "Lima Lama"],
    []
  );

  /* ----- auth ----- */
  useEffect(() => {
    let mounted = true;
    async function verifySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) router.replace("/login");
      else setAuthChecked(true);
      setSessionLoading(false);
    }
    verifySession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_ev, s) => {
      if (!s) router.replace("/login");
      else setAuthChecked(true);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  /* ----- profile fetch ----- */
  useEffect(() => {
    if (!authChecked) return;
    let cancelled = false;
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`GET /api/profile ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          // Deduplicate children by id to prevent key conflicts
          const dedupedChildren = data.children
            ? Array.from(new Map(data.children.map((child: Child) => [child.id, child])).values())
            : [];
          setProfile({ ...data, children: dedupedChildren });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    }
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [authChecked, searchParams.toString()]);

  /* ----- delete child ----- */
  async function handleDeleteChild(childId: string) {
    if (!confirm("¿Estás seguro de eliminar este hijo? Esta acción no se puede deshacer.")) {
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/children?childId=${childId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar");
      }

      // Refresh profile
      const p = await fetch("/api/profile");
      if (p.ok) setProfile(await p.json());
      
      alert("✅ Hijo eliminado exitosamente");
    } catch (e: any) {
      alert(e.message || "Error al eliminar");
    } finally {
      setUpdating(false);
      setDeletingChildId(null);
    }
  }

  /* ----- add child ----- */
  async function handleAddChild(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUpdating(true);
    const fd = new FormData(e.currentTarget);
    const classesRaw = Array.from(fd.getAll("classes") as string[]).filter(Boolean);
    const payload = {
      full_name: (fd.get("full_name") as string)?.trim(),
      edad: Number(fd.get("edad")) || null,
      estatura: Number(fd.get("estatura")) || null,
      peso: Number(fd.get("peso")) || null,
      tiempoEntrenando: (fd.get("tiempoEntrenando") as string) || null,
      belt_level: (fd.get("belt_level") as string) || null,
      birthDate: fd.get("birthDate") ? (fd.get("birthDate") as string) : null,
      classes: classesRaw.length > 0 ? classesRaw : [],
      student_notes: null,
    };
    console.log("Payload being sent:", payload);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) throw new Error("Sesión expirada");

      const { data: childRow, error: cpErr } = await supabase
        .from("child_profiles")
        .insert([payload])
        .select("id")
        .single();
      if (cpErr) {
        console.error("Insert error details:", cpErr);
        throw new Error(cpErr.message || "Error en la base de datos");
      }

      const { error: linkErr } = await supabase
        .from("children")
        .insert([{ parent_id: user.id, child_id: childRow!.id }]);
      if (linkErr) {
        console.error("Link error details:", linkErr);
        throw new Error(linkErr.message || "Error enlazando al padre");
      }

      setIsAddModalOpen(false);
      const p = await fetch("/api/profile");
      if (p.ok) setProfile(await p.json());
      alert("Hijo agregado exitosamente!");
    } catch (err: any) {
      console.error("Full add child error:", err);
      alert("Error al agregar hijo: " + (err.message || "Intenta de nuevo"));
    } finally {
      setUpdating(false);
    }
  }

  /* ----- edit child save (PUT /api/children) ----- */
  async function handleUpdateChild(childId: string) {
    const form = document.getElementById("childForm") as HTMLFormElement | null;
    if (!form) return alert("Formulario no encontrado");
    const fd = new FormData(form);
    const data: any = {};
    for (const [key, val] of fd.entries()) {
      if (key === "avatar" || key === "classes") continue;
      const v = (val as string).trim();
      if (v === "") continue;
      if (["edad", "estatura", "peso"].includes(key)) data[key] = Number(v);
      else data[key] = v;
    }

    data.classes = Array.from(fd.getAll("classes") as string[]).filter(Boolean);

    setUpdating(true);
    try {
      const avatarFile = fd.get("avatar") as File | null;
      if (avatarFile && avatarFile.size > 0) {
        await handleUploadAvatar(childId, avatarFile);
      }

      const res = await fetch(`/api/children?childId=${childId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("No se pudo actualizar");

      const p = await fetch("/api/profile");
      if (p.ok) setProfile(await p.json());
      setEditingChildId(null);
    } catch (e: any) {
      alert(e.message || "Error al actualizar");
    } finally {
      setUpdating(false);
    }
  }

/* ----- child avatar upload (quick button on card) ----- */
async function handleUploadAvatar(childId: string, file: File) {
  try {
    setUploading(childId);
    // Ensure path: childId/filename (UUID prefix for RLS)
    const fileName = `${childId}/avatar-${Date.now()}.png`;
    console.log('Uploading to path:', fileName);

    // Resize/convert to PNG if needed (optional, for consistency)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = async () => {
      canvas.width = 200;  // Resize to thumbnail
      canvas.height = 200;
      ctx?.drawImage(img, 0, 0, 200, 200);
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Blob creation failed');

        const { error } = await supabase.storage
          .from('child_avatars')
          .upload(fileName, blob, { upsert: true, contentType: 'image/png' });
        if (error) throw new Error(error.message || "Upload failed");

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('child_avatars')
          .getPublicUrl(fileName);
        const url = publicUrl;
        console.log('Generated URL:', url);

        if (!url) throw new Error('Public URL not generated—check bucket public status');

        // Save URL to child profile
        const saveRes = await fetch(`/api/children?childId=${childId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: url }),
        });
        if (!saveRes.ok) throw new Error("Avatar save failed");

        const p = await fetch("/api/profile");
        if (p.ok) setProfile(await p.json());
        alert('Avatar subido exitosamente!');
      }, 'image/png');
    };
    img.src = URL.createObjectURL(file);

  } catch (e: any) {
    console.error('Upload error:', e);
    alert(e.message || "No se pudo subir el avatar");
  } finally {
    setUploading(null);
  }
}

  /* ----- per-child: class hours log ----- */
  async function handleLogHours(childId: string) {
    const classSel = (document.getElementById(
      `class-${childId}`
    ) as HTMLSelectElement)?.value;
    const hrs = parseFloat(
      (document.getElementById(`hours-${childId}`) as HTMLInputElement)?.value
    );
    if (!classSel || isNaN(hrs) || hrs <= 0) {
      alert("Selecciona una clase y horas válidas");
      return;
    }
    const res = await fetch("/api/log-hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        className: classSel,
        date: new Date().toISOString(),
        hours: hrs,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Log hours error:", err);
      alert("Error al registrar horas");
      return;
    }

    alert("Horas registradas ✅");
  }

  /* ----- guards ----- */
  if (sessionLoading) return null;
  if (!authChecked)
    return <p className="text-center text-gray-400 pt-32">Verificando sesión...</p>;
  if (!profile)
    return <p className="text-center text-gray-400 pt-32">Cargando perfil...</p>;

  const beltEligible = (profile.classes || []).some((cls) =>
    ["Jiu Jitsu", "MMA", "Lima Lama", "Karate", "Karate Kids"].includes(cls)
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="pt-24 pb-24 px-4 md:px-8 text-white max-w-6xl mx-auto"
    >
      {/* HEADER with animated conic gradient overlay */}
      <GlassCard className="p-6 md:p-8 relative overflow-hidden mb-10 shadow-[0_0_80px_rgba(255,0,0,0.18),0_0_80px_rgba(0,102,255,0.18)]">
        <div className="absolute inset-0 opacity-[.40] bg-[conic-gradient(from_0deg,rgba(255,0,0,.28),rgba(0,102,255,.24),rgba(255,0,0,.28))] animate-[spin_20s_linear_infinite]" />
        <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-center">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="relative w-32 h-32 shrink-0"
          >
            <div className="absolute inset-0 rounded-full animate-[spin_10s_linear_infinite] bg-[conic-gradient(from_0deg,#ff2a2a,#1e40ff,#ff2a2a)] blur-[4px]" />
            <img
              src={profile.avatar || "/images/default-avatar.png"}
              alt="avatar"
              className="w-32 h-32 rounded-full border-[6px] border-black object-cover relative z-10"
            />
            {profile.isParent && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-30">
                <span className="inline-block whitespace-nowrap px-3 py-1 text-[11px] font-semibold text-white bg-gradient-to-r from-brand-red to-brand-blue border border-white/20 shadow-[0_0_30px_rgba(255,0,0,0.65)] rounded-full backdrop-blur-md leading-none">
                  Cuenta Padre/Madre
                </span>
              </div>
            )}
          </motion.div>

          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase drop-shadow-[0_0_12px_rgba(255,0,0,0.45)]">
              {profile.name}
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-2 justify-center text-gray-300 text-sm">
              <span className="flex items-center gap-1">
                <FiMail /> {profile.email}
              </span>
              <span className="hidden md:inline text-gray-500">•</span>
              <span className="flex items-center gap-1">
                <FiMapPin /> {profile.address || "Sin dirección"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center text-xs mt-2">
              <Badge>
                <FiCalendar /> Inicio: {profile.joinDate || "—"}
              </Badge>
              <Badge>
                <FiCreditCard /> Pago: {profile.nextPayment || "—"}
              </Badge>

              {profile.membershipName && (
                <Badge>
                  <FiCreditCard />
                  {profile.membershipType ? `${profile.membershipType} · ` : ""}
                  {profile.membershipName}
                </Badge>
              )}

              {beltEligible && profile.belt_level && (
                <Badge>
                  <FiAward /> Cinta: {profile.belt_level}
                </Badge>
              )}
            </div>
          </div>

        </div>
      </GlassCard>

      {/* TABS */}
      <div className="flex justify-center gap-3 mb-8">
        {[
          { key: "progreso", label: "Progreso", icon: <FiActivity /> },
          { key: "hijos", label: "Hijos", icon: <FiUsers /> },
          { key: "notas", label: "Notas", icon: <FiFileText /> },
        ].map((t) => (
          <motion.button
            key={t.key}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(t.key as any)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold border transition shadow-[0_0_10px_rgba(0,0,0,0.4)]
              ${
                activeTab === t.key
                  ? "bg-gradient-to-r from-brand-red to-brand-blue text-white border-transparent shadow-[0_0_26px_rgba(255,0,0,0.45)]"
                  : "bg-black/40 text-gray-400 hover:text-white border border-gray-700"
              }`}
          >
            {t.icon}
            {t.label}
          </motion.button>
        ))}
      </div>

      {/* PROGRESO */}
      {activeTab === "progreso" && (
        <GlassCard className="p-6 md:p-8 shadow-[0_0_40px_rgba(0,102,255,0.22)]">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold mb-6 uppercase tracking-wider text-gray-200"
          >
            Progreso General
          </motion.h3>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <ProgressBar
              label="Horas Semanales"
              value={profile.training?.weeklyHours || 0}
              max={10}
            />
            <ProgressBar
              label="Horas Mensuales"
              value={profile.training?.monthlyHours || 0}
              max={40}
            />
            <ProgressBar
              label="Horas Totales"
              value={profile.training?.totalHours || 0}
              max={200}
            />
          </motion.div>

          <div className="text-center md:text-left mt-6 text-gray-300">
            <FiTrendingUp className="inline text-orange-400 mr-2" />
            Racha:{" "}
            <strong className="text-white">
              {profile.training?.streak || 0}
            </strong>{" "}
            días
          </div>

          {(profile.classes || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex flex-wrap gap-2"
            >
              {profile.classes!.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1 rounded-full bg-brand-red/20 text-brand-red border border-brand-red/30 text-sm shadow-[0_0_10px_rgba(255,0,0,0.25)]"
                >
                  {getClassEmoji(c)} {c}
                </span>
              ))}
            </motion.div>
          )}
        </GlassCard>
      )}

      {/* HIJOS */}
      {activeTab === "hijos" && (
        <GlassCard className="p-6 md:p-8 shadow-[0_0_40px_rgba(255,0,0,0.18)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold uppercase tracking-wider text-gray-200">
              Mis Hijos
            </h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-red to-brand-blue font-semibold hover:opacity-90 transition"
            >
              Agregar Hijo
            </button>
          </div>
          {(profile.children || []).length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="mx-auto text-4xl text-gray-500 mb-4" />
              <p className="text-gray-400 mb-4">No hay hijos agregados.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.children!.map((child) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28 }}
                >
                  <GlassCard className="p-5 shadow-[0_0_24px_rgba(0,102,255,0.22)]">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full animate-[spin_12s_linear_infinite] bg-[conic-gradient(from_0deg,#ff2a2a,#1e40ff,#ff2a2a)] blur-[2px]" />
                        <img
                          src={child.avatar || "/images/avatar.jpeg"}
                          alt={child.full_name}
                          className="w-16 h-16 rounded-full border-4 border-black object-cover relative z-10"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-lg font-semibold">
                            {child.full_name}
                          </h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingChildId(child.id)}
                              className="p-2 rounded-full bg-black/40 border border-gray-700 text-gray-300 hover:text-white"
                              title="Editar"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteChild(child.id)}
                              disabled={updating}
                              className="p-2 rounded-full bg-red-900/40 border border-red-700 text-red-400 hover:text-red-300 hover:bg-red-900/60 disabled:opacity-50"
                              title="Eliminar"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          Creado:{" "}
                          {new Date(child.created_at).toLocaleDateString(
                            "es-MX"
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick avatar upload */}
                    <div className="mt-4">
                      <label className="text-xs text-gray-400 mb-1 block">
                        Actualizar foto
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id={`file-${child.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) await handleUploadAvatar(child.id, file);
                          }}
                        />
                        <label
                          htmlFor={`file-${child.id}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-700 bg-black/50 hover:bg-black/60 cursor-pointer text-sm"
                        >
                          <FiUploadCloud />
                          {uploading === child.id ? "Subiendo..." : "Subir Avatar"}
                        </label>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <Badge>Edad: {child.edad ?? "—"}</Badge>
                      <Badge>Estatura: {child.estatura ?? "—"} cm</Badge>
                      <Badge>Peso: {child.peso ?? "—"} kg</Badge>
                      <Badge>Cinta: {child.belt_level || "—"}</Badge>
                    </div>

                    {/* Progress */}
                    <div className="mt-4 space-y-3">
                      <ProgressBar
                        label="Horas semanales"
                        value={child.training?.weeklyHours || 0}
                        max={10}
                      />
                      <ProgressBar
                        label="Horas mensuales"
                        value={child.training?.monthlyHours || 0}
                        max={40}
                      />
                      <ProgressBar
                        label="Horas totales"
                        value={child.training?.totalHours || 0}
                        max={200}
                      />
                      <div className="text-sm text-gray-300">
                        <FiTrendingUp className="inline text-orange-400 mr-1" />
                        Racha:{" "}
                        <strong className="text-white">
                          {child.streak || 0}
                        </strong>{" "}
                        días
                      </div>
                    </div>

                    {/* Class badges */}
                    {!!child.classes?.length && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {child.classes!.map((c) => (
                          <span
                            key={c}
                            className="px-3 py-1 rounded-full bg-brand-red/20 text-brand-red border border-brand-red/30 text-xs shadow-[0_0_10px_rgba(255,0,0,0.25)]"
                          >
                            {getClassEmoji(c)} {c}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Log hours */}
                    <div className="mt-5 p-3 rounded-lg bg-black/40 border border-gray-700 shadow-[0_0_16px_rgba(0,102,255,0.18)]">
                      <h5 className="text-sm font-semibold mb-2 text-gray-300">
                        Registrar horas
                      </h5>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          id={`class-${child.id}`}
                          className="flex-1 bg-black/50 border border-gray-700 text-white rounded px-2 py-1 text-sm"
                        >
                          <option value="">Seleccionar clase</option>
                          {availableClasses.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                        <input
                          id={`hours-${child.id}`}
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="Horas"
                          className="w-24 bg-black/50 border border-gray-700 text-white rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => handleLogHours(child.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-brand-blue to-brand-red rounded text-sm font-semibold hover:opacity-90 transition"
                        >
                          Registrar
                        </button>
                      </div>
                    </div>

                    {/* Admin notes for child */}
                    {child.admin_notes && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-5 p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/40 relative overflow-hidden shadow-[0_0_16px_rgba(255,193,7,0.18)]"
                      >
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600 blur-[2px]" />
                        <div className="flex items-start gap-2 mt-2">
                          <FiAlertCircle className="text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="text-sm font-semibold mb-1 text-yellow-300">
                              Notas del entrenador
                            </h5>
                            <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                              {child.admin_notes}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Student notes (read-only) */}
                    {child.student_notes && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-5 p-3 rounded-lg bg-black/40 border border-gray-700 relative overflow-hidden shadow-[0_0_16px_rgba(255,0,0,0.18)]"
                      >
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-red via-brand-blue to-brand-red blur-[2px]" />
                        <h5 className="text-sm font-semibold mb-2 text-gray-300 mt-2">
                          Notas del alumno
                        </h5>
                        <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                          {child.student_notes}
                        </p>
                      </motion.div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </GlassCard>
      )}

      {/* NOTAS (profile-level) */}
      {activeTab === "notas" && (
        <GlassCard className="p-6 md:p-8 shadow-[0_0_40px_rgba(0,102,255,0.18)]">
          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold mb-6 uppercase tracking-wider"
          >
            Mis Notas
          </motion.h3>

          {/* Admin notes */}
          {profile.admin_notes && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-yellow-900/20 border border-yellow-700/40 shadow-[0_0_20px_rgba(255,193,7,0.22)]"
            >
              <div className="flex items-start gap-3">
                <FiAlertCircle className="text-yellow-400 text-xl mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-yellow-300">
                    Notas del entrenador
                  </h4>
                  <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {profile.admin_notes}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Student notes */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-lg bg-black/40 border border-gray-700 shadow-[0_0_20px_rgba(0,102,255,0.18)]"
          >
            <div className="flex items-start gap-3">
              <FiFileText className="text-brand-blue text-xl mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-semibold mb-2 text-gray-200">
                  Notas del estudiante
                </h4>
                <p className="text-gray-400">
                  {profile.student_notes || "Sin notas registradas"}
                </p>
              </div>
            </div>
          </motion.div>

          {!profile.admin_notes && !profile.student_notes && (
            <div className="text-center py-8 text-gray-500">
              <FiFileText className="mx-auto text-4xl mb-3 opacity-40" />
              <p>No hay notas disponibles</p>
            </div>
          )}
        </GlassCard>
      )}

      {/* ADD CHILD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-md p-6">
            <h3 className="text-xl font-heading text-white mb-4">Agregar Hijo</h3>
            <form onSubmit={handleAddChild} className="space-y-4">
              <input
                name="full_name"
                placeholder="Nombre completo"
                required
                className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
              />
              <input
                name="birthDate"
                type="date"
                className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  name="edad"
                  type="number"
                  placeholder="Edad"
                  className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
                />
                <input
                  name="estatura"
                  type="number"
                  placeholder="Estatura (cm)"
                  className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
                />
                <input
                  name="peso"
                  type="number"
                  placeholder="Peso (kg)"
                  className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
                />
              </div>
              <input
                name="tiempoEntrenando"
                placeholder="Tiempo entrenando"
                className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
              />
              <select
                name="belt_level"
                className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
              >
                <option value="">Seleccionar cinta</option>
                {beltOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Clases</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableClasses.map((cls) => (
                    <label key={cls} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="classes"
                        value={cls}
                        className="rounded border-gray-600 text-brand-red focus:ring-brand-blue"
                      />
                      <span className="text-gray-300">{cls}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={updating}
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-brand-red to-brand-blue text-white rounded p-2 hover:opacity-90 transition"
                >
                  {updating ? "Guardando..." : "Agregar Hijo"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-gray-700 text-white rounded p-2 hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* EDIT CHILD MODAL */}
      {editingChildId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-md p-6">
            <h3 className="text-xl font-heading text-white mb-4">Editar Alumno</h3>
            <form id="childForm" className="space-y-4">
              <input
                name="full_name"
                placeholder="Nombre completo"
                defaultValue={
                  profile.children?.find((c) => c.id === editingChildId)?.full_name ||
                  ""
                }
                className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
              />
              <input
                name="birthDate"
                type="date"
                defaultValue={
                  profile.children?.find((c) => c.id === editingChildId)?.birthDate || ""
                }
                className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  name="edad"
                  type="number"
                  placeholder="Edad"
                  defaultValue={
                    profile.children?.find((c) => c.id === editingChildId)?.edad || ""
                  }
                  className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
                />
                <input
                  name="estatura"
                  type="number"
                  placeholder="Estatura (cm)"
                  defaultValue={
                    profile.children?.find((c) => c.id === editingChildId)?.estatura || ""
                  }
                  className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
                />
                <input
                  name="peso"
                  type="number"
                  placeholder="Peso (kg)"
                  defaultValue={
                    profile.children?.find((c) => c.id === editingChildId)?.peso || ""
                  }
                  className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
                />
              </div>
              <input
                name="tiempoEntrenando"
                placeholder="Tiempo entrenando"
                defaultValue={
                  profile.children?.find((c) => c.id === editingChildId)?.tiempoEntrenando ||
                  ""
                }
                className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
              />
              <select
                name="belt_level"
                className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
                defaultValue={
                  profile.children?.find((c) => c.id === editingChildId)?.belt_level || ""
                }
              >
                <option value="">Seleccionar cinta</option>
                {beltOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Clases</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableClasses.map((cls) => {
                    const child = profile.children?.find((c) => c.id === editingChildId);
                    return (
                      <label key={cls} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="classes"
                          value={cls}
                          defaultChecked={child?.classes?.includes(cls) || false}
                          className="rounded border-gray-600 text-brand-red focus:ring-brand-blue"
                        />
                        <span className="text-gray-300">{cls}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Avatar (opcional)
                </label>
                <input
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-red file:text-white hover:file:bg-brand-blue"
                />
                {profile.children?.find((c) => c.id === editingChildId)?.avatar && (
                  <img
                    src={
                      profile.children?.find((c) => c.id === editingChildId)?.avatar
                    }
                    alt="actual"
                    className="w-14 h-14 rounded-full mt-2 object-cover border border-gray-700"
                  />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateChild(editingChildId)}
                  className="flex-1 bg-gradient-to-r from-brand-red to-brand-blue text-white rounded p-2 hover:opacity-90 transition"
                >
                  {updating ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingChildId(null)}
                  className="flex-1 bg-gray-700 text-white rounded p-2 hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </motion.section>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<p className="text-gray-400 pt-32 text-center">Cargando perfil...</p>}>
      <ProfilePageContent />
    </Suspense>
  );
}