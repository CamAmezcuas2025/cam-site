"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Hero() {
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const video = document.getElementById("hero-video") as HTMLVideoElement | null;
    if (!video) return;

    const onLoaded = () => setIsVideoReady(true);
    const onCanPlay = () => setIsVideoReady(true);

    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("canplaythrough", onCanPlay);

    // ensure autoplay on all browsers
    video.muted = true;
    (video as any).defaultMuted = true;
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("canplaythrough", onCanPlay);
    };
  }, []);

  return (
    <section
      className="relative w-full h-screen overflow-hidden"
      role="banner"
      aria-label="C.A.M Amezcuas Hero Section"
    >
      {/* Instant paint poster for LCP + SEO alt */}
      <img
        src="/images/hero-poster.webp"
        alt="C.A.M Amezcuas entrenamiento en Tijuana"
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${
          isVideoReady ? "opacity-0" : "opacity-100"
        }`}
        loading="eager"
        decoding="async"
      />

      {/* Background video (original file restored) */}
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
        aria-hidden="true"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
        Tu navegador no soporta el video en HTML5.
      </video>

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/25" />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
        aria-label="Título principal"
      >
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="font-heading text-4xl md:text-7xl font-extrabold text-white mb-0 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
        >
          <span className="text-red-600">C.A.M</span>{" "}
          <span className="text-white">Amezcuas</span>
        </motion.h1>
        <span
          className="text-blue-600 text-2xl sm:text-3xl md:text-7xl font-semibold underline drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]"
          style={{ marginTop: "-4px" }}
        >
          EL C.A.M DE CAMPEONES
        </span>
      </div>

      {/* Gloves Scroll Indicator */}
      <div className="absolute bottom-8 w-full flex justify-center z-10">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <img
            src="/images/glove.png"
            alt="Desplázate hacia abajo"
            className="w-16 h-16 md:w-60 md:h-60 object-contain"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
      </div>
    </section>
  );
}
