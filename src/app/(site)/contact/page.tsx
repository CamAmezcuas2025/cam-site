"use client";
import { useState } from "react";
import { IoIosPhonePortrait, IoMdClock } from "react-icons/io";
import { GrSend } from "react-icons/gr";
import { FaMapLocationDot } from "react-icons/fa6";
import { TbWritingSign } from "react-icons/tb";
import { BiMessageAltEdit } from "react-icons/bi";
import { BsMailbox2 } from "react-icons/bs";
import { GiPunchingBag } from "react-icons/gi";

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

    try {
      const res = await fetch("/api/send-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hp,
        }),
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.error || "Error");

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setError("No se pudo enviar el mensaje. Inténtalo de nuevo.");
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 3500);
    }
  }

  return (
    <section className="pt-28 md:pt-36 pb-24 max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="mb-10 md:mb-14 text-center">
        <h1 className="font-heading text-5xl md:6xl text-brand-red mb-4">
          Contáctanos
        </h1>
        <p className="text-lg text-gray-300 inline-flex items-center gap-2">
          Tu entrenamiento empieza con un mensaje
          <GiPunchingBag className="w-8 h-8 text-red-600" />
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-10">
        {/* Info */}
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
                <IoIosPhonePortrait className="text-brand-red mt-1" />
                <a href="tel:+526631038433" className="hover:underline">
                  +52 664 342 8308
                </a>
              </div>

              <div className="flex items-start gap-3">
                <GrSend className="text-brand-red mt-1" />
                <a href="mailto:amezcuastijuanafightingclub@gmail.com" className="hover:underline">
                  amezcuastijuanafightingclub@gmail.com
                </a>
              </div>

              <div className="flex items-start gap-3">
                <FaMapLocationDot className="text-brand-red mt-1" />
                <a
                  href="https://maps.google.com/?q=Centro de Artes Marciales Amezcuas Tijuana"
                  target="_blank"
                  className="hover:underline"
                >
                  Blvd. el Rosario 11012, Tijuana, B.C.
                </a>
              </div>

              <div className="flex items-start gap-3">
                <IoMdClock className="text-brand-red mt-1" />
                <p>Lunes a Sábado · 7:00am – 10:00pm</p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/5216631038433"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-heading text-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="relative rounded-3xl border border-gray-800 bg-black/60 p-8 md:p-10 shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-blue-900/10"></div>
          <div className="relative z-10">
            {status === "success" && (
              <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 animate-pulse">
                ¡Gracias! Tu mensaje fue enviado.
              </div>
            )}
            {status === "error" && (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 animate-pulse">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-5">
              {/* honeypot */}
              <input
                id="company"
                name="hp"
                type="text"
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="hidden"
              />

              <label className="grid gap-2">
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  <TbWritingSign className="text-brand-red" />
                  Nombre
                </span>
                <div className="flex items-center gap-3 rounded-xl border border-gray-700 bg-black/30 px-4 transition-all duration-300 hover:border-red-600/50 focus-within:border-red-600/50">
                  <TbWritingSign className="text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    className="w-full bg-transparent py-3 outline-none transition-colors"
                    required
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  <BsMailbox2 className="text-brand-red" />
                  Correo
                </span>
                <div className="flex items-center gap-3 rounded-xl border border-gray-700 bg-black/30 px-4 transition-all duration-300 hover:border-red-600/50 focus-within:border-red-600/50">
                  <BsMailbox2 className="text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-transparent py-3 outline-none transition-colors"
                    required
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  <BiMessageAltEdit className="text-brand-red" />
                  Mensaje
                </span>
                <div className="flex gap-3 rounded-xl border border-gray-700 bg-black/30 px-4 transition-all duration-300 hover:border-red-600/50 focus-within:border-red-600/50">
                  <BiMessageAltEdit className="mt-3 text-gray-400" />
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Escribe tu mensaje aquí..."
                    rows={5}
                    className="w-full bg-transparent py-3 outline-none resize-y transition-colors"
                    required
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-heading text-lg bg-gradient-to-r from-brand-red to-red-700 text-white hover:from-brand-blue hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <GrSend className="transition-transform duration-300 group-hover:rotate-12" />
                {status === "loading" ? "Enviando…" : "Enviar Mensaje"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
