"use client";
import Link from "next/link";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Hero from "../components/Hero";
import ClassCard from "../components/ClassCard";

export default function HomePage() {
  const classes = [
    { image: "/images/Boxeo.png", name: "Boxeo" },
    { image: "/images/MMA-Kickboxing.png", name: "MMA / Kickboxing" },
    { image: "/images/Limalama-KarateKombat.png", name: "Limalama / Karate Kombat" },
    { image: "/images/Jiu-Jitsu.svg", name: "Jiu Jitsu" },
    { image: "/images/KarateKids.png", name: "Karate Kids" },
    { image: "/images/Yoga-Fit.png", name: "Yoga Fit" },
    { image: "/images/GymFuncional.png", name: "Gym Funcional" },
  ];
  console.log("SUPABASE_URL =", process.env.NEXT_PUBLIC_SUPABASE_URL);
  return (
    <>
      <Hero />
      <div className="home-container">
        <h1 className="site-title">C.A.M. AMEZCUAS</h1>
        <Link href="/memberships" className="inscribirme-btn">
          INSCRÍBIRME YA!
        </Link>
        <div className="classes-swiper">
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
        </div>
        <div className="pricing-info">
          <Link href="/memberships" className="inscribirme-btn">
            Mensualidades en tan solo $900 pesos + $400 pesos de inscripción
          </Link>
        </div>
      </div>
    </>
  );
}