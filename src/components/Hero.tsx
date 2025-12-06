"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Hero() {
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const video = document.getElementById("hero-video") as HTMLVideoElement | null;
    if (!video) return;

    const triggerReady = () => setIsVideoReady(true);

    video.addEventListener("loadeddata", triggerReady);
    video.addEventListener("canplaythrough", triggerReady);

    video.muted = true;
    (video as any).defaultMuted = true;
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("loadeddata", triggerReady);
      video.removeEventListener("canplaythrough", triggerReady);
    };
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Poster: next/image restored */}
      <div
        className="absolute top-0 left-0 w-full h-full transition-opacity duration-700"
        style={{ opacity: isVideoReady ? 0 : 1 }}
      >
        <Image
          src="/images/hero-poster.webp"
          alt="C.A.M Amezcuas entrenamiento en Tijuana"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Background video */}
      <video
        id="hero-video"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/images/hero-poster.webp"
        onLoadedData={() => setIsVideoReady(true)}
        onCanPlayThrough={() => setIsVideoReady(true)}
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/25" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="font-heading text-4xl md:text-7xl font-extrabold text-white mb-0"
        >
          <span className="text-red-600">C.A.M</span>{" "}
          <span className="text-white">Amezcuas</span>
        </motion.h1>

        <span className="text-blue-600 text-2xl sm:text-3xl md:text-7xl font-semibold underline mt-[-4px]">
          EL C.A.M DE CAMPEONES
        </span>
      </div>

      {/* Gloves bounce */}
      <div className="absolute bottom-8 w-full flex justify-center z-10">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Image
            src="/images/glove.png"
            alt="Desplázate hacia abajo"
            width={200}
            height={200}
            className="w-16 h-16 md:w-60 md:h-60 object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}
