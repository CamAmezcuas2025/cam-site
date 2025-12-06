"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Profile = {
  fullName: string;
  email: string;
  avatar: string;
  birthDate: string;
  nationality: string;
  hasExperience: boolean;
  howFound: string;
  healthInfo: string;
  address?: string;
  joinDate?: string;
  nextPayment?: string;
  classes?: string[];
  edad?: string;
  estatura?: string;
  peso?: string;
  tiempoEntrenando?: string;
  phone?: string; // ✅ added
};

export default function EditProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    fullName: "",
    email: "",
    avatar: "/images/avatar.jpeg",
    birthDate: "",
    nationality: "",
    hasExperience: false,
    howFound: "",
    healthInfo: "",
    address: "",
    edad: "",
    estatura: "",
    peso: "",
    tiempoEntrenando: "",
    phone: "", // ✅ added
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => ({
          ...prev,
          fullName: data.full_name || data.name || "",
          edad: data.edad || "",
          estatura: data.estatura || "",
          peso: data.peso || "",
          tiempoEntrenando: data.tiempoEntrenando || "",
          phone: data.phone || "", // ✅ added
          ...data,
        }));
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;

    if ("checked" in target) {
      const checked = (target as HTMLInputElement).checked;
      setProfile((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    } else {
      setProfile((p) => ({ ...p, [name]: value }));
    }
  };

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo es demasiado grande (máx 5MB)");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Error al subir el avatar");
      return;
    }

    const { avatarUrl } = await res.json();
    setProfile((prev) => ({ ...prev, avatar: avatarUrl }));
    toast.success("Avatar actualizado");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...profile,
      full_name: profile.fullName,
      edad: profile.edad,
      estatura: profile.estatura,
      peso: profile.peso,
      tiempoEntrenando: profile.tiempoEntrenando,
      phone: profile.phone, // ✅ added
    };

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (!res.ok) {
      toast.error("Error al guardar perfil");
      return;
    }

    toast.success("Perfil actualizado");
    router.push("/profile?refresh=1");
  }

  if (loading)
    return <p className="text-center text-gray-400 pt-28">Cargando…</p>;

  return (
    <section className="pt-28 pb-24 max-w-4xl mx-auto px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-4xl md:text-5xl text-brand-red">
          Editar Perfil
        </h1>
        <Link
          href="/profile"
          className="px-4 py-2 rounded-lg bg-brand-blue text-white hover:bg-brand-red transition-colors"
        >
          ← Volver al Perfil
        </Link>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-black/60 border border-gray-800 rounded-2xl shadow-lg p-8 space-y-6"
      >
        {/* Avatar + Name */}
        <div className="flex flex-col items-center space-y-4">
          <img
            src={profile.avatar}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-brand-red object-cover"
          />
          <div className="w-full flex justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-brand-red"
            />
          </div>

          <input
            type="text"
            name="fullName"
            value={profile.fullName}
            onChange={handleChange}
            placeholder="Nombre completo"
            className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-300 mb-1">Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
            required
          />
        </div>

        {/* ✅ Phone */}
        <div>
          <label className="block text-gray-300 mb-1">Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={profile.phone || ""}
            onChange={handleChange}
            placeholder="(55) 1234-5678"
            className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
          />
        </div>

        {/* Birthdate */}
        <div>
          <label className="block text-gray-300 mb-1">Fecha de Nacimiento</label>
          <input
            type="date"
            name="birthDate"
            value={profile.birthDate}
            onChange={handleChange}
            className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
          />
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-gray-300 mb-1">Nacionalidad</label>
          <input
            type="text"
            name="nationality"
            value={profile.nationality}
            onChange={handleChange}
            placeholder="Mexicana"
            className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
          />
        </div>

        {/* Experience */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="hasExperience"
            checked={profile.hasExperience}
            onChange={handleChange}
            className="w-5 h-5 accent-brand-red"
          />
          <label className="text-gray-300">¿Tienes experiencia previa?</label>
        </div>

        {/* How found */}
        <div>
          <label className="block text-gray-300 mb-1">¿Cómo nos conociste?</label>
          <input
            type="text"
            name="howFound"
            value={profile.howFound}
            onChange={handleChange}
            placeholder="Por un amigo, redes sociales..."
            className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
          />
        </div>

        {/* Health Info */}
        <div>
          <label className="block text-gray-300 mb-1">
            Información de salud / discapacidad
          </label>
          <textarea
            name="healthInfo"
            value={profile.healthInfo}
            onChange={handleChange}
            placeholder="Detalla cualquier información importante..."
            className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
          />
        </div>

        {/* Metrics */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-1">Edad</label>
            <input
              type="number"
              name="edad"
              value={profile.edad || ""}
              onChange={handleChange}
              className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Estatura (cm)</label>
            <input
              type="number"
              name="estatura"
              value={profile.estatura || ""}
              onChange={handleChange}
              className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Peso (kg)</label>
            <input
              type="number"
              name="peso"
              step="0.1"
              value={profile.peso || ""}
              onChange={handleChange}
              className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Tiempo entrenando</label>
            <input
              type="text"
              name="tiempoEntrenando"
              value={profile.tiempoEntrenando || ""}
              onChange={handleChange}
              placeholder="2 años"
              className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
            />
          </div>
        </div>

        {/* Save */}
        <div className="text-center">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-red text-white rounded-lg font-heading text-lg hover:bg-brand-blue transition"
          >
            {saving ? "Guardando..." : "Guardar Perfil"}
          </button>
        </div>

        <div className="text-center mt-3">
          <Link
            href="/profile"
            className="inline-block px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            Volver
          </Link>
        </div>
      </form>
    </section>
  );
}
