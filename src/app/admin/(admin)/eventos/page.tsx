// src/app/admin/(admin)/eventos/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Trash2,
  Edit,
  X,
  Check,
  AlertCircle,
  Users,
} from "lucide-react";
import { MdOutlineLiveTv, MdOutlineAddLocationAlt } from "react-icons/md";
import { RiVideoAddFill, RiImageAddFill } from "react-icons/ri";
import { 
  GiFilmProjector, 
  GiTicket, 
  GiPunch, 
  GiBoxingRing, 
  GiTrophy, 
  GiCalendar, 
 GiHighPunch,
} from "react-icons/gi";
import { SiTiktok, SiFacebooklive } from "react-icons/si";
import { ImYoutube2 } from "react-icons/im";
import { FcStart } from "react-icons/fc";




// -----------------------------
// Time Left Calculator
// -----------------------------
function getTimeLeft(targetDate: string) {
  const now = new Date().getTime();
  const eventTime = new Date(targetDate).getTime();
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


type EventType = 'live_video' | 'belt_ranking' | 'announcement';

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
  created_at: string;
  event_type: EventType;
  stream_url?: string;
  description?: string;
}

interface LiveStream {
  id: string;
  title: string;
  stream_url: string;
  is_active: boolean;
  scheduled_start?: string;
}

interface FighterRegistration {
  id: string;
  event_id: string;
  fighter_name: string;
  email: string;
  phone: string;
  birth_date?: string;
  age?: number;
  height_cm?: number;
  weight_class?: string;
  training_duration?: string;
  combat_modality?: string;
  health_conditions?: string;
  gym_affiliation?: string;
  liability_waiver_accepted: boolean;
  waiver_accepted_at?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

type EventFilter = "all" | "upcoming" | "past" | "featured";

export default function AdminEventosPage() {
  const supabase = createClientSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [liveStream, setLiveStream] = useState<LiveStream | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploading, setUploading] = useState(false);
  const hasFetched = useRef(false);

  // Fighter Registrations State
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedEventRegistrations, setSelectedEventRegistrations] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<FighterRegistration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // NEW: filter state
  const [filter, setFilter] = useState<EventFilter>("all");
    // Search state
  const [search, setSearch] = useState("");

  // Featured + countdown state
const [nextEvent, setNextEvent] = useState<Event | null>(null);
const [timeLeft, setTimeLeft] = useState({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
});


  // Form state
  const [formData, setFormData] = useState({
    title: "",
    event_date: "",
    location: "Tijuana, B.C.",
    venue: "",
    fighters: [""],
    ticket_link: "",
    is_featured: false,
    event_type: "live_video" as EventType,
    stream_url: "",
    description: "",
  });
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string>("");

  // Live stream form
  const [streamData, setStreamData] = useState({
    title: "",
    stream_url: "",
    scheduled_start: "",
  });

 useEffect(() => {
  if (!hasFetched.current) {
    fetchEvents();
    fetchLiveStream();
    hasFetched.current = true;
  }

  // ----------------------------------------
  // COUNTDOWN INTERVAL
  // ----------------------------------------
  const interval = setInterval(() => {
    if (nextEvent) {
      setTimeLeft(getTimeLeft(nextEvent.event_date));
    }
  }, 1000);

  // ----------------------------------------
  // REALTIME SUBSCRIPTION FOR EVENTS
  // ----------------------------------------
  const channel = supabase
    .channel("events-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "events" },
      () => {
        fetchEvents();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
    clearInterval(interval);
  };
}, [nextEvent]); // IMPORTANT: countdown re-evaluates when nextEvent changes


  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);

      // Determine next upcoming event
const upcoming = (data || []).filter((e: Event) => !e.is_past);

