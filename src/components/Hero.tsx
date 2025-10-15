"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
        Tu navegador no soporta el video en HTML5.
      </video>

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/25"></div>

      {/* Content with fade-in animation */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="font-heading text-4xl md:text-7xl font-extrabold text-white mb-0 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
        >
          <span className="text-red-600">C.A.M</span>{" "}
          <span className="text-white">Amezcuas</span>
        </motion.h1>
        <span className="text-blue-600 text-2xl sm:text-3xl md:text-7xl font-semibold underline drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]" style={{ marginTop: "-4px" }}>
  EL C.A.M DE CAMPEONES
</span>
      </div>

      {/* Gloves Scroll Indicator */}
      <div className="absolute bottom-8 w-full flex justify-center z-10">
        <motion.img
          src="/images/glove.png"
          alt="Scroll down gloves"
          initial={{ y: 0 }}
          animate={{ y: [0, 15, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="w-16 h-16 md:w-60 md:h-60 object-contain"
        />
      </div>
    </section>
  );
}
