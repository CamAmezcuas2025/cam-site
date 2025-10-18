import styles from "./locationCards.module.css";
import { Flame, Shield, Infinity, Heart, Zap } from "lucide-react";





export default function LocationPage() {
  return (
    <main className="px-6 py-20 space-y-16">
      {/* Heading + Tagline */}
      <section className="text-center">
        <h1 className="font-heading text-5xl md:text-6xl text-brand-red mb-4">
          Visítanos en Santa Fe, Tijuana
        </h1>
        <p className="text-lg text-gray-300">Tu entrenamiento empieza aquí</p>
      </section>

      {/* Google Map */}
      <section className="w-full flex justify-center">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53867.25973145146!2d-117.09853938853347!3d32.453864023406425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d9375f9da0888b%3A0xc1f44c722f8b78a!2sCENTRO%20DE%20ARTES%20MARCIALES%20AMEZCUAS%20TIJUANA!5e0!3m2!1sen!2smx!4v1758948908312!5m2!1sen!2smx"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-xl shadow-lg border border-gray-800 max-w-5xl"
        ></iframe>
      </section>

      {/* Gym Photos */}
      <section className="max-w-5xl mx-auto">
        <h2 className="about-heading-blue mb-6 text-center">Nuestro Gimnasio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <img
            src="/images/gym1.jpeg"
            alt="Fachada del gimnasio"
            className="rounded-lg shadow-lg object-cover w-full h-64"
          />
          <img
            src="/images/gym2.jpeg"
            alt="Cerca del gimnasio"
            className="rounded-lg shadow-lg object-cover w-full h-64"
          />
          <img
            src="/images/gym3.jpeg"
            alt="Interior del gimnasio"
            className="rounded-lg shadow-lg object-cover w-full h-64"
          />
        </div>
      </section>

      {/* Contact + Info */}
      <section className="max-w-3xl mx-auto bg-black/60 border border-gray-800 rounded-xl shadow-lg p-8 text-center space-y-6">
        <h2 className="about-heading-red">Información de Contacto</h2>

        <p>
          📍{" "}
          <a
            href="https://maps.google.com/?q=Centro de Artes Marciales Amezcuas Tijuana"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-blue underline hover:text-brand-red"
          >
Blvd. el Rosario 11012, Tijuana, B.C.
          </a>
        </p>

        <p>
          📞{" "}
          <a
            href="tel:+5216643428308"
            className="text-brand-blue underline hover:text-brand-red"
          >
            +52 664 342 8308
          </a>{" "}
          |{" "}
          <a
            href="tel:+5216631171375"
            className="text-brand-blue underline hover:text-brand-red"
          >
            +52 663 117 1375
          </a>
        </p>

        <p>
          💬{" "}
          <a
            href="https://wa.me/5216641234567"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition-colors"
          >
            WhatsApp
          </a>
        </p>
      </section>

      {/* Class Hours */}
      <section className="max-w-6xl mx-auto text-center space-y-10">
  <h2 className="about-heading-blue">⏰ Horarios de Clases</h2>

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
    </main>
  );
}
