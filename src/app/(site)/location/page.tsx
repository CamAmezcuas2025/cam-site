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
      <section className="max-w-3xl mx-auto bg-black/60 border border-gray-800 rounded-xl shadow-lg p-8 text-center space-y-6">
        <h2 className="about-heading-blue">⏰ Horarios de Clases</h2>

        {/* Boxeo */}
        <div>
          <h3 className="text-brand-red font-heading text-xl mb-2">Boxeo</h3>
          <p className="text-gray-300 font-semibold">Matutino</p>
          <ul className="text-gray-400 space-y-1">
            <li>7:00 am - 9:00 am</li>
            <li>10:00 am - 11:00 am</li>
            <li>5:00 pm - 6:00 pm</li>
          </ul>
        </div>

        {/* Kickboxing & MMA */}
        <div>
          <h3 className="text-brand-red font-heading text-xl mb-2">Kickboxing / MMA</h3>
          <p className="text-gray-300 font-semibold">Matutino</p>
          <ul className="text-gray-400 space-y-1">
            <li>8:00 am - 9:00 am</li>
            <li>10:00 am - 11:00 am</li>
          </ul>
          <p className="text-gray-300 font-semibold mt-2">Tarde / Noche</p>
          <ul className="text-gray-400 space-y-1">
            <li>6:00 pm - 8:00 pm</li>
          </ul>
        </div>

        {/* Jiu Jitsu */}
        <div>
          <h3 className="text-brand-red font-heading text-xl mb-2">Jiu Jitsu</h3>
          <p className="text-gray-400">Lunes y Miércoles</p>
          <ul className="text-gray-400 space-y-1">
            <li>6:00 pm - 7:00 pm</li>
            <li>9:00 pm - 10:00 pm</li>
          </ul>
        </div>

        {/* Sábados */}
        <div>
          <h3 className="text-brand-red font-heading text-xl mb-2">Clases de Sábados</h3>
          <ul className="text-gray-400 space-y-1">
            <li>8:00 am - 10:00 am</li>
          </ul>
        </div>

        {/* Note */}
        <p className="text-brand-blue font-semibold mt-4">
          ✅ Puedes entrar a todas las clases y aprender de todo
        </p>
      </section>
    </main>
  );
}
