"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Dynamic config (flat filenames under /public/images/classes/)
const classData = [
  { title: "Limalama", folder: "limalama", count: 14 },
  { title: "Boxeo", folder: "boxing", count: 8 },
  { title: "Jiu Jitsu", folder: "jiujitsu", count: 6 },
  { title: "Kickboxing / MMA", folder: "kickboxing", count: 9 },
  { title: "Karate Kids", folder: "karatekids", count: 11 },
];

// Build base paths WITHOUT extension (we’ll try .jpeg then .jpg)
const getBasePaths = (folder: string, count: number) =>
  Array.from({ length: count }, (_, i) => `/images/classes/${folder}${i + 1}`);

export default function ClassesPage() {
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    bases: string[]; // base paths without extension
    index: number;
    title: string;
  }>({ isOpen: false, bases: [], index: 0, title: "" });

  return (
    <main className="px-6 py-20 space-y-20">
      {/* Header */}
      <section className="text-center space-y-6">
        <h1 className="font-heading text-5xl md:text-6xl text-brand-red">Nuestras Clases</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-300">
          Explora las disciplinas que ofrecemos y vive la experiencia C.A.M Amezcuas.
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
              {bases.map((base, i) => (
                <SwiperSlide key={base}>
                  <div
                    className="relative cursor-pointer group bg-black/60 rounded-xl shadow-lg overflow-hidden border border-gray-800"
                    onClick={() =>
                      setLightbox({ isOpen: true, bases, index: i, title })
                    }
                  >
                    {/* Try .jpeg, fallback to .jpg */}
                    <img
                      src={`${base}.jpeg`}
                      alt={`${title} ${i + 1}`}
                      className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement & { dataset: any };
                        if (!el.dataset.fallbackTried) {
                          el.dataset.fallbackTried = "1";
                          el.src = `${base}.jpg`;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-brand-white font-heading text-lg">Ver Foto</span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        );
      })}

      {/* Horarios de Clases */}
      <section className="max-w-3xl mx-auto bg-black/60 border border-gray-800 rounded-xl shadow-lg p-8 text-center space-y-6">
        <h2 className="about-heading-red">⏰ Horarios de Clases</h2>

        <div>
          <h3 className="text-brand-red font-heading text-xl mb-2">Boxeo</h3>
          <p className="text-gray-300 font-semibold">Matutino</p>
          <p className="text-gray-400">7:00 am – 9:00 am</p>
          <p className="text-gray-400">10:00 am – 11:00 am</p>
          <p className="text-gray-300 font-semibold">Tarde / Noche</p>
          <p className="text-gray-400">5:00 pm – 6:00 pm</p>
        </div>

        <div>
          <h3 className="text-brand-red font-heading text-xl mb-2">Kickboxing / MMA</h3>
          <p className="text-gray-300 font-semibold">Matutino</p>
          <p className="text-gray-400">8:00 am – 9:00 am</p>
          <p className="text-gray-400">10:00 am – 11:00 am</p>
          <p className="text-gray-300 font-semibold mt-2">Tarde / Noche</p>
          <p className="text-gray-400">6:00 pm – 8:00 pm</p>
        </div>

        <div>
          <h3 className="text-brand-red font-heading text-xl mb-2">Jiu Jitsu</h3>
          <p className="text-gray-400">Lunes y Miércoles</p>
          <p className="text-gray-400">6:00 pm – 7:00 pm</p>
          <p className="text-gray-400">9:00 pm – 10:00 pm</p>
        </div>

        <div>
          <h3 className="text-brand-red font-heading text-xl mb-2">Clases de Sábados</h3>
          <p className="text-gray-400">8:00 am – 10:00 am</p>
        </div>

        <p className="text-brand-blue font-semibold mt-4">
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

      {/* Brand-styled Lightbox (uses same .jpeg → .jpg fallback) */}
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

          {/* Image with fallback */}
          <div className="max-w-[90vw] max-h-[85vh]">
            <img
              src={`${lightbox.bases[lightbox.index]}.jpeg`}
              alt={lightbox.title}
              className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-2xl border-4 border-brand-red"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement & { dataset: any };
                if (!el.dataset.fallbackTried) {
                  el.dataset.fallbackTried = "1";
                  el.src = `${lightbox.bases[lightbox.index]}.jpg`;
                }
              }}
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
