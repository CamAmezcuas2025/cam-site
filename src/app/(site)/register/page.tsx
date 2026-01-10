"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";

type Status = "idle" | "loading" | "success" | "error";

interface Membership {
  id: string;
  type: string;
  price: number;
  duration: string;
  category: string;
  currency: string;
  duration_days: number;
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "", // ✅ added phone field
    password: "",
    avatar: "/images/avatar.jpeg",
    birthDate: "",
    nationality: "",
    hasExperience: false,
    howFound: "",
    healthInfo: "",
    edad: "",
    estatura: "",
    peso: "",
    tiempoEntrenando: "",
    address: "",
    isParent: false,
    classes: [] as string[],
    membershipType: "",
    joinDate: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [hp, setHp] = useState("");
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showFamily, setShowFamily] = useState(false);
  const router = useRouter();

  const supabase = createClientSupabaseClient();

  async function fetchPlans() {
    setLoadingPlans(true);
    const { data, error } = await supabase
      .from("admin_memberships")
      .select("*")
      .eq("category", showFamily ? "family" : "individual")
      .order("duration_days", { ascending: true });

    if (error) {
      console.error("Plans fetch error:", error);
      setError("Error loading plans from DB—contact admin");
    } else {
      setMemberships(data || []);
      if (data && data.length > 0 && !form.membershipType) {
        setForm((prev) => ({ ...prev, membershipType: data[0].type }));
      }
    }
    setLoadingPlans(false);
  }

  useEffect(() => {
    fetchPlans();
  }, [supabase, showFamily]);

  useEffect(() => {
    const channel = supabase
      .channel("memberships_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_memberships" },
        fetchPlans
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, showFamily]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      const checked = target.checked;
      if (name === "isParent") {
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

  function toggleFamily() {
    setShowFamily(!showFamily);
    setForm((prev) => ({ ...prev, membershipType: "" }));
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
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          avatar: form.avatar,
          birthDate: form.birthDate,
          nationality: form.nationality,
          hasExperience: form.hasExperience,
          howFound: form.howFound,
          healthInfo: form.healthInfo,
          edad: form.edad,
          estatura: form.estatura,
          peso: form.peso,
          tiempoEntrenando: form.tiempoEntrenando,
          address: form.address,
          isParent: form.isParent,
          classes: form.classes,
          membershipType: form.membershipType,
          joinDate: form.joinDate,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || j?.message || "No se pudo registrar.");
        setStatus("error");
        return;
      }

      const data = await res.json();

      setStatus("success");
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        avatar: "/images/avatar.jpeg",
        birthDate: "",
        nationality: "",
        hasExperience: false,
        howFound: "",
        healthInfo: "",
        edad: "",
        estatura: "",
        peso: "",
        tiempoEntrenando: "",
        address: "",
        isParent: false,
        classes: [],
        membershipType: "Mensual",
        joinDate: "",
      });

      setTimeout(() => {
        if (data.isParent) {
          router.push("/add-child");
        } else {
          router.push("/profile");
        }
      }, 1200);
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
        <input
          type="text"
          name="company"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

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

        {/* ✅ Phone field */}
        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Teléfono</span>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="(55) 1234-5678"
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

        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Edad</span>
          <input
            type="number"
            name="edad"
            value={form.edad}
            onChange={handleChange}
            placeholder="25"
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Estatura (cm)</span>
          <input
            type="number"
            name="estatura"
            value={form.estatura}
            onChange={handleChange}
            placeholder="170"
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Peso (kg)</span>
          <input
            type="number"
            name="peso"
            value={form.peso}
            onChange={handleChange}
            placeholder="70"
            step="0.1"
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Tiempo entrenando</span>
          <input
            type="text"
            name="tiempoEntrenando"
            value={form.tiempoEntrenando}
            onChange={handleChange}
            placeholder="2 años"
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          />
        </label>

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

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isParent"
            checked={form.isParent}
            onChange={handleChange}
            className="w-5 h-5 accent-brand-red rounded"
          />
          <span className="text-sm text-gray-300">
            ¿Registrando para tu hijo/a? 👨‍👩‍👧
          </span>
        </label>

        {form.isParent && (
          <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-sm">
            Después del registro, serás redirigido para agregar los datos de tu hijo/a.
          </div>
        )}

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

        <label className="grid gap-2">
          <span className="text-sm text-gray-300">Tipo de Membresía</span>
          <select
            name="membershipType"
            value={form.membershipType}
            onChange={handleChange}
            className="px-4 py-3 rounded-lg bg-black/40 border border-gray-700 outline-none"
          >
            <option value="Mensual">Mensual – $950 MXN + $400 de inscripción</option>
            <option value="Mensual">Mensual Familiar(2 personas) – $1800 MXN + $400 de inscripción</option>
            <option value="Mensual">Mensual Familiar(3 personas) – $2600 MXN + Gratis</option>
            <option value="Mensual">Mensual Familiar(4 personas) – $3400 MXN + Gratis</option>
            <option value="Trimestral">Trimestral – $2,500 MXN + $400 de inscripción</option>
            <option value="Mensual">Trimestral Familiar(2 personas) – $5000 MXN + $400 de inscripción</option>
            <option value="Mensual">Trimestral Familiar(3 personas) – $7000 MXN + $400 de inscripción</option>
            <option value="Mensual">Trimestral Familiar(4 personas) – $9500 MXN + $400 de inscripción</option>
            <option value="Semestral">Semestral – $5200 MXN + $400 de inscripción</option>
            <option value="Mensual">Semestral Familiar(2 personas) – $10500 MXN + $400 de inscripción</option>
            <option value="Mensual">Semestral Familiar(3 personas) – $14800 MXN + $400 de inscripción</option>
            <option value="Mensual">Semestral Familiar(4 personas) – $19500 MXN + $400 de inscripción</option>
          </select>
        </label>

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
