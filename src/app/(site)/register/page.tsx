"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "loading" | "success" | "error";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    avatar: "/images/avatar.jpeg",
    birthDate: "",
    nationality: "",
    hasExperience: false,
    howFound: "",
    healthInfo: "",
    address: "",
    isMinor: false,
    parentName: "",
    parentPhone: "",
    classes: [] as string[],
    membershipType: "Mensual", // ✅ Default plan
    joinDate: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [hp, setHp] = useState("");
  const router = useRouter();

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      const checked = target.checked;
      if (name === "isMinor") {
        setForm({ ...form, [name]: checked });
      } else if (name.startsWith("class-")) {
        const className = name.replace("class-", "");
        setForm((prev) => ({
          ...prev,
          classes: checked
            ? [...prev.classes, className]
            : prev.classes.filter((c) => c !== className),
        }));
      } else {
        setForm({ ...form, [name]: checked });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    if (hp.trim() !== "") {
      setStatus("success");
      return;
    }

    try {
      // ✅ Send full form (including membershipType)
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          avatar: form.avatar,
          birthDate: form.birthDate,
          nationality: form.nationality,
          hasExperience: form.hasExperience,
          howFound: form.howFound,
          healthInfo: form.healthInfo,
          address: form.address,
          isMinor: form.isMinor,
          parentName: form.isMinor ? form.parentName : null,
          parentPhone: form.isMinor ? form.parentPhone : null,
          classes: form.classes,
          membershipType: form.membershipType, // ✅ sends plan selection
          joinDate: form.joinDate,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || j?.message || "No se pudo registrar.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({
        name: "",
        email: "",
        password: "",
        avatar: "/images/avatar.jpeg",
        birthDate: "",
        nationality: "",
        hasExperience: false,
        howFound: "",
        healthInfo: "",
        address: "",
        isMinor: false,
        parentName: "",
        parentPhone: "",
        classes: [],
        membershipType: "Mensual",
        joinDate: "",
      });

      // ✅ Redirect to profile after brief success message
      setTimeout(() => router.push("/profile"), 1200);
    } catch (err) {
      console.error(err);
      setError("Error de red o base de datos.");
      setStatus("error");
    }
  }

  return (
    <section className="pt-28 md:pt-36 pb-24 max-w-lg mx-auto px-6">
      <h1 className="font-heading text-5xl text-brand-red mb-2 text-center">
        Registro
      </h1>
      <p className="text-gray-300 mb-6 text-center">
        Aquí empieza tu entrenamiento
      </p>

      {status === "success" && (
        <p className="mb-4 text-emerald-400 text-center">
          ✅ Perfil creado, redirigiendo…
        </p>
      )}
      {status === "error" && (
        <p className="mb-4 text-red-400 text-center">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5">
        {/* hidden anti-bot */}
        <input
          type="text"
          name="company"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {/* Basic info */}
        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Nombre</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Juan Pérez"
            required
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Correo</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            required
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Contraseña</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••"
            required
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          />
        </label>

        {/* DOB + nationality */}
        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Fecha de Nacimiento</span>
          <input
            type="date"
            name="birthDate"
            value={form.birthDate}
            onChange={handleChange}
            required
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Nacionalidad</span>
          <input
            type="text"
            name="nationality"
            value={form.nationality}
            onChange={handleChange}
            placeholder="Mexicana"
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          />
        </label>

        {/* Experience */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="hasExperience"
            checked={form.hasExperience}
            onChange={handleChange}
            className="w-5 h-5 accent-brand-red rounded"
          />
          <span className="text-sm text-gray-300">
            ¿Tienes experiencia previa?
          </span>
        </label>

        {/* How found */}
        <label className="grid gap-2">
          <span className="text-sm text-gray-300">¿Cómo nos conociste?</span>
          <input
            type="text"
            name="howFound"
            value={form.howFound}
            onChange={handleChange}
            placeholder="Por un amigo, redes sociales..."
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          />
        </label>

        {/* Health info */}
        <label className="grid gap-2">
          <span className="text-sm text-gray-300">
            Información de salud / discapacidad
          </span>
          <textarea
            name="healthInfo"
            value={form.healthInfo}
            onChange={handleChange}
            placeholder="Detalla cualquier información importante..."
            className="w-full bg-black/40 border border-gray-700 px-4 py-3 rounded-lg outline-none h-24"
          />
        </label>

        {/* Address */}
        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Dirección</span>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Calle, Colonia, Ciudad"
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          />
        </label>

        {/* Minor check */}
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isMinor"
            checked={form.isMinor}
            onChange={handleChange}
            className="w-5 h-5 accent-brand-red rounded"
          />
          <span className="text-sm text-gray-300">¿Es menor de edad?</span>
        </label>

        {form.isMinor && (
          <>
            <label className="grid gap-2">
              <span className="text-sm text-gray-300">
                Nombre del padre/madre
              </span>
              <input
                type="text"
                name="parentName"
                value={form.parentName}
                onChange={handleChange}
                placeholder="Nombre del padre/madre"
                className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-gray-300">
                Teléfono padre/madre
              </span>
              <input
                type="text"
                name="parentPhone"
                value={form.parentPhone}
                onChange={handleChange}
                placeholder="664 000 0000"
                className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
              />
            </label>
          </>
        )}

        {/* Classes */}
        <label className="grid gap-2">
          <span className="text-sm text-gray-300">
            Clases de interés (selecciona todas que apliquen)
          </span>
          <div className="grid grid-cols-2 gap-3 p-3 bg-black/30 rounded-lg">
            {[
              { value: "Boxeo", emoji: "🥊" },
              { value: "Jiu Jitsu", emoji: "🤼‍♂️" },
              { value: "Kickboxing", emoji: "👊" },
              { value: "MMA", emoji: "🤼‍♂️" },
              { value: "Yoga", emoji: "🧘" },
              { value: "Karate Kids", emoji: "👦" },
              { value: "Lima Lama", emoji: "🥋" },
            ].map((cls) => (
              <label
                key={cls.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name={`class-${cls.value}`}
                  checked={form.classes.includes(cls.value)}
                  onChange={handleChange}
                  className="w-4 h-4 accent-brand-red rounded"
                />
                <span className="text-sm text-gray-300">
                  {cls.emoji} {cls.value}
                </span>
              </label>
            ))}
          </div>
        </label>

        {/* ✅ Membership Type (matches DB pricing) */}
        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Tipo de Membresía</span>
          <select
            name="membershipType"
            value={form.membershipType}
            onChange={handleChange}
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          >
            <option value="Mensual">Mensual – $900 MXN</option>
            <option value="Trimestral">Trimestral – $2,200 MXN</option>
            <option value="Semestral">Semestral – $4,000 MXN</option>
            <option value="Anual">Anual – $7,200 MXN</option>
          </select>
        </label>

        {/* Join date */}
        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Fecha de inicio</span>
          <input
            type="date"
            name="joinDate"
            value={form.joinDate}
            onChange={handleChange}
            required
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-4 bg-brand-red text-white px-6 py-3 rounded-lg shadow-md hover:bg-brand-blue transition-colors"
        >
          {status === "loading" ? "Registrando…" : "Crear Perfil"}
        </button>
      </form>
    </section>
  );
}