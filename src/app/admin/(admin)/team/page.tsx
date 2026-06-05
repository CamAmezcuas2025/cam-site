"use client";

import { useEffect, useState, useRef } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2,
  Users,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import React from "react";

// Framer Motion <form> type fix
const MotionForm = motion.form as unknown as React.FC<
  React.HTMLAttributes<HTMLFormElement> &
    React.FormHTMLAttributes<HTMLFormElement> &
    import("framer-motion").MotionProps &
    React.RefAttributes<HTMLFormElement>
>;

// ============================================================================
// TYPES
// ============================================================================

interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string | null;
  description: string | null;
  image_url: string | null;
  icon_name: string;
  icon_color: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
}

interface TeamForm {
  name: string;
  role: string;
  specialty: string;
  description: string;
  image_url: string;
  icon_name: string;
  icon_color: string;
  display_order: number;
  is_published: boolean;
}

const ICON_OPTIONS = [
  { value: "MdOutlineSportsMma", label: "MMA" },
  { value: "GiBoxingGlove", label: "Boxeo" },
  { value: "GiKimono", label: "Jiu-Jitsu" },
  { value: "GiHighKick", label: "Karate / Kickboxing" },
  { value: "GiMeditation", label: "Yoga" },
  { value: "GiWhistle", label: "Entrenador / Kids" },
];

const COLOR_OPTIONS = [
  { value: "text-brand-red", label: "Rojo" },
  { value: "text-brand-blue", label: "Azul" },
  { value: "text-amber-500", label: "Ámbar" },
  { value: "text-purple-500", label: "Morado" },
  { value: "text-pink-500", label: "Rosa" },
  { value: "text-green-500", label: "Verde" },
];

