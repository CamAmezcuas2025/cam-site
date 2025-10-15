"use client";
import { useState } from "react";
import {
  FiUser,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiMapPin,
  FiClock,
  FiSend,
} from "react-icons/fi";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [hp, setHp] = useState(""); // honeypot

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    if (hp.trim() !== "") {
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 2500);
      return;
    }

    try {
      // Freeform
      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      data.append("message", form.message);
      data.append("_subject", "Nuevo mensaje de C.A.M Amezcuas");
      data.append("_origin", "camamezcuas.com");

      await fetch("https://formspree.io/f/yourFormIdHere", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      // WhatsApp API (placeholder)
      await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setError("No se pudo enviar el mensaje. Inténtalo de nuevo.");
      setStatus("error");
    } finally {
      if (status !== "error") setTimeout(() => setStatus("idle"), 3500);
    }
  }

  return (
    <section className="pt-28 md:pt-36 pb-24 max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="mb-10 md:mb-14 text-center">
        <h1 className="font-heading text-5xl md:text-6xl text-brand-red mb-4">
          Contáctanos
        </h1>
        <p className="text-lg text-gray-300">
          Tu entrenamiento empieza con un mensaje 👊🔥
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-10">
        {/* Info panel */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-black/60 p-8 md:p-10 shadow-lg">
          <div className="space-y-6">
            <h2 className="text-2xl font-heading text-brand-blue">
              C.A.M Amezcuas
            </h2>
            <p className="text-gray-300">
              Santa Fe, Tijuana — Entrena con nosotros y lleva tu nivel más allá.
            </p>

            <div className="grid gap-4 text-gray-300">
              <div className="flex items-start gap-3">
                <FiPhone className="text-brand-red mt-1" />
                <a href="tel:+526643428308" className="hover:underline">
                  +52 664 342 8308
                </a>
              </div>
              <div className="flex items-start gap-3">
                <FiMail className="text-brand-red mt-1" />
                <a
                  href="mailto:amezcuastijuanafightingclub@gmail.com"
                  className="hover:underline"
                >
                  amezcuastijuanafightingclub@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <FiMapPin className="text-brand-red mt-1" />
                <a
                  href="https://maps.google.com/?q=Centro de Artes Marciales Amezcuas Tijuana"
                  target="_blank"
                  className="hover:underline"
                >
                  Blvd. el Rosario 11012, Tijuana, B.C.
                </a>
              </div>
              <div className="flex items-start gap-3">
                <FiClock className="text-brand-red mt-1" />
                <p>Lunes a Sábado · 7:00am – 10:00pm</p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/5216643428308"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-heading text-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="relative rounded-3xl border border-gray-800 bg-black/60 p-8 md:p-10 shadow-lg">
          {status === "success" && (
            <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              ¡Gracias! Tu mensaje fue enviado.
            </div>
          )}
          {status === "error" && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5">
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="off"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              className="hidden"
            />

            <label className="grid gap-2">
              <span className="text-sm text-gray-300">Nombre</span>
              <div className="flex items-center gap-3 rounded-xl border border-gray-700 bg-black/30 px-4">
                <FiUser className="text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  className="w-full bg-transparent py-3 outline-none"
                  required
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-gray-300">Correo</span>
              <div className="flex items-center gap-3 rounded-xl border border-gray-700 bg-black/30 px-4">
                <FiMail className="text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-transparent py-3 outline-none"
                  required
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-gray-300">Mensaje</span>
              <div className="flex gap-3 rounded-xl border border-gray-700 bg-black/30 px-4">
                <FiMessageCircle className="mt-3 text-gray-400" />
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Escribe tu mensaje aquí..."
                  rows={5}
                  className="w-full bg-transparent py-3 outline-none resize-y"
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-heading text-lg bg-brand-red text-white hover:bg-brand-blue transition-colors"
            >
              <FiSend />
              {status === "loading" ? "Enviando…" : "Enviar Mensaje"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
