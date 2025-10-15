"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // 👈 import toast
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Profile = {
  fullName: string; // 👈 Aligned with schema: full_name
  email: string;
  avatar: string;
  birthDate: string;
  nationality: string;
  hasExperience: boolean;
  howFound: string;
  healthInfo: string;
  underage: boolean;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  joinDate?: string;
  nextPayment?: string;
  classes?: string[];
};

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [profile, setProfile] = useState<Profile>({
    fullName: "", // 👈 Aligned with schema
    email: "",
    avatar: "/images/default-avatar.png", // 👈 Matched schema default
    birthDate: "",
    nationality: "",
    hasExperience: false,
    howFound: "",
    healthInfo: "",
    underage: false,
    parentName: "",
    parentPhone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        // 👈 Map API response to match our type (adjust if your API already does this)
        setProfile((prev) => ({
          ...prev,
          fullName: data.full_name || data.name || "", // 👈 Handle potential API mapping
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
      // Type guard: Now TS knows target has 'checked' (input)
      const checked = (target as HTMLInputElement).checked;
      setProfile((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    } else {
      // Textarea: No checked
      setProfile((p) => ({ ...p, [name]: value }));
    }
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // 👈 Map back to schema keys for API (adjust if your API expects 'name')
    const payload = {
      ...profile,
      full_name: profile.fullName, // 👈 Ensure schema alignment
    };
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (!res.ok) {
      toast.error("Error al guardar perfil"); // 👈 toast error
      return;
    }

    toast.success("Perfil actualizado"); // 👈 toast success
    router.push("/profile?refresh=1"); // Moved inside: Triggers re-fetch on /profile
  }

  if (loading) return <p className="text-center text-gray-400 pt-28">Cargando…</p>;

  return (
    <section className="pt-28 pb-24 max-w-4xl mx-auto px-6">
      {/* Top bar with back button */}
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
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (file.size > 5 * 1024 * 1024) {
                toast.error("El archivo es demasiado grande (máx 5MB)");
                return;
              }

              // ✅ FIX: avoid nested destructuring that confuses JSX parser
              const { data } = await supabase.auth.getUser();
              const user = data?.user;
              if (!user) {
                toast.error("Debes iniciar sesión para cambiar tu avatar");
                return;
              }

              const fileExt = file.name.split(".").pop()?.toLowerCase() || "png"; // 👈 Dynamic ext, fallback png
              const filePath = `${user.id}/avatar.${fileExt}`; // 👈 Fixed path for overwrite (no timestamp)

              const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, {
                  cacheControl: "3600", // 👈 1hr cache
                  upsert: true, // 👈 Ensures replacement of existing file
                });

              if (uploadError) {
                console.error(uploadError);
                toast.error("Error al subir el avatar");
                return;
              }

              // Get public URL for the uploaded file (now the replaced one)
              const { data: pub } = supabase.storage.from("avatars").getPublicUrl(filePath);
              const publicUrl = pub.publicUrl;

              // Update the profile immediately so it reflects on screen
              setProfile((prev) => ({ ...prev, avatar: publicUrl }));

              // Optionally save this avatar URL to your profiles table
              const { error: dbError } = await supabase
                .from("profiles")
                .update({ avatar: publicUrl }) // 👈 Storing full URL (works with your setup)
                .eq("id", user.id);

              if (dbError) {
                console.error(dbError);
                toast.error("Error al guardar el avatar en la base de datos");
              } else {
                toast.success("Avatar actualizado");
              }
            }}
            className="text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-brand-red"
          />

          <input
            type="text"
            name="fullName" // 👈 Aligned with type/schema
            value={profile.fullName}
            onChange={handleChange}
            placeholder="Nombre del alumno"
            className="w-full md:w-2/3 bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
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
            placeholder="correo@ejemplo.com"
            className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
            required
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
            required
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

        {/* Underage Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="underage"
            checked={profile.underage}
            onChange={handleChange}
            className="w-5 h-5 accent-brand-red"
          />
          <label className="text-gray-300">¿Es menor de edad?</label>
        </div>

        {/* Parent Info - only if underage */}
        {profile.underage && (
          <>
            <div>
              <label className="block text-gray-300 mb-1">
                Nombre del padre/madre
              </label>
              <input
                type="text"
                name="parentName"
                value={profile.parentName || ""} // 👈 Handle optional
                onChange={handleChange}
                placeholder="Nombre del padre/madre"
                className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">
                Teléfono padre/madre
              </label>
              <input
                type="text"
                name="parentPhone"
                value={profile.parentPhone || ""} // 👈 Handle optional
                onChange={handleChange}
                placeholder="664 000 0000"
                className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Dirección</label>
              <input
                type="text"
                name="address"
                value={profile.address || ""} // 👈 Handle optional
                onChange={handleChange}
                placeholder="Calle, Colonia, Ciudad"
                className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none"
              />
            </div>
          </>
        )}

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

        {/* Bottom Back Button */}
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
