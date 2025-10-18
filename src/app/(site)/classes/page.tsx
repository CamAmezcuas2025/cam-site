"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./classesCards.module.css";
import { Flame, Shield, Infinity, Heart, Zap } from "lucide-react";




// Dynamic config (flat filenames under /public/images/classes/)
const classData = [
  { title: "Limalama", folder: "limalama", count: 14 },
  { title: "Boxeo", folder: "boxing", count: 8 },
  { title: "Jiu Jitsu", folder: "jiujitsu", count: 6 },
  { title: "Kickboxing / MMA", folder: "kickboxing", count: 9 },
  { title: "Karate Kids", folder: "karatekids", count: 11 },
];

// Build base paths (all .jpeg files)
const getBasePaths = (folder: string, count: number) =>
  Array.from({ length: count }, (_, i) => `/images/classes/${folder}${i + 1}.jpeg`);

export default function ClassesPage() {
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    bases: string[];
    index: number;
    title: string;
  }>({ isOpen: false, bases: [], index: 0, title: "" });

  return (
    <main className="px-6 py-20 space-y-20">
      {/* Header */}
      <section className="text-center space-y-6">
        <h1 className="font-heading text-5xl md:text-6xl text-brand-red">
          Nuestras Clases
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-300">
          Explora las disciplinas que ofrecemos y vive la experiencia C.A.M
          Amezcuas.
        </p>
        {/* Top CTA */}
        <a
          href="/memberships"
          className="inline-block bg-brand-red text-white px-6 py-3 rounded-lg shadow-md hover:bg-brand-blue transition-colors font-heading text-lg"
        >
          INSCRÍBIRME YA!
        </a>
      </section>

      {/* Carousels per class */}
      {classData.map(({ title, folder, count }) => {
        const bases = getBasePaths(folder, count);
        return (
          <section key={folder} className="space-y-6">
            <h2 className="about-heading-blue text-center">{title}</h2>

            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="max-w-6xl mx-auto"
            >
              {bases.map((src, i) => (
                <SwiperSlide key={src}>
                  <div
                    className="relative cursor-pointer group bg-black/60 rounded-xl shadow-lg overflow-hidden border border-gray-800"
                    onClick={() =>
                      setLightbox({ isOpen: true, bases, index: i, title })
                    }
                  >
                    <img
                      src={src}
                      alt={`${title} ${i + 1}`}
                      className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-brand-white font-heading text-lg">
                        Ver Foto
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        );
      })}

      {/* Horarios de Clases */}
      {/* Modern Schedule Cards */}
<section className="max-w-6xl mx-auto text-center space-y-10">
  <h2 className="about-heading-red">⏰ Horarios de Clases</h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {/* BOXEO */}
    <div className={styles.cardDark}>
  <div className={styles.iconTitle}>
    <Zap className={styles.icon} />
    <h3 className="text-brand-red font-heading text-2xl mb-2">Boxeo</h3>
  </div>
      <p className="text-brand-blue font-semibold mb-1">Lunes a Viernes</p>
      <ul className={styles.scheduleList}>
        <li><span>Matutino:</span> 7:00 am – 11:00 am</li>
        <li><span>Tarde:</span> 3:00 pm – 6:00 pm</li>
        <li><span>Noche:</span> 8:00 pm – 10:00 pm</li>
      </ul>
    </div>

    {/* KICKBOXING / MMA */}
    <div className={styles.cardDark}>
  <div className={styles.iconTitle}>
    <Flame className={styles.icon} />
    <h3 className="text-brand-red font-heading text-2xl mb-2">Kickboxing / MMA</h3>
  </div>
      <p className="text-brand-blue font-semibold mb-1">Lunes a Viernes</p>
      <ul className={styles.scheduleList}>
        <li><span>Matutino:</span> 7:00 am – 11:00 am</li>
        <li><span>Tarde / Noche:</span> 6:00 pm – 8:00 pm · 9:00 pm – 10:00 pm</li>
      </ul>
    </div>

    {/* JIU JITSU */}
    <div className={styles.cardDark}>
  <div className={styles.iconTitle}>
    <Infinity className={styles.icon} />
    <h3 className="text-brand-red font-heading text-2xl mb-2">Jiu Jitsu (No Gi)</h3>
  </div>
      <p className="text-brand-blue font-semibold mb-1">Lunes y Jueves</p>
      <ul className={styles.scheduleList}>
        <li>6:00 pm – 7:00 pm</li>
      </ul>
    </div>

    {/* LIMALAMA */}
    <div className={styles.cardDark}>
  <div className={styles.iconTitle}>
    <Shield className={styles.icon} />
    <h3 className="text-brand-red font-heading text-2xl mb-2">Limalama Kombat</h3>
  </div>
      <p className="text-brand-blue font-semibold mb-1">Lunes a Viernes</p>
      <ul className={styles.scheduleList}>
        <li><span>Niños:</span> 4:00 pm – 5:00 pm</li>
        <li><span>Jóvenes / Adultos:</span> 6:00 pm – 8:00 pm</li>
      </ul>
    </div>

    {/* FITNESS STUDIO */}
    <div className={styles.cardLight}>
  <div className={styles.iconTitle}>
    <Heart className={`${styles.icon} text-pink-500`} />
    <h3 className="text-pink-500 font-heading text-2xl mb-2">CAM Fitness Studio</h3>
  </div>
      <p className="text-gray-700 font-semibold mb-1">Grupos Mixtos y para Mujeres</p>
      <ul className={styles.scheduleListLight}>
        <li><span>🪷1° Grupo (Mixto)🧘🏻‍♂️🧘🏻‍♀️:</span> 7:00 am – 8:00 am</li>
        <li><span>🪷2° Grupo (Mujeres)🧘🏻‍♀️🧘🏻:</span> 8:00 am – 9:00 am</li>
        <li><span>🪷3° Grupo (Mixto)🧘🏻‍♂️🧘🏻‍♀️:</span> 7:00 pm – 8:00 pm</li>
        <li><span>🪷4° Grupo (Mujeres)🧘🏻‍♀️🧘🏻:</span> 8:00 pm – 9:00 pm</li>
      </ul>
      <p className="text-pink-500 font-semibold mt-3">Traer tapete, agua y toalla</p>
    </div>
  </div>

  <p className="text-brand-blue font-semibold">
    ✅ Puedes entrar a todas las clases y aprender de todo
  </p>
</section>


      {/* Bottom CTA */}
      <section className="text-center">
        <p className="text-lg text-gray-300 mb-4">
          Regístrate hoy y comienza tu entrenamiento
        </p>
        <a
          href="/memberships"
          className="bg-brand-red text-white px-6 py-3 rounded-lg shadow-md hover:bg-brand-blue transition-colors font-heading text-lg"
        >
          INSCRÍBIRME YA!
        </a>
      </section>

      {/* Brand-styled Lightbox */}
      {lightbox.isOpen && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4">
          {/* Close */}
          <button
            className="absolute top-6 right-6 bg-brand-red text-white px-3 py-1 rounded-full text-2xl shadow-lg hover:bg-brand-blue transition-colors"
            onClick={() => setLightbox({ ...lightbox, isOpen: false })}
            aria-label="Cerrar"
          >
            ✕
          </button>

          {/* Prev */}
          <button
            className="absolute left-4 text-5xl bg-brand-blue text-white px-3 py-2 rounded-full shadow-lg hover:bg-brand-red transition-colors"
            onClick={() =>
              setLightbox((prev) => ({
                ...prev,
                index: (prev.index - 1 + prev.bases.length) % prev.bases.length,
              }))
            }
            aria-label="Anterior"
          >
            ‹
          </button>

          {/* Image */}
          <div className="max-w-[90vw] max-h-[85vh]">
            <img
              src={lightbox.bases[lightbox.index]}
              alt={lightbox.title}
              className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-2xl border-4 border-brand-red"
            />
            <p className="text-center text-gray-300 mt-4">{lightbox.title}</p>
          </div>

          {/* Next */}
          <button
            className="absolute right-4 text-5xl bg-brand-blue text-white px-3 py-2 rounded-full shadow-lg hover:bg-brand-red transition-colors"
            onClick={() =>
              setLightbox((prev) => ({
                ...prev,
                index: (prev.index + 1) % prev.bases.length,
              }))
            }
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>
      )}
    </main>
  );
}
