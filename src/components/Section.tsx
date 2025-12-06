"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type Props = {
  title: string;
  text: string;
  video?: string; // 👈 video option
  image?: string; // 👈 fallback image option
  link: string;
};

export default function Section({ title, text, video, image, link }: Props) {
  return (
    <motion.section
      className="grid md:grid-cols-2 gap-8 items-center px-6 py-20"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Left: video or image */}
      <div className="rounded-2xl shadow-lg overflow-hidden">
        {video ? (
          <video
            src={video}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto object-cover rounded-2xl"
          />
        ) : (
          image && (
            <img
              src={image}
              alt={title}
              className="w-full h-auto object-cover rounded-2xl"
            />
          )
        )}
      </div>

      {/* Right: text content */}
      <div>
        <h2 className="font-heading text-4xl mb-4">{title}</h2>
        <p className="mb-6">{text}</p>
        <Link
          href={link}
          className="text-brand-red font-semibold underline hover:text-brand-blue"
        >
          Ver más
        </Link>
      </div>
    </motion.section>
  );
}
