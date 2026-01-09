"use client";

import { useEffect, useState } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion } from "framer-motion";
import { Calendar, MapPin, Ticket, AlertCircle, X, UserPlus } from "lucide-react";
import { SiFacebooklive } from "react-icons/si";


// -----------------------------
// TYPES
// -----------------------------
interface Event {
  id: string;
  title: string;
  event_date: string;
  location: string;
  venue?: string;
  fighters: { name: string }[];
  flyer_url?: string;
  ticket_link?: string;
  is_featured: boolean;
  is_past: boolean;
  event_type?: 'live_video' | 'belt_ranking' | 'announcement';
  description?: string;
}

interface LiveStream {
  id: string;
  title: string;
  stream_url: string;
  is_active: boolean;
}

interface FighterRegistrationForm {
  event_id: string;
  fighter_name: string;
  email: string;
  phone: string;
  birth_date: string;
  age: string;
  height_cm: string;
  weight_class: string;
  training_duration: string;
  combat_modality: string;
  health_conditions: string;
  gym_affiliation: string;
  liability_waiver_accepted: boolean;
}

// -----------------------------
// COUNTDOWN HELPER
// -----------------------------
function getTimeLeft(targetDate: string) {
  const now = new Date().getTime();
  const eventTime = new Date(targetDate + "T00:00:00").getTime();
  const diff = eventTime - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// -----------------------------
// PAGE
// -----------------------------
export default function EventsPage() {
  const supabase = createClientSupabaseClient();

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [liveStream, setLiveStream] = useState<LiveStream | null>(null);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [loading, setLoading] = useState(true);

  // Fighter Registration Modal State
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<Event | null>(null);
  const [registrationForm, setRegistrationForm] = useState<FighterRegistrationForm>({
    event_id: "",
    fighter_name: "",
    email: "",
    phone: "",
    birth_date: "",
    age: "",
    height_cm: "",
    weight_class: "",
    training_duration: "",
    combat_modality: "",
    health_conditions: "",
    gym_affiliation: "",
    liability_waiver_accepted: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // -----------------------------
  // FETCH DATA
  // -----------------------------
  useEffect(() => {
    fetchEvents();
    fetchLiveStream();

    // Subscribe realtime
    const eventsChannel = supabase
      .channel("public-events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => fetchEvents()
      )
      .subscribe();

    const streamsChannel = supabase
      .channel("public-streams")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_streams" },
        () => fetchLiveStream()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(streamsChannel);
    };
  }, []);

  // -----------------------------
  // COUNTDOWN TIMER
  // -----------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextEvent) {
        setTimeLeft(getTimeLeft(nextEvent.event_date));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextEvent]);

  // -----------------------------
  // FETCH EVENTS
  // -----------------------------
  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const upcoming =
        (data || []).filter((e) => {
          const eventDate = new Date(e.event_date + "T00:00:00");
          return !e.is_past && eventDate >= now;
        }) || [];

      const past =
        (data || []).filter((e) => {
          const eventDate = new Date(e.event_date + "T00:00:00");
          return e.is_past || eventDate < now;
        }) || [];

      const featured = upcoming.find((e) => e.is_featured) || null;

      const next =
        upcoming.length > 0
          ? [...upcoming].sort((a, b) => {
              const dateA = new Date(a.event_date + "T00:00:00");
              const dateB = new Date(b.event_date + "T00:00:00");
              return dateA.getTime() - dateB.getTime();
            })[0]
          : null;

      setUpcomingEvents(upcoming);
      setPastEvents(past);
      setFeaturedEvent(featured);
      setNextEvent(next);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // FETCH STREAM
  // -----------------------------
  async function fetchLiveStream() {
    try {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setLiveStream(data);
    } catch (err) {
      console.error("Error fetching live stream:", err);
    }
  }

  // -----------------------------
  // HELPERS
  // -----------------------------
  function formatEventDate(dateString: string) {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // -----------------------------
  // FIGHTER REGISTRATION HANDLERS
  // -----------------------------
  function openRegistrationModal(event: Event) {
    setSelectedEventForRegistration(event);
    setRegistrationForm({
      event_id: event.id,
      fighter_name: "",
      email: "",
      phone: "",
      birth_date: "",
      age: "",
      height_cm: "",
      weight_class: "",
      training_duration: "",
      combat_modality: "",
      health_conditions: "",
      gym_affiliation: "",
      liability_waiver_accepted: false,
    });
    setShowRegistrationModal(true);
  }

  function closeRegistrationModal() {
    setShowRegistrationModal(false);
    setSelectedEventForRegistration(null);
    setRegistrationForm({
      event_id: "",
      fighter_name: "",
      email: "",
      phone: "",
      birth_date: "",
      age: "",
      height_cm: "",
      weight_class: "",
      training_duration: "",
      combat_modality: "",
      health_conditions: "",
      gym_affiliation: "",
      liability_waiver_accepted: false,
    });
  }

  async function handleRegistrationSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Convert string values to numbers where needed
      const payload = {
        ...registrationForm,
        age: parseInt(registrationForm.age),
        height_cm: parseInt(registrationForm.height_cm),
        weight_class: registrationForm.weight_class, // Keep as string since it's stored as TEXT in DB
      };

      console.log("Submitting fighter registration:", payload);

      const response = await fetch("/api/fighter-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Registration response:", result);

      if (response.ok) {
        alert("¡Registro exitoso! Te contactaremos pronto con más información.");
        closeRegistrationModal();
      } else {
        console.error("Registration error:", result);
        alert(`Error: ${result.error || "No se pudo completar el registro"}`);
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("Error al enviar el registro. Por favor intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  // -----------------------------
  // AUTO-DETECT LIVESTREAM PLATFORM
  // -----------------------------
  function getEmbedUrl(url: string): string {
    if (!url) return "";

    // YouTube - Handle standard watch, short links, and live URLs
    const ytRegex = /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = url.match(ytRegex);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    // TikTok
    if (url.includes("tiktok.com")) {
      return url.replace("/video/", "/embed/");
    }

    // Facebook
    if (url.includes("facebook.com")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url
      )}&show_text=false&autoplay=true`;
    }

    return url;
  }

  // -----------------------------
  // LOADING
  // -----------------------------
  if (loading) {
    return (
      <main className="px-6 py-20 text-center text-white">
        <p>Cargando eventos...</p>
      </main>
    );
  }

  // -----------------------------
  // PAGE RENDER
  // -----------------------------
  return (
    <main className="px-6 py-20 space-y-20">
      {/* HEADER */}
      <section className="text-center">
        <h1 className="font-heading text-6xl md:text-5xl sm:text-4xl text-brand-red mb-4">
          Eventos C.A.M Amezcuas
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-300">
          Mantente al día con nuestros próximos eventos, transmisiones en vivo
          y revive los mejores momentos de la comunidad.
        </p>
      </section>

      {/* PUBLIC NEXT EVENT COUNTDOWN HERO */}
      {nextEvent && (
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-xl overflow-hidden border border-brand-blue shadow-lg max-w-5xl mx-auto"
        >
          <div className="relative h-72 w-full">
            {nextEvent.flyer_url && (
              <img
                src={nextEvent.flyer_url}
                alt={nextEvent.title}
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black"></div>
          </div>

          <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-10">
            <div className="flex gap-2 mb-2">
              <span className="px-3 py-1 bg-brand-red text-white text-xs rounded-md font-bold uppercase tracking-wider">
                Próximo Evento
              </span>

              {nextEvent.is_featured && (
                <span className="px-3 py-1 bg-yellow-400 text-black text-xs rounded-md font-bold uppercase tracking-wider">
                  ⭐ Destacado
                </span>
              )}
            </div>

            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
              {nextEvent.title}
            </h2>

            <p className="text-gray-300 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-red" />
              {formatEventDate(nextEvent.event_date)}
            </p>

            <p className="text-gray-300 flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-brand-blue" />
              {nextEvent.location}
              {nextEvent.venue && ` - ${nextEvent.venue}`}
            </p>

            <div className="flex gap-4 mt-4">
              {["days", "hours", "minutes", "seconds"].map((key) => (
                <div
                  key={key}
                  className="px-4 py-3 bg-black/50 rounded-lg border border-brand-blue/40 text-center w-20"
                >
                  <div className="text-2xl font-extrabold text-brand-blue">
                    {timeLeft[key as keyof typeof timeLeft]
                      .toString()
                      .padStart(2, "0")}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {key === "days"
                      ? "Días"
                      : key === "hours"
                      ? "Horas"
                      : key === "minutes"
                      ? "Min"
                      : "Seg"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* FEATURED EVENT */}
      {featuredEvent && (
        <section>
          <h2 className="about-heading-red mb-6 text-center">
            Evento Destacado
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="max-w-3xl w-full bg-black/60 rounded-xl shadow-lg overflow-hidden border border-brand-red hover:border-brand-blue transition-all duration-300 hover:scale-[1.02]">
              {featuredEvent.flyer_url && (
                <img
                  src={featuredEvent.flyer_url}
                  alt={featuredEvent.title}
                  className="w-full h-auto object-contain"
                />
              )}

              <div className="p-6">
                <h3 className="font-heading text-2xl text-brand-white mb-3">
                  {featuredEvent.title}
                </h3>

                <p className="text-gray-300 flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-brand-red" />
                  {formatEventDate(featuredEvent.event_date)}
                </p>

                <p className="text-gray-300 flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-brand-blue" />
                  {featuredEvent.location}
                  {featuredEvent.venue && ` - ${featuredEvent.venue}`}
                </p>

                {featuredEvent.fighters.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Peleadores:</p>
                    <div className="flex flex-wrap gap-2">
                      {featuredEvent.fighters.map((fighter, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-brand-red/20 border border-brand-red rounded-full text-sm text-brand-red"
                        >
                          {fighter.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {featuredEvent.ticket_link && (
                  <a
                    href={featuredEvent.ticket_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red hover:bg-brand-red/80 text-white rounded-lg transition font-semibold"
                  >
                    <Ticket className="w-5 h-5" />
                    Comprar Boletos
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* UPCOMING EVENTS */}
      {upcomingEvents.length > 0 && (
        <section>
          <h2 className="about-heading-blue mb-8 text-center">
            Próximos Eventos
          </h2>

          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl">
              {upcomingEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="max-w-3xl w-full bg-black/60 rounded-xl shadow-lg overflow-hidden border border-brand-red hover:border-brand-blue transition-all duration-300 hover:scale-[1.02]"
                >
                  {event.flyer_url && (
                    <img
                      src={event.flyer_url}
                      alt={event.title}
                      className="w-full h-auto object-contain"
                    />
                  )}

                  <div className="p-6">
                    <h3 className="font-heading text-2xl text-brand-white mb-3">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-gray-300 text-sm mb-4 whitespace-pre-line">
                        {event.description}
                      </p>
                    )}

                    <p className="text-gray-300 flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-brand-red" />
                      {formatEventDate(event.event_date)}
                    </p>

                    <p className="text-gray-300 flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-brand-blue" />
                      {event.location}
                      {event.venue && ` - ${event.venue}`}
                    </p>

                    {event.fighters.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Peleadores:</p>
                        <div className="flex flex-wrap gap-2">
                          {event.fighters.map((fighter, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-brand-red/20 border border-brand-red rounded-full text-sm text-brand-red"
                            >
                              {fighter.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      {event.ticket_link && (
                        <a
                          href={event.ticket_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red hover:bg-brand-red/80 text-white rounded-lg transition font-semibold"
                        >
                          <Ticket className="w-5 h-5" />
                          Comprar Boletos
                        </a>
                      )}

                      {/* Only show fighter registration for live_video events */}
                      {event.event_type === 'live_video' && (
                        <button
                          onClick={() => openRegistrationModal(event)}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue/20 border border-brand-blue rounded-lg hover:bg-brand-blue/30 transition font-semibold text-brand-blue"
                        >
                          <UserPlus className="w-5 h-5" />
                          Registrarse como Peleador
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LIVESTREAM */}
      {liveStream && (
        <section>
         <h2 className="about-heading-white mb-8 text-center flex flex-col items-center gap-6">
  {/* LIVE BADGE ABOVE TITLE */}
  <div className="flex items-center justify-center gap-2">
    <span className="relative flex items-center">
      <span className="absolute inline-flex h-4 w-4 rounded-full bg-red-500 opacity-75 animate-ping"></span>
      <span className="relative inline-flex h-4 w-4 rounded-full bg-red-600"></span>
    </span>

    <span className="text-green-500 font-bold tracking-wide text-lg">
      En Vivo
    </span>
  </div>

  {/* ORIGINAL EVENT TITLE */}
  <span>{liveStream.title}</span>
</h2>



          <div className="max-w-4xl mx-auto aspect-video bg-black rounded-xl shadow-lg overflow-hidden border border-brand-red">
            <iframe
              src={getEmbedUrl(liveStream.stream_url)}
              title={liveStream.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </section>
      )}

      {/* PAST EVENTS */}
      {pastEvents.length > 0 && (
        <section className="mt-16">
          <h2 className="about-heading-white mb-8 text-center">
            Eventos Pasados
          </h2>

          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
              {pastEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-black/60 rounded-xl shadow-lg overflow-hidden border border-gray-800 transition-transform duration-300 hover:scale-105"
                >
                  {event.flyer_url && (
                    <img
                      src={event.flyer_url}
                      alt={event.title}
                      className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  )}

                  <div className="p-4">
                    <h3 className="font-heading text-xl text-brand-white mb-1">
                      {event.title}
                    </h3>

                    <p className="text-gray-400 text-sm">
                      {formatEventDate(event.event_date)}
                    </p>

                    <p className="text-gray-400 text-sm">
                      {event.location}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EMPTY STATE */}
      {upcomingEvents.length === 0 &&
        pastEvents.length === 0 &&
        !liveStream && (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              No hay eventos disponibles en este momento.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              ¡Mantente atento para futuras actualizaciones!
            </p>
          </div>
        )}

      {/* FIGHTER REGISTRATION MODAL */}
      {showRegistrationModal && selectedEventForRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-brand-blue"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-heading text-brand-red">
                  Registro de Peleador
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedEventForRegistration.title}
                </p>
                <p className="text-xs text-gray-500">
                  {formatEventDate(selectedEventForRegistration.event_date)}
                </p>
              </div>
              <button
                onClick={closeRegistrationModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-white">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={registrationForm.fighter_name}
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      fighter_name: e.target.value,
                    })
                  }
                  required
                  placeholder="Nombre completo del atleta"
                  className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-white">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={registrationForm.email}
                    onChange={(e) =>
                      setRegistrationForm({
                        ...registrationForm,
                        email: e.target.value,
                      })
                    }
                    required
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-white">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={registrationForm.phone}
                    onChange={(e) =>
                      setRegistrationForm({
                        ...registrationForm,
                        phone: e.target.value,
                      })
                    }
                    required
                    placeholder="664-123-4567"
                    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-white">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    value={registrationForm.birth_date}
                    onChange={(e) =>
                      setRegistrationForm({
                        ...registrationForm,
                        birth_date: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-white">
                    Edad *
                  </label>
                  <input
                    type="number"
                    value={registrationForm.age}
                    onChange={(e) =>
                      setRegistrationForm({
                        ...registrationForm,
                        age: e.target.value,
                      })
                    }
                    required
                    placeholder="Edad actual"
                    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-white">
                    Estatura (cm) *
                  </label>
                  <input
                    type="number"
                    value={registrationForm.height_cm}
                    onChange={(e) =>
                      setRegistrationForm({
                        ...registrationForm,
                        height_cm: e.target.value,
                      })
                    }
                    required
                    placeholder="Ej: 175"
                    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-white">
                    Peso en Kilogramos *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={registrationForm.weight_class}
                    onChange={(e) =>
                      setRegistrationForm({
                        ...registrationForm,
                        weight_class: e.target.value,
                      })
                    }
                    required
                    placeholder="Ej: 70.5"
                    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-white">
                  Tiempo Entrenando en C.A.M. *
                </label>
                <input
                  type="text"
                  value={registrationForm.training_duration}
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      training_duration: e.target.value,
                    })
                  }
                  required
                  placeholder="Ej: 6 meses, 2 años"
                  className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-white">
                  Modalidad de Combate *
                </label>
                <select
                  value={registrationForm.combat_modality}
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      combat_modality: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none text-white"
                >
                  <option value="">Seleccionar modalidad</option>
                  <option value="boxeo">Boxeo</option>
                  <option value="kickboxing">Kickboxing</option>
                  <option value="mma">MMA</option>
                  <option value="pointfight">Pointfight</option>
                  <option value="jiu-jitsu">Jiu Jitsu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-white">
                  Discapacidades o Condiciones de Salud
                </label>
                <textarea
                  value={registrationForm.health_conditions}
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      health_conditions: e.target.value,
                    })
                  }
                  placeholder="Indique cualquier discapacidad o condición de salud relevante"
                  rows={2}
                  className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none resize-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-white">
                  Gimnasio / Afiliación
                </label>
                <input
                  type="text"
                  value={registrationForm.gym_affiliation}
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      gym_affiliation: e.target.value,
                    })
                  }
                  placeholder="Nombre del gimnasio (si aplica)"
                  className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none text-white"
                />
              </div>

              {/* Requisitos para pelear */}
              <div className="bg-brand-red/10 border border-brand-red/30 rounded-lg p-4 mt-6">
                <h3 className="text-sm font-bold text-brand-red mb-2">Requisitos para Participar:</h3>
                <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                  <li>Equipamiento completo de protección</li>
                  <li>Entrenamiento mínimo 3 veces por semana</li>
                  <li>Compromiso inquebrantable con el evento</li>
                  <li>Firma de carta de responsabilidad (menores requieren firma de padres/tutores)</li>
                  <li>Mantener el peso pactado para la categoría</li>
                </ul>
              </div>

              {/* Liability Waiver */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                <h3 className="text-sm font-bold text-yellow-400 mb-2">Descargo de Responsabilidad:</h3>
                <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                  Al registrarme para participar en este evento de combate amateur organizado por C.A.M. Amezcuas,
                  declaro que comprendo y acepto los riesgos inherentes a la práctica de artes marciales y deportes de contacto.
                  Libero de toda responsabilidad a C.A.M. Amezcuas, sus instructores, organizadores y personal,
                  por cualquier lesión, daño o pérdida que pueda sufrir durante el evento, de conformidad con las leyes
                  del Estado de Baja California, México. Confirmo que me encuentro en condiciones físicas adecuadas
                  para participar y que he revelado toda información médica relevante.
                </p>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="liability-waiver"
                    checked={registrationForm.liability_waiver_accepted}
                    onChange={(e) =>
                      setRegistrationForm({
                        ...registrationForm,
                        liability_waiver_accepted: e.target.checked,
                      })
                    }
                    required
                    className="mt-1 w-4 h-4 accent-brand-blue"
                  />
                  <label htmlFor="liability-waiver" className="text-xs text-white font-semibold cursor-pointer">
                    He leído y acepto el descargo de responsabilidad. Confirmo que toda la información proporcionada es verídica. *
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeRegistrationModal}
                  className="flex-1 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-brand-blue rounded hover:bg-brand-blue/80 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Enviar Registro
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  );
}