const DEFAULT_FORM: TeamForm = {
  name: "",
  role: "",
  specialty: "",
  description: "",
  image_url: "",
  icon_name: "MdOutlineSportsMma",
  icon_color: "text-brand-red",
  display_order: 0,
  is_published: true,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminTeamPage() {
  const supabase = createClientSupabaseClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFetched = useRef(false);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TeamForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchMembers();
    }

    const channel = supabase
      .channel("team_members_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_members" },
        () => fetchMembers()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function fetchMembers() {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching team members:", error);
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  }

  // ============================================================================
  // IMAGE UPLOAD
  // ============================================================================

  async function handleImageUpload(file: File) {
    setUploading(true);
    setUploadProgress("Solicitando URL...");

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
      const fileName = `${Date.now()}-${safeName}`;

      const signRes = await fetch("/api/team/get-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, contentType: file.type }),
      });

      if (!signRes.ok) {
        throw new Error("Failed to get signed URL");
      }

      const { uploadUrl, publicUrl } = await signRes.json();

      setUploadProgress("Subiendo imagen...");

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "x-amz-acl": "public-read",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      setUploadProgress("Imagen subida");
      setForm((prev) => ({ ...prev, image_url: publicUrl }));
    } catch (err: any) {
      console.error("Image upload error:", err);
      alert("Error al subir imagen: " + err.message);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(""), 2000);
    }
  }

  // ============================================================================
  // CRUD ACTIONS
  // ============================================================================

  function openAddModal() {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      ...DEFAULT_FORM,
      display_order: members.length + 1,
    });
    setShowModal(true);
  }

  function openEditModal(member: TeamMember) {
    setIsEditing(true);
    setEditingId(member.id);
    setForm({
      name: member.name,
      role: member.role,
      specialty: member.specialty || "",
      description: member.description || "",
      image_url: member.image_url || "",
      icon_name: member.icon_name,
      icon_color: member.icon_color,
      display_order: member.display_order,
      is_published: member.is_published,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setUploadProgress("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      alert("Nombre y rol son requeridos.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        specialty: form.specialty.trim() || null,
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        icon_name: form.icon_name,
        icon_color: form.icon_color,
        display_order: form.display_order,
        is_published: form.is_published,
      };

      if (isEditing && editingId) {
        const { error } = await supabase
          .from("team_members")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("team_members")
          .insert([payload]);
        if (error) throw error;
      }

      await fetchMembers();
      closeModal();
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Error al guardar: " + (err.message || "Error desconocido"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar a "${name}" del equipo?`)) return;

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      alert("Error al eliminar.");
    } else {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  }

  async function togglePublished(member: TeamMember) {
    const { error } = await supabase
      .from("team_members")
      .update({ is_published: !member.is_published })
      .eq("id", member.id);

    if (error) {
      console.error("Toggle error:", error);
    } else {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, is_published: !m.is_published } : m
        )
      );
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-white">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        Cargando equipo...
      </div>
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
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-red flex items-center gap-2">
          <Users className="w-7 h-7 text-brand-blue" /> Equipo
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-brand-red to-brand-blue px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all shadow-glow w-full sm:w-auto justify-center"
        >
          <PlusCircle className="w-5 h-5" /> Agregar Miembro
        </button>
      </div>

      {/* Team Grid */}
      {members.length === 0 ? (
        <p className="text-gray-400 text-center py-12">
          No hay miembros del equipo. Agrega el primero.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative overflow-hidden bg-black/60 border rounded-xl p-5 shadow-glow transition-all duration-300 ${
                member.is_published
                  ? "border-gray-800 hover:border-brand-red"
                  : "border-yellow-800/50 opacity-70"
              }`}
            >
              {/* Published badge */}
              {!member.is_published && (
                <div className="absolute top-2 left-2 bg-yellow-600/80 text-xs px-2 py-0.5 rounded-full font-semibold">
                  Oculto
                </div>
              )}

              {/* Image */}
              <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 bg-gray-900">
                {member.image_url ? (
                  <Image
                    src={member.image_url}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600">
                    <Users className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Info */}
              <h3 className="text-lg font-heading text-white mb-1">
                {member.name}
              </h3>
              <p className="text-brand-blue text-sm font-semibold mb-1">
                {member.role}
              </p>
              {member.specialty && (
                <p className="text-gray-400 text-xs">{member.specialty}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Orden: {member.display_order}
              </p>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => togglePublished(member)}
                  className="text-yellow-400 hover:text-white transition p-1"
                  title={member.is_published ? "Ocultar" : "Publicar"}
                >
                  {member.is_published ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => openEditModal(member)}
                  className="text-brand-blue hover:text-white transition p-1"
                  title="Editar"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(member.id, member.name)}
                  className="text-brand-red hover:text-white transition p-1"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MotionForm
              onSubmit={handleSave}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/90 border border-gray-700 rounded-xl p-6 w-full max-w-lg space-y-4 shadow-glow relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-heading text-brand-blue text-center">
                {isEditing ? "Editar Miembro" : "Nuevo Miembro"}
              </h2>

              {/* Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-700 text-white outline-none focus:border-brand-blue"
                  placeholder="Nombre completo"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rol *</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-700 text-white outline-none focus:border-brand-blue"
                  placeholder="Ej: Instructor de Boxeo"
                />
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Especialidad</label>
                <input
                  type="text"
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-700 text-white outline-none focus:border-brand-blue"
                  placeholder="Ej: Boxeo Olímpico"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-700 text-white outline-none focus:border-brand-blue resize-none"
                  placeholder="Breve biografía..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Foto</label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? "Subiendo..." : "Subir Imagen"}
                  </button>
                  {uploadProgress && (
                    <span className="text-xs text-brand-blue">{uploadProgress}</span>
                  )}
                </div>
                {form.image_url && (
                  <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-700">
                    <Image
                      src={form.image_url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Icon & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ícono</label>
                  <select
                    value={form.icon_name}
                    onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-700 text-white outline-none"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Color</label>
                  <select
                    value={form.icon_color}
                    onChange={(e) => setForm({ ...form, icon_color: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-700 text-white outline-none"
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Orden de aparición</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-700 text-white outline-none focus:border-brand-blue"
                  min={0}
                />
              </div>

              {/* Published Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-700 bg-black/40 text-brand-blue focus:ring-2 focus:ring-brand-blue cursor-pointer"
                />
                <span className="text-sm text-gray-300">Publicado (visible en la página)</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-blue px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> {isEditing ? "Guardar Cambios" : "Agregar Miembro"}
                  </>
                )}
              </button>
            </MotionForm>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
