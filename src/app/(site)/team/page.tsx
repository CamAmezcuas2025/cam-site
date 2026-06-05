"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  GiBoxingGlove,
  GiKimono,
  GiHighKick,
  GiMeditation,
  GiWhistle,
  GiTrophy,
  GiStrong,
} from "react-icons/gi";
import { MdOutlineSportsMma, MdPeople } from "react-icons/md";
import Link from "next/link";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { IconType } from "react-icons";

// Icon map: resolve icon_name string → React component
const ICON_MAP: Record<string, IconType> = {
  MdOutlineSportsMma,
  GiBoxingGlove,
  GiKimono,
  GiHighKick,
  GiMeditation,
  GiWhistle,
};

interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string | null;
  description: string | null;
  image_url: string | null;
  icon_name: string;
  icon_color: string;
  display_order: number;
}

export default function TeamPage() {
  const supabase = createClientSupabaseClient();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        setTeamMembers(data);
      }
      setLoading(false);
    }
    fetchTeam();
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-400 text-lg">Cargando equipo...</div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/gym1.jpeg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
        </div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 text-center px-6 space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-heading text-5xl md:text-7xl text-white drop-shadow-lg">
            NUESTRO <span className="text-brand-red">EQUIPO</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Conoce a los profesionales que hacen del C.A.M. el gimnasio de campeones
          </p>
        </motion.div>
      </section>

      {/* Mission Statement */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h2 className="font-heading text-3xl md:text-5xl text-brand-blue">
            EXPERIENCIA Y PASIÓN
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Nuestro equipo está conformado por instructores altamente capacitados y certificados,
            cada uno especializado en su disciplina. Con años de experiencia tanto en competencias
            como en enseñanza, están comprometidos a ayudarte a alcanzar tus metas y desarrollar
            tu máximo potencial.
          </p>
        </motion.div>
      </section>

      {/* Team Grid */}
      <section className="px-6 py-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => {
            const IconComponent = ICON_MAP[member.icon_name] || MdOutlineSportsMma;
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative bg-black/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand-red transition-all duration-300 hover:shadow-2xl hover:shadow-brand-red/20">
                  {/* Image Container */}
                  <div className="relative h-80 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
                    <Image
                      src={member.image_url || "/images/default-avatar.png"}
                      alt={member.name}
                      fill
                      className="object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                    />
                    {/* Icon Overlay */}
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full p-3 border border-gray-700 group-hover:border-brand-red transition-all">
                      <IconComponent className={`w-8 h-8 ${member.icon_color}`} />
                    </div>
                  </div>

                  {/* Info Container */}
                  <div className="p-6 space-y-3">
                    <h3 className="font-heading text-2xl text-white group-hover:text-brand-red transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-brand-blue font-semibold text-lg">
                      {member.role}
                    </p>
                    {member.specialty && (
                      <p className="text-gray-400 text-sm border-l-2 border-brand-red pl-3">
                        {member.specialty}
                      </p>
                    )}
                    {member.description && (
                      <p className="text-gray-300 text-sm leading-relaxed pt-2">
                        {member.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <h2 className="font-heading text-4xl md:text-6xl text-brand-red">
              NUESTROS VALORES
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-black/60 border border-gray-800 rounded-xl p-8 space-y-4 hover:border-brand-red transition-all">
                <GiTrophy className="text-5xl text-brand-red" />
                <h3 className="font-heading text-2xl text-white">EXCELENCIA</h3>
                <p className="text-gray-300">
                  Nos esforzamos por la perfección en cada clase y entrenamiento.
                </p>
              </div>

              <div className="bg-black/60 border border-gray-800 rounded-xl p-8 space-y-4 hover:border-brand-blue transition-all">
                <MdPeople className="text-5xl text-brand-blue" />
                <h3 className="font-heading text-2xl text-white">COMUNIDAD</h3>
                <p className="text-gray-300">
                  Formamos una familia unida de atletas y entrenadores.
                </p>
              </div>

              <div className="bg-black/60 border border-gray-800 rounded-xl p-8 space-y-4 hover:border-brand-red transition-all">
                <GiStrong className="text-5xl text-brand-red" />
                <h3 className="font-heading text-2xl text-white">DEDICACIÓN</h3>
                <p className="text-gray-300">
                  Comprometidos con tu crecimiento personal y deportivo.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-r from-brand-red to-red-700 rounded-3xl p-12 shadow-2xl"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-white">
            ¿LISTO PARA ENTRENAR CON NOSOTROS?
          </h2>
          <p className="text-xl text-white/90">
            Únete al C.A.M. y entrena con los mejores instructores de Tijuana
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-white text-brand-red font-heading text-xl rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              INSCRÍBETE YA
            </Link>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-black/30 border-2 border-white text-white font-heading text-xl rounded-lg hover:bg-black/50 transition-all"
            >
              CONTÁCTANOS
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
