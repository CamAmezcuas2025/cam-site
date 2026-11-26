"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Hero from "../components/Hero";
import ClassCard from "../components/ClassCard";
import FAQ from "../components/FAQ";

export default function HomePage() {
  const classes = [
    { image: "/images/Boxeo.png", name: "Boxeo" },
    { image: "/images/MMA-Kickboxing.png", name: "MMA / Kickboxing" },
    { image: "/images/Limalama-KarateKombat.png", name: "Limalama / Karate Kombat" },
    { image: "/images/Jiu-Jitsu.svg", name: "Jiu Jitsu" },
    { image: "/images/KarateKids.png", name: "Karate Kids" },
    { image: "/images/GymFuncional.png", name: "Gym Funcional" },
  ];
  console.log("SUPABASE_URL =", process.env.NEXT_PUBLIC_SUPABASE_URL);
  return (
    <>
      <Hero />
      <div className="home-container">
        <header>
          <h1 className="site-title">Gimnasio de Artes Marciales en Tijuana - C.A.M. AMEZCUAS</h1>
          <p className="text-center text-gray-300 text-lg mb-6 px-4">
            El mejor gimnasio de artes marciales en Santa Fe, Tijuana. Clases de Boxeo, MMA, Kickboxing, Jiu Jitsu, Karate Kids y más.
          </p>
          <div className="mx-auto max-w-md" role="group" aria-labelledby="federations-heading">
            <h2 id="federations-heading" className="mb-4 text-base tracking-wider text-gray-400">
              Federaciones a las que pertenecemos
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              <Image
                src="/images/sneba-logo.jpeg"
                alt="SNEBA — Somos la Nueva Era del Boxeo Amateur"
                width={160}
                height={160}
                sizes="(min-width: 640px) 160px, 112px"
                className="h-28 w-28 object-contain sm:h-40 sm:w-40"
              />
              <Image
                src="/images/ICO-logo.jpeg"
                alt="ICO — International Combat Organisation, Región Norte"
                width={160}
                height={160}
                sizes="(min-width: 640px) 160px, 112px"
                className="h-28 w-28 object-contain sm:h-40 sm:w-40"
              />
            </div>
          </div>
        </header>
        <div className="mt-8 mb-12">
          <Link href="/memberships" className="inscribirme-btn">
            INSCRÍBIRME YA!
          </Link>
        </div>
        <section className="classes-swiper" aria-label="Clases de artes marciales">
          <h2 className="text-3xl font-bold text-center mb-8 text-red-600">Nuestras Clases</h2>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={3}
            loop={true} // Enables continuous looping
            autoplay={{ delay: 3000, disableOnInteraction: false }} // Auto-scrolls every 3s
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1.2, centeredSlides: true }, // Mobile: 1-2 visible
              640: { slidesPerView: 2 }, // Tablet: 2 visible
              1024: { slidesPerView: 3 }, // Desktop: 3 visible
            }}
            className="mySwiper"
          >
            {classes.map((cls, index) => (
              <SwiperSlide key={index}>
                <ClassCard image={cls.image} name={cls.name} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
        <section className="pricing-info" aria-label="Precios y mensualidades">
          <h2 className="text-2xl font-bold text-center mb-4 text-white">Precios Accesibles</h2>
          <Link href="/memberships" className="inscribirme-btn">
            Mensualidades en tan solo $950 pesos + inscripción
          </Link>
        </section>
      </div>
    </>
  );
}
