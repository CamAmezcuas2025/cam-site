"use client";
export const dynamic = "force-dynamic";


import { Suspense, useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiAward,
  FiTrendingUp,
  FiActivity,
  FiCreditCard,
  FiLogOut,
  FiFileText,
} from "react-icons/fi";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";

type ClassProgress = {
  name: string;
  weeklyHours: number;
  monthlyHours: number;
  totalHours: number;
};

type Profile = {
  name: string;
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
  training?: {
    weeklyHours: number;
    monthlyHours: number;
    totalHours: number;
    streak: number;
  };
  classProgress?: ClassProgress[];
  hasSignedWaiver?: boolean;
  waiverSignedAt?: string;
  belt_level?: string;
  student_notes?: string;
  role?: string;
};

function getClassEmoji(className: string) {
  const map: Record<string, string> = {
    Boxeo: "🥊",
    "Jiu Jitsu": "🤼‍♀️",
    MMA: "🤼‍♂️",
    Kickboxing: "👊",
    Yoga: "🧘",
    "Lima Lama": "🥋",
  };
  return map[className] || "🏋️";
}

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const supabase = createClientSupabaseClient();

  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("progreso");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  useEffect(() => {
    let mounted = true;
    async function verifySession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await supabase.auth.getUser();
        if (!mounted) return;
        if (!session) router.replace("/login");
        else setAuthChecked(true);
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        if (mounted) setSessionLoading(false);
      }
    }
    verifySession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
      else setAuthChecked(true);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  useEffect(() => {
    if (!authChecked) return;
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched profile:", data);
          setProfile(data);
        } else {
          console.error("Profile fetch failed:", res.statusText);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    }
    fetchProfile();
  }, [authChecked, searchKey]);

  if (sessionLoading) return null;
  if (!authChecked)
    return <p className="text-center text-gray-400 pt-32">Verificando sesión...</p>;
  if (!profile)
    return <p className="text-center text-gray-400 pt-32">Cargando perfil...</p>;

  const beltEligible = (profile.classes || []).some((cls) =>
    ["Jiu Jitsu", "MMA", "Lima Lama", "Karate"].includes(cls)
  );

  return (
    <section className="pt-28 pb-24 max-w-5xl mx-auto px-6">
      {/* Top Gym Pass Card */}
      <div className="relative bg-black/80 border-2 border-brand-red rounded-2xl shadow-xl p-8 mb-10 text-center">
        <img
          src={profile.avatar || "/images/avatar-placeholder.png"}
          alt="Avatar"
          className="w-24 h-24 mx-auto rounded-full border-4 border-brand-red object-cover mb-4"
        />
        <h1 className="text-3xl font-heading text-white">
          {profile.name || "Alumno"}
        </h1>
        <p className="text-gray-300 mt-1">{profile.email || "No email"}</p>

        <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-gray-300">
          <span className="bg-brand-red/20 px-3 py-1 rounded-lg">
            Membresía: <strong>Básica</strong>
          </span>
          <span className="bg-brand-blue/20 px-3 py-1 rounded-lg">
            Estado: <strong>Activo</strong>
          </span>
          {profile.underage && (
            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg">
              👶 Menor de Edad
            </span>
          )}
          {profile.role === "admin" && (
            <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-lg">
              👑 Admin Mode
            </span>
          )}
        </div>

        <div className="mt-3 text-gray-400 text-sm">
          Inicio: {profile.joinDate || "—"} · Próximo Pago:{" "}
          {profile.nextPayment || "—"}
        </div>

        <Link
          href="/profile/edit"
          className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-brand-red text-white hover:bg-brand-blue transition-colors"
        >
          Editar Perfil
        </Link>

        <button
          onClick={handleLogout}
          className="absolute top-4 left-4 px-4 py-2 rounded-lg bg-brand-red text-white hover:bg-brand-blue transition-colors flex items-center gap-1"
        >
          <FiLogOut />
          Cerrar Sesión
        </button>
      </div>

      {/* Waiver Status */}
      {profile.hasSignedWaiver ? (
        <div className="bg-black/60 border border-brand-blue rounded-lg p-3 mb-8 text-center text-white">
          <h3 className="text-sm sm:text-base font-semibold text-brand-blue tracking-wide">
            📜 CARTA RESPONSIVA FIRMADA ✅
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Firmado el{" "}
            {new Date(profile.waiverSignedAt!).toLocaleDateString("es-MX", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <Link
            href="/waiver"
            className="text-brand-blue hover:text-brand-red underline text-xs sm:text-sm font-semibold mt-1 inline-block"
          >
            Ver documento firmado
          </Link>
        </div>
      ) : (
        <div className="bg-black/60 border border-brand-red rounded-lg p-3 mb-8 text-center text-white">
          <h3 className="text-sm sm:text-base font-semibold text-brand-red tracking-wide">
            ⚠️ PENDIENTE DE FIRMAR
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Por favor firma tu documento de La Carta Responsiva antes de continuar.
          </p>
          <Link
            href="/waiver"
            className="bg-brand-red hover:bg-brand-blue text-white px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold mt-2 inline-block transition"
          >
            Firmar ahora
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {[
          { key: "progreso", label: "Progreso", icon: <FiActivity /> },
          { key: "membresia", label: "Membresía", icon: <FiCreditCard /> },
          { key: "datos", label: "Datos Personales", icon: <FiUser /> },
          ...(profile.role === "admin"
            ? [{ key: "admin", label: "Admin Panel", icon: <FiAward /> }]
            : []),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-brand-red to-brand-blue text-white shadow-lg scale-105"
                : "bg-black/50 text-gray-400 hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="space-y-6">
        {activeTab === "progreso" && (
          <div className="space-y-6">
            <ProgressBar label="Horas semanales" value={profile.training?.weeklyHours || 0} max={10} color="bg-brand-red" />
            <ProgressBar label="Horas mensuales" value={profile.training?.monthlyHours || 0} max={40} color="bg-brand-blue" />
            <ProgressBar label="Horas totales" value={profile.training?.totalHours || 0} max={200} color="bg-gradient-to-r from-brand-red to-brand-blue" />
            <div className="text-center text-2xl font-bold text-white">
              <FiTrendingUp className="inline text-orange-400 mr-2" />
              {profile.training?.streak || 0} días de racha 🔥
            </div>
            <div className="text-center mt-6">
              <Link href="/log-hours" className="px-6 py-3 rounded-lg bg-gradient-to-r from-brand-red to-brand-blue text-white font-heading hover:opacity-90 transition">
                ➕ Registrar Horas
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {(profile.classes || []).map((c, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-black/60 border border-gray-700 text-white hover:shadow-lg hover:shadow-brand-red/40 hover:scale-105 transition cursor-pointer">
                  {getClassEmoji(c)} {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === "membresia" && (
          <div className="bg-black/60 border border-gray-700 rounded-2xl p-6 text-center text-gray-300">
            <h2 className="text-xl font-heading text-white mb-4">Detalles de Membresía</h2>
            <p>Plan: Básica</p>
            <p>Inicio: {profile.joinDate || "—"}</p>
            <p>Próximo Pago: {profile.nextPayment || "—"}</p>
            <p className="mt-2 text-green-400 font-bold">Estado: Activo ✅</p>
          </div>
        )}

        {activeTab === "datos" && (
          <div className="grid gap-4">
            <InfoCard icon={<FiUser />} label="Nombre" value={profile.name} />
            <InfoCard icon={<FiCalendar />} label="Nacimiento" value={profile.birthDate} />
            <InfoCard icon={<FiMail />} label="Correo" value={profile.email} />
            <InfoCard icon={<FiMapPin />} label="Dirección" value={profile.address} />
            <InfoCard icon={<FiAward />} label="Nacionalidad" value={profile.nationality} />

            {beltEligible && profile.belt_level && (
              <InfoCard icon={<FiAward />} label="Nivel de Cinta" value={profile.belt_level} />
            )}

            <div className="bg-black/60 border border-gray-700 px-4 py-4 rounded-lg text-white">
              <div className="flex items-center gap-2 mb-2">
                <FiFileText className="text-brand-blue" />
                <h3 className="text-sm text-gray-400 font-semibold">Notas del Entrenador</h3>
              </div>
              {profile.student_notes ? (
                <p className="text-gray-300 text-sm whitespace-pre-wrap">
                  {profile.student_notes}
                </p>
              ) : (
                <p className="text-gray-500 text-sm italic">Sin notas registradas.</p>
              )}
            </div>

            {profile.underage && (
              <>
                <InfoCard label="Padre/Madre" value={profile.parentName} />
                <InfoCard label="Teléfono Padre/Madre" value={profile.parentPhone} />
              </>
            )}
          </div>
        )}

        {activeTab === "admin" && profile.role === "admin" && (
          <div className="bg-purple-900/20 border border-purple-500 rounded-2xl p-6 text-center text-purple-300">
            <h2 className="text-xl font-heading text-white mb-4">Panel de Admin</h2>
            <p>¡Bienvenido, admin! Aquí puedes gestionar usuarios, clases y más.</p>
            <div className="mt-4 space-y-2">
              <Link href="/admin/users" className="block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
                👥 Gestionar Usuarios
              </Link>
              <Link href="/admin/classes" className="block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
                🏋️ Clases y Membresías
              </Link>
              <Link href="/admin/reports" className="block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
                📊 Reportes
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* InfoCard */
function InfoCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | boolean;
}) {
  return (
    <div className="flex items-center gap-3 bg-black/60 border border-gray-700 px-4 py-3 rounded-lg text-white">
      {icon && <div className="text-brand-red">{icon}</div>}
      <div>
        <div className="text-sm text-gray-400">{label}</div>
        <div className="font-medium break-words">{value || "—"}</div>
      </div>
    </div>
  );
}

/* Progress Bar */
function ProgressBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percent = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm text-gray-400 mb-1">
        <span>{label}</span>
        <span>
          {value}/{max} hrs
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-lg h-4 overflow-hidden">
        <div
          className={`h-4 ${color}`}
          style={{ width: `${percent}%`, transition: "width 0.5s ease" }}
        />
      </div>
    </div>
  );
}

// ✅ Wrap entire client page in Suspense
export default function ProfilePage() {
  return (
    <Suspense fallback={<p className="text-center text-gray-400 pt-32">Cargando perfil...</p>}>
      <ProfilePageContent />
    </Suspense>
  );
}
