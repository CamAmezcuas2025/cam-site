"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // 👈 add this

type Profile = {
  classes?: string[];
};

const AVAILABLE_CLASSES = [
  "Lima Lama",
  "Boxeo",
  "Jiu Jitsu",
  "Kickboxing",
  "MMA",
  "Yoga",
];

function getClassEmoji(className: string) {
  const map: Record<string, string> = {
    Boxeo: "🥊",
    "Jiu Jitsu": "🥋",
    MMA: "🥷",
    Kickboxing: "👊",
    Yoga: "🧘",
    "Lima Lama": "🪃",
  };
  return map[className] || "🏋️";
}

export default function LogHoursPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  const userClasses = useMemo(() => profile?.classes ?? [], [profile]);
  const hasUserClasses = userClasses.length > 0;

  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState<number>(1);
  const [addToProfile, setAddToProfile] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);

        const firstUser = (data.classes ?? [])[0];
        setSelectedClass(firstUser || AVAILABLE_CLASSES[0]);
        setAddToProfile(!firstUser);
      }
    }
    fetchProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClass || !date || !hours) return;

    setSaving(true);
    try {
      if (addToProfile && !userClasses.includes(selectedClass)) {
        const newClasses = [...userClasses, selectedClass];
        const resAdd = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classes: newClasses }),
        });
        if (!resAdd.ok) {
          toast.error("❌ No se pudo añadir la clase al perfil");
          setSaving(false);
          return;
        }
      }

      const resLog = await fetch("/api/log-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className: selectedClass,
          date,
          hours,
        }),
      });

      if (!resLog.ok) {
        toast.error("❌ Error al registrar horas");
        setSaving(false);
        return;
      }

      toast.success(" Horas registradas con éxito");
      router.push("/profile?tab=progreso");
    } catch (err) {
      console.error("Error saving hours:", err);
      toast.error("❌ Error de red al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return <p className="pt-28 text-center text-gray-400">Cargando clases...</p>;
  }

  const displayClasses = hasUserClasses ? userClasses : AVAILABLE_CLASSES;

  return (
    <section className="pt-28 pb-24 max-w-3xl mx-auto px-6">
      <h1 className="font-heading text-4xl text-center text-brand-red mb-2">
        Registrar Horas
      </h1>
      <p className="text-center text-gray-400 mb-8">
        Selecciona tu clase, fecha y horas entrenadas 👊
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-black/70 border border-gray-700 rounded-2xl shadow-xl p-8 space-y-8"
      >
        {/* Class badges */}
        <div>
          <label className="block text-gray-300 mb-3 text-lg">
            Selecciona tu clase
          </label>

          {!hasUserClasses && (
            <p className="text-sm text-gray-400 mb-3">
              Aún no tienes clases en tu perfil. Elige una y marca{" "}
              <span className="text-brand-blue font-medium">
                “Agregar esta clase a mi perfil”
              </span>{" "}
              para guardarla.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {displayClasses.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setSelectedClass(c)}
                className={`px-4 py-2 rounded-full border transition cursor-pointer ${
                  selectedClass === c
                    ? "bg-gradient-to-r from-brand-red to-brand-blue text-white border-brand-red shadow-lg scale-105"
                    : "bg-black/50 text-gray-300 border-gray-700 hover:border-brand-red hover:text-white"
                }`}
                aria-pressed={selectedClass === c}
              >
                {getClassEmoji(c)} {c}
              </button>
            ))}
          </div>

          {!userClasses.includes(selectedClass) && (
            <label className="mt-4 inline-flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={addToProfile}
                onChange={(e) => setAddToProfile(e.target.checked)}
                className="w-5 h-5 accent-brand-red"
              />
              Agregar esta clase a mi perfil
            </label>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-gray-300 mb-2 text-lg">
            Fecha de Entrenamiento
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white"
            required
          />
        </div>

        {/* Hours */}
        <div>
          <label className="block text-gray-300 mb-2 text-lg">
            Horas entrenadas
          </label>
          <input
            type="number"
            min={1}
            max={8}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Máximo 8 horas por sesión.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-between">
          <button
            type="button"
            onClick={() => router.push("/profile?tab=progreso")}
            className="w-1/2 px-6 py-3 rounded-lg font-heading text-lg bg-gray-700 text-white hover:bg-gray-600 transition shadow-md"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={saving}
            className="w-1/2 px-6 py-3 rounded-lg font-heading text-lg bg-brand-red text-white hover:bg-brand-blue transition shadow-md"
          >
            {saving ? "Guardando..." : "Registrar Horas"}
          </button>
        </div>
      </form>
    </section>
  );
}