if (upcoming.length > 0) {
  const sorted = upcoming.sort(
    (a: Event, b: Event) =>
      new Date(a.event_date).getTime() -
      new Date(b.event_date).getTime()
  );

  setNextEvent(sorted[0]); // soonest upcoming event
} else {
  setNextEvent(null);
}


    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLiveStream() {
    try {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error && (error as any).code !== "PGRST116") throw error;
      setLiveStream(data);
    } catch (err) {
      console.error("Error fetching live stream:", err);
    }
  }

  async function uploadFlyer(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("event-flyers")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("event-flyers").getPublicUrl(filePath);

    return publicUrl;
  }

  async function handleSubmitEvent(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);

    try {
      let flyerUrl = editingEvent?.flyer_url;

      // Upload new flyer if provided
      if (flyerFile) {
        flyerUrl = await uploadFlyer(flyerFile);
      }

      // Upload new flyer if provided
if (flyerFile) {
  flyerUrl = await uploadFlyer(flyerFile);
}

// ------------------------------------------
// FIX: Normalize event_date BEFORE building eventData
// ------------------------------------------
const dateObj = new Date(formData.event_date);
const isoDateOnly =
  dateObj.getFullYear() +
  "-" +
  String(dateObj.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(dateObj.getDate()).padStart(2, "0");

// ------------------------------------------
// Build final event payload (correct date)
// ------------------------------------------
const eventData = {
  title: formData.title,
  event_date: isoDateOnly, // <-- FIXED DATE
  location: formData.location,
  venue: formData.venue || null,
  fighters: formData.fighters
    .filter((f) => f.trim())
    .map((name) => ({ name })),
  flyer_url: flyerUrl,
  ticket_link: formData.ticket_link || null,
  is_featured: formData.is_featured,
  event_type: formData.event_type,
  stream_url: formData.stream_url || null,
  description: formData.description || null,
};

      if (editingEvent) {
        // Update
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", editingEvent.id);

        if (error) throw error;
        alert("✅ Evento actualizado exitosamente");
      } else {
        // Create
        const { error } = await supabase.from("events").insert([eventData]);

        if (error) throw error;
        alert("✅ Evento creado exitosamente");
      }

      resetForm();
      setShowEventModal(false);
      fetchEvents();
    } catch (err: any) {
      console.error("Error saving event:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;

    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId);

      if (error) throw error;
      alert("✅ Evento eliminado");
      fetchEvents();
    } catch (err: any) {
      console.error("Error deleting event:", err);
      alert(`❌ Error: ${err.message}`);
    }
  }

  async function handleTogglePastEvent(eventId: string, isPast: boolean) {
    try {
      const { error } = await supabase
        .from("events")
        .update({ is_past: !isPast })
        .eq("id", eventId);

      if (error) throw error;
      fetchEvents();
    } catch (err) {
      console.error("Error toggling past event:", err);
    }
  }

  async function handleSaveLiveStream(e: React.FormEvent) {
    e.preventDefault();

    try {
      // Deactivate current stream
      if (liveStream) {
        await supabase
          .from("live_streams")
          .update({ is_active: false })
          .eq("id", liveStream.id);
      }

      // Insert new active stream
      const { error } = await supabase.from("live_streams").insert([
        {
          title: streamData.title,
          stream_url: streamData.stream_url,
          is_active: true,
          scheduled_start: streamData.scheduled_start || null,
        },
      ]);

      if (error) throw error;
      alert("✅ Transmisión en vivo actualizada");
      setShowStreamModal(false);
      fetchLiveStream();
      setStreamData({ title: "", stream_url: "", scheduled_start: "" });
    } catch (err: any) {
      console.error("Error saving stream:", err);
      alert(`❌ Error: ${err.message}`);
    }
  }

  async function handleDeactivateStream() {
    if (!liveStream) return;

    try {
      const { error } = await supabase
        .from("live_streams")
        .update({ is_active: false })
        .eq("id", liveStream.id);

      if (error) throw error;
      alert("✅ Transmisión desactivada");
      fetchLiveStream();
    } catch (err: any) {
      console.error("Error deactivating stream:", err);
      alert(`❌ Error: ${err.message}`);
    }
  }

  function resetForm() {
    setFormData({
      title: "",
      event_date: "",
      location: "Tijuana, B.C.",
      venue: "",
      fighters: [""],
      ticket_link: "",
      is_featured: false,
      event_type: "live_video" as EventType,
      stream_url: "",
      description: "",
    });
    setFlyerFile(null);
    setFlyerPreview("");
    setEditingEvent(null);
  }

  function handleEditEvent(event: Event) {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      event_date: event.event_date.split("T")[0],
      location: event.location,
      venue: event.venue || "",
      fighters: event.fighters.map((f) => f.name),
      ticket_link: event.ticket_link || "",
      is_featured: event.is_featured,
      event_type: event.event_type || "live_video",
      stream_url: event.stream_url || "",
      description: event.description || "",
    });
    setFlyerPreview(event.flyer_url || "");
    setShowEventModal(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFlyerFile(file);
      setFlyerPreview(URL.createObjectURL(file));
    }
  }

  function addFighterField() {
    setFormData({ ...formData, fighters: [...formData.fighters, ""] });
  }

  function removeFighterField(index: number) {
    setFormData({
      ...formData,
      fighters: formData.fighters.filter((_, i) => i !== index),
    });
  }

  function updateFighter(index: number, value: string) {
    const updated = [...formData.fighters];
    updated[index] = value;
    setFormData({ ...formData, fighters: updated });
  }

  // -----------------------------
  // FIGHTER REGISTRATION HANDLERS
  // -----------------------------
  async function openRegistrationsModal(event: Event) {
    setSelectedEventRegistrations(event);
    setShowRegistrationsModal(true);
    setLoadingRegistrations(true);

    try {
      const response = await fetch(`/api/fighter-registration?event_id=${event.id}`);
      const result = await response.json();

      if (response.ok) {
        setRegistrations(result.data || []);
      } else {
        console.error("Error fetching registrations:", result.error);
        alert("Error al cargar los registros");
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      alert("Error al cargar los registros");
    } finally {
      setLoadingRegistrations(false);
    }
  }

  function closeRegistrationsModal() {
    setShowRegistrationsModal(false);
    setSelectedEventRegistrations(null);
    setRegistrations([]);
  }

  async function handleUpdateRegistrationStatus(registrationId: string, status: string) {
    try {
      const response = await fetch("/api/fighter-registration", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registration_id: registrationId, status }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Registro ${status === "approved" ? "aprobado" : "rechazado"} exitosamente`);
        // Refresh registrations
        if (selectedEventRegistrations) {
          openRegistrationsModal(selectedEventRegistrations);
        }
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating registration:", error);
      alert("Error al actualizar el registro");
    }
  }

  async function handleDeleteRegistration(registrationId: string) {
    if (!confirm("¿Estás seguro de eliminar este registro?")) return;

    try {
      const response = await fetch(`/api/fighter-registration?registration_id=${registrationId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        alert("Registro eliminado exitosamente");
        // Refresh registrations
        if (selectedEventRegistrations) {
          openRegistrationsModal(selectedEventRegistrations);
        }
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting registration:", error);
      alert("Error al eliminar el registro");
    }
  }

  // -----------------------------
  // FILTERED EVENTS
  // -----------------------------
    // -----------------------------
  // FILTERED + SEARCHED EVENTS
  // -----------------------------
  const filteredEvents = events
    // first: filter by status (all / upcoming / past / featured)
    .filter((event) => {
      if (filter === "upcoming") return !event.is_past;
      if (filter === "past") return event.is_past;
      if (filter === "featured") return event.is_featured;
      return true; // all
    })
    // second: apply text search (title, location, venue, fighters)
    .filter((event) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;

      const inTitle = event.title.toLowerCase().includes(q);
      const inLocation = event.location.toLowerCase().includes(q);
      const inVenue = (event.venue || "").toLowerCase().includes(q);
      const inFighters = event.fighters.some((f) =>
        f.name.toLowerCase().includes(q)
      );

      return inTitle || inLocation || inVenue || inFighters;
    });

  if (loading) {
    return (
      <div className="text-center text-white py-20">Cargando eventos...</div>
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-blue flex items-center gap-2">
          <Calendar className="w-7 h-7 text-brand-red" /> Gestión de Eventos
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowStreamModal(true)}
            className="px-4 py-2 bg-brand-blue/20 border border-brand-blue rounded-lg hover:bg-brand-blue/30 transition text-sm"
          >
            📡 Gestionar Transmisión
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowEventModal(true);
            }}
            className="px-4 py-2 bg-brand-red/20 border border-brand-red rounded-lg hover:bg-brand-red/30 transition flex items-center gap-2"
          >
            <RiVideoAddFill className="w-4 h-4" /> Nuevo Evento
          </button>
        </div>
      </div>


{/* Featured Hero + Countdown */}
{nextEvent && (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="relative mb-10 rounded-xl overflow-hidden border border-brand-blue/40 shadow-lg"
  >
    {/* Background Image */}
    {nextEvent.flyer_url && (
      <div className="relative h-60 w-full">
        <Image
          src={nextEvent.flyer_url}
          alt={nextEvent.title}
          fill
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90"></div>
      </div>
    )}

    {/* Content */}
    <div className="absolute inset-0 p-6 flex flex-col justify-end">
      <div className="flex items-center gap-2 mb-1">
        <span className="px-2 py-1 bg-brand-red text-white text-[10px] rounded-md uppercase tracking-wide">
          Próximo Evento
        </span>
        {nextEvent.is_featured && (
          <span className="px-2 py-1 bg-yellow-500 text-black text-[10px] rounded-md font-bold">
            ⭐ Destacado
          </span>
        )}
      </div>

      <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">
        {nextEvent.title}
      </h2>

      <p className="text-sm text-gray-300 flex items-center gap-1 mt-1">
        <Calendar className="w-4 h-4" />
        {new Date(nextEvent.event_date).toLocaleDateString("es-MX", {
          timeZone: "America/Tijuana",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="text-sm text-gray-300 flex items-center gap-1">
        <MapPin className="w-4 h-4" /> {nextEvent.location}
      </p>

      {/* Countdown */}
      <div className="mt-4 flex gap-3 text-center">
        {["days", "hours", "minutes", "seconds"].map((key) => (
          <div
            key={key}
            className="px-3 py-2 bg-black/40 border border-brand-blue/40 rounded-lg"
          >
            <div className="text-lg font-bold text-brand-blue">
              {timeLeft[key as keyof typeof timeLeft]
                .toString()
                .padStart(2, "0")}
            </div>
            <div className="text-[10px] uppercase text-gray-400">
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
  </motion.div>
)}

      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              filter === "all"
                ? "bg-brand-blue text-white border-brand-blue"
                : "bg-black/40 text-gray-300 border-gray-700 hover:bg-brand-blue/20"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              filter === "upcoming"
                ? "bg-emerald-500/80 text-black border-emerald-400"
                : "bg-black/40 text-gray-300 border-gray-700 hover:bg-emerald-500/20"
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              filter === "past"
                ? "bg-yellow-500/80 text-black border-yellow-400"
                : "bg-black/40 text-gray-300 border-gray-700 hover:bg-yellow-500/20"
            }`}
          >
            Pasados
          </button>
          <button
            onClick={() => setFilter("featured")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              filter === "featured"
                ? "bg-purple-500/80 text-black border-purple-400"
                : "bg-black/40 text-gray-300 border-gray-700 hover:bg-purple-500/20"
            }`}
          >
            Destacados ⭐
          </button>
        </div>

        {/* Search + count */}
        <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, peleador, venue..."
              className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded-lg text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <p className="text-[11px] text-gray-400">
            Mostrando{" "}
            <span className="font-semibold text-brand-blue">
              {filteredEvents.length}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-brand-red">
              {events.length}
            </span>{" "}
            eventos
          </p>
        </div>
      </div>

      {/* Live Stream Status */}
      {liveStream && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/40 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-green-400 font-semibold"> 
              <GiFilmProjector className="text-3x" />
              
              Transmisión Activa</p>
            <p className="text-sm text-gray-300">{liveStream.title}</p>
          </div>
          <button
            onClick={handleDeactivateStream}
            className="px-3 py-1 bg-red-500/20 border border-red-500 rounded text-sm hover:bg-red-500/30 transition"
          >
            Desactivar
          </button>
        </div>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-black/60 rounded-xl shadow-lg overflow-hidden border border-gray-800 hover:border-brand-blue transition"
          >
            {event.flyer_url && (
              <div className="relative h-64 w-full">
                <Image
                  src={event.flyer_url}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                {event.is_featured && (
                  <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                    ⭐ Destacado
                  </span>
                )}
                {event.is_past && (
                  <span className="absolute bottom-2 left-2 bg-black/70 text-yellow-300 text-[11px] px-2 py-1 rounded-full border border-yellow-400/60">
                    Evento pasado
                  </span>
                )}
              </div>
            )}

            <div className="p-4">
              <h3 className="font-heading text-xl text-brand-white mb-2">
                {event.title}
              </h3>
              <p className="text-sm text-gray-400 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(event.event_date).toLocaleDateString("es-MX", {
                  timeZone: "America/Tijuana",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-400 flex items-center gap-1 mb-3">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}
              </p>

              {event.fighters.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-amber-300 mb-1">Peleadores:</p>
                  <div className="flex flex-wrap gap-1">
                    {event.fighters.map((f, i) => (
                      <span
                        key={i}
                        className="text-xs bg-brand-red/20 text-brand-red px-2 py-0.5 rounded"
                      >
                        {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => openRegistrationsModal(event)}
                  className="w-full px-3 py-2 bg-purple-500/20 border border-purple-500 rounded text-sm hover:bg-purple-500/30 transition flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" /> Ver Registros de Peleadores
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="flex-1 px-3 py-1.5 bg-brand-blue/20 border border-brand-blue rounded text-sm hover:bg-brand-blue/30 transition flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() =>
                      handleTogglePastEvent(event.id, event.is_past)
                    }
                    className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500 rounded text-sm hover:bg-yellow-500/30 transition"
                  >
                    {event.is_past ? "Próximo" : "Pasado"}
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="px-3 py-1.5 bg-red-500/20 border border-red-500 rounded text-sm hover:bg-red-500/30 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay eventos para este filtro.</p>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-heading text-brand-red">
                {editingEvent ? "Editar Evento" : "Nuevo Evento"}
              </h2>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvent} className="space-y-4">
              {/* Event Type Selector */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tipo de Evento *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, event_type: 'live_video' })}
                    className={`px-4 py-3 rounded-lg border-2 transition text-sm font-semibold ${
                      formData.event_type === 'live_video'
                        ? 'bg-brand-red/20 border-brand-red text-brand-red'
                        : 'bg-black/40 border-gray-700 text-gray-400 hover:border-brand-red/50'
                    }`}
                  >
                    Video en Vivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, event_type: 'belt_ranking' })}
                    className={`px-4 py-3 rounded-lg border-2 transition text-sm font-semibold ${
                      formData.event_type === 'belt_ranking'
                        ? 'bg-brand-blue/20 border-brand-blue text-brand-blue'
                        : 'bg-black/40 border-gray-700 text-gray-400 hover:border-brand-blue/50'
                    }`}
                  >
                    Examen de Cinta
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, event_type: 'announcement' })}
                    className={`px-4 py-3 rounded-lg border-2 transition text-sm font-semibold ${
                      formData.event_type === 'announcement'
                        ? 'bg-gray-500/20 border-gray-500 text-gray-300'
                        : 'bg-black/40 border-gray-700 text-gray-400 hover:border-gray-500/50'
                    }`}
                  >
                    Anuncio
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  <GiTrophy className="w-8 h-8 text-amber-300"/>
                  Título del Evento *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    <GiCalendar className="w-8 h-8 text-blue-700"/>
                    Fecha y Hora *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) =>
                      setFormData({ ...formData, event_date: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    <MdOutlineAddLocationAlt className="w-8 h-8 text-rose-800"/>
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              {/* Venue - Only for live_video */}
              {formData.event_type === 'live_video' && (
                <div>
                  <label className="block text-sm font-semibold mb-1">Venue</label>
                  <GiBoxingRing className="w-8 h-8 text-red-700"/>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) =>
                      setFormData({ ...formData, venue: e.target.value })
                    }
                    placeholder="Ej: Rancho Santa Fe"
                    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              )}

              {/* Stream URL - Only for live_video */}
              {formData.event_type === 'live_video' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    URL de Transmision en Vivo
                  </label>
                  <div className="flex items-center gap-4 md:gap-8 text-2xl md:text-2xl mb-3">
                    <ImYoutube2 className="text-red-600" aria-hidden="true" />
                    <SiTiktok className="text-black" aria-hidden="true" />
                    <SiFacebooklive className="text-blue-600" aria-hidden="true" />
                  </div>
                  <input
                    type="url"
                    value={formData.stream_url}
                    onChange={(e) =>
                      setFormData({ ...formData, stream_url: e.target.value })
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              )}

              {/* Fighters - Only for live_video */}
              {formData.event_type === 'live_video' && (
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    <GiHighPunch className="w-8 h-8 text-rose-100"/>
                    Peleadores
                  </label>
                  {formData.fighters.map((fighter, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={fighter}
                        onChange={(e) => updateFighter(idx, e.target.value)}
                        placeholder="Nombre del peleador"
                        className="flex-1 px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                      {formData.fighters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFighterField(idx)}
                          className="px-3 py-2 bg-red-500/20 border border-red-500 rounded hover:bg-red-500/30"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFighterField}
                    className="text-sm text-brand-blue hover:underline"
                  >
                    <GiPunch className="w-8 h-8 text-red-800"/>
                    + Agregar peleador
                  </button>
                </div>
              )}

              {/* Ticket Link - Only for live_video */}
              {formData.event_type === 'live_video' && (
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    <GiTicket className="w-8 h-8 text-yellow-300" />
                    Link de Boletos
                  </label>
                  <input
                    type="url"
                    value={formData.ticket_link}
                    onChange={(e) =>
                      setFormData({ ...formData, ticket_link: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              )}

              {/* Description - For belt_ranking and announcement */}
              {(formData.event_type === 'belt_ranking' || formData.event_type === 'announcement') && (
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    {formData.event_type === 'belt_ranking' ? 'Requisitos / Detalles' : 'Descripcion'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder={formData.event_type === 'belt_ranking'
                      ? 'Ej: Los estudiantes deben traer...'
                      : 'Descripcion del anuncio...'}
                    rows={4}
                    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                  />
                </div>
              )}

              {/* Flyer - Only for live_video */}
              {formData.event_type === 'live_video' && (
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    <RiImageAddFill className="w-8 h-8 text-purple-200"/>
                    Flyer del Evento
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                  {flyerPreview && (
                    <div className="mt-3 relative h-40 w-full">
                      <Image
                        src={flyerPreview}
                        alt="Preview"
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData({ ...formData, is_featured: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="featured" className="text-sm">
                  Marcar como destacado
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-brand-red rounded hover:bg-brand-red/80 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    "Guardando..."
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Guardar Evento
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Fighter Registrations Modal */}
      {showRegistrationsModal && selectedEventRegistrations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-purple-500"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-heading text-purple-400 flex items-center gap-2">
                  <Users className="w-6 h-6" /> Registros de Peleadores
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedEventRegistrations.title}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedEventRegistrations.event_date).toLocaleDateString("es-MX", {
                    timeZone: "America/Tijuana",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={closeRegistrationsModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {loadingRegistrations ? (
              <div className="text-center py-10 text-gray-400">
                Cargando registros...
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No hay registros para este evento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {reg.fighter_name}
                        </h3>
                        <p className="text-sm text-gray-400">{reg.email}</p>
                        <p className="text-sm text-gray-400">{reg.phone}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          reg.status === "approved"
                            ? "bg-green-500/20 text-green-400 border border-green-500"
                            : reg.status === "rejected"
                            ? "bg-red-500/20 text-red-400 border border-red-500"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500"
                        }`}
                      >
                        {reg.status === "approved"
                          ? "Aprobado"
                          : reg.status === "rejected"
                          ? "Rechazado"
                          : "Pendiente"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 text-sm">
                      {reg.birth_date && (
                        <div>
                          <span className="text-gray-500">Fecha Nac.:</span>
                          <span className="text-white ml-1">{new Date(reg.birth_date).toLocaleDateString("es-MX")}</span>
                        </div>
                      )}
                      {reg.age && (
                        <div>
                          <span className="text-gray-500">Edad:</span>
                          <span className="text-white ml-1">{reg.age} años</span>
                        </div>
                      )}
                      {reg.height_cm && (
                        <div>
                          <span className="text-gray-500">Estatura:</span>
                          <span className="text-white ml-1">{reg.height_cm} cm</span>
                        </div>
                      )}
                      {reg.weight_class && (
                        <div>
                          <span className="text-gray-500">Peso:</span>
                          <span className="text-white ml-1">{reg.weight_class} kg</span>
                        </div>
                      )}
                      {reg.training_duration && (
                        <div>
                          <span className="text-gray-500">Tiempo C.A.M.:</span>
                          <span className="text-white ml-1">{reg.training_duration}</span>
                        </div>
                      )}
                      {reg.combat_modality && (
                        <div>
                          <span className="text-gray-500">Modalidad:</span>
                          <span className="text-white ml-1 capitalize">{reg.combat_modality}</span>
                        </div>
                      )}
                      {reg.gym_affiliation && (
                        <div className="col-span-2 md:col-span-3">
                          <span className="text-gray-500">Gimnasio:</span>
                          <span className="text-white ml-1">{reg.gym_affiliation}</span>
                        </div>
                      )}
                    </div>

                    {reg.health_conditions && (
                      <div className="mb-3 bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                        <p className="text-xs text-yellow-400 font-semibold mb-1">Condiciones de Salud:</p>
                        <p className="text-sm text-gray-300">{reg.health_conditions}</p>
                      </div>
                    )}

                    {reg.liability_waiver_accepted && (
                      <div className="mb-3 bg-green-500/10 border border-green-500/30 rounded p-2">
                        <p className="text-xs text-green-400 font-semibold">
                          Descargo de responsabilidad aceptado
                          {reg.waiver_accepted_at && (
                            <span className="text-gray-400 font-normal ml-2">
                              ({new Date(reg.waiver_accepted_at).toLocaleDateString("es-MX")})
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-gray-700">
                      <button
                        onClick={() => handleUpdateRegistrationStatus(reg.id, "approved")}
                        disabled={reg.status === "approved"}
                        className="flex-1 px-3 py-2 bg-green-500/20 border border-green-500 rounded text-sm hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleUpdateRegistrationStatus(reg.id, "rejected")}
                        disabled={reg.status === "rejected"}
                        className="flex-1 px-3 py-2 bg-red-500/20 border border-red-500 rounded text-sm hover:bg-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => handleDeleteRegistration(reg.id)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm hover:bg-gray-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-600 mt-2">
                      Registrado: {new Date(reg.created_at).toLocaleDateString("es-MX")} -{" "}
                      {new Date(reg.created_at).toLocaleTimeString("es-MX")}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Live Stream Modal */}
      {showStreamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-heading text-brand-blue">
                <MdOutlineLiveTv className="text-3x" />
                Transmisión en Vivo
              </h2>
              <button
                onClick={() => setShowStreamModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveLiveStream} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={streamData.title}
                  onChange={(e) =>
                    setStreamData({ ...streamData, title: e.target.value })
                  }
                  required
                  placeholder="Ej: Transmisión en Vivo - Evento Principal"
                  className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div>
  <label className="block text-sm font-semibold mb-2 text-gray-300">
    URL de transmisión en vivo
  </label>

  {/* Beautiful icon row — exactly what you asked for */}
  <div className="flex items-center gap-4 md:gap-8 text-2xl md:text-2xl mb-3">
    <ImYoutube2 className="text-red-600" aria-hidden="true" />
    <SiTiktok className="text-black" aria-hidden="true" />
    <SiFacebooklive className="text-blue-600" aria-hidden="true" />
  </div>

  <input
    type="url"
    value={streamData.stream_url}
    onChange={(e) =>
      setStreamData({
        ...streamData,
        stream_url: e.target.value,
      })
    }
    required
    placeholder="https://www.youtube.com/watch?v=... o tiktok.com/live/... o fb.com/live/..."
    className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none transition-all"
  />
</div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  <FcStart className="text-3xl"/>
                  Inicio Programado
                </label>
                <input
                  type="datetime-local"
                  value={streamData.scheduled_start}
                  onChange={(e) =>
                    setStreamData({
                      ...streamData,
                      scheduled_start: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStreamModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-blue rounded hover:bg-brand-blue/80 transition"
                >
                  Activar Transmisión
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
