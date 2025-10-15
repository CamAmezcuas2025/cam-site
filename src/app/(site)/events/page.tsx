export default function EventsPage() {
  return (
    <main className="px-6 py-20 space-y-20">
      {/* Page Header */}
      <section className="text-center">
        <h1 className="font-heading text-6xl md:text-5xl sm:text-4xl text-brand-red mb-4">
          Eventos C.A.M Amezcuas
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-300">
          Mantente al día con nuestros próximos eventos, transmisiones en vivo y
          revive los mejores momentos de la comunidad.
        </p>
      </section>

      {/* Featured November Event */}
      <section>
        <h2 className="about-heading-red mb-6 text-center">
          Próximo Evento - Noviembre 2025
        </h2>
        <div className="flex justify-center">
          <a
            href="/images/event-nov.jpeg" // 👈 update this path with your flyer image name
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-3xl w-full"
          >
            <img
              src="/images/event-nov.jpeg" // 👈 flyer image goes here
              alt="Santa Fe Strikers Vol. 1 - Flyer"
              className="rounded-xl shadow-lg border border-gray-800 w-full object-contain transition-transform duration-300 hover:scale-105 hover:border-brand-blue"
            />
          </a>
        </div>
      </section>

      {/* Upcoming October Events */}
      <section>
        <h2 className="about-heading-blue mb-8 text-center">Próximos Eventos</h2>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl">
            {/* Event Card 1 */}
            <div className="group bg-black/60 rounded-xl shadow-lg overflow-hidden border border-gray-800 transition-transform duration-300 hover:scale-105 hover:border-brand-red">
              <img
                src="/images/oct-event1.jpeg"
                alt="Evento Octubre - Flyer Principal"
                className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="p-6">
                <h3 className="font-heading text-xl text-brand-white mb-2">
                  Evento Principal
                </h3>
                <p className="text-gray-400">Fecha: 5 de Octubre, 2025</p>
                <p className="text-gray-400">Ubicación: Tijuana, B.C.</p>
              </div>
            </div>

            {/* Event Card 2 */}
            <div className="group bg-black/60 rounded-xl shadow-lg overflow-hidden border border-gray-800 transition-transform duration-300 hover:scale-105 hover:border-brand-blue">
              <img
                src="/images/oct-event2.jpeg"
                alt="Peleador 1"
                className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="p-6">
                <h3 className="font-heading text-xl text-brand-white mb-2">
                  Alan Armas
                </h3>
                <p className="text-gray-400">Fecha: 5 de Octubre, 2025</p>
                <p className="text-gray-400">Ubicación: Tijuana, B.C.</p>
              </div>
            </div>

            {/* Event Card 3 */}
            <div className="group bg-black/60 rounded-xl shadow-lg overflow-hidden border border-gray-800 transition-transform duration-300 hover:scale-105 hover:border-brand-red">
              <img
                src="/images/oct-event3.jpeg"
                alt="Peleador 2"
                className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="p-6">
                <h3 className="font-heading text-xl text-brand-white mb-2">
                  Shande Nieblas
                </h3>
                <p className="text-gray-400">Fecha: 5 de Octubre, 2025</p>
                <p className="text-gray-400">Ubicación: Tijuana, B.C.</p>
              </div>
            </div>

            {/* Event Card 4 */}
            <div className="group bg-black/60 rounded-xl shadow-lg overflow-hidden border border-gray-800 transition-transform duration-300 hover:scale-105 hover:border-brand-blue">
              <img
                src="/images/oct-event4.jpeg"
                alt="Peleador 3"
                className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="p-6">
                <h3 className="font-heading text-xl text-brand-white mb-2">
                  El Persa
                </h3>
                <p className="text-gray-400">Fecha: 5 de Octubre, 2025</p>
                <p className="text-gray-400">Ubicación: Tijuana, B.C.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Feed / Embed */}
      <section>
        <h2 className="about-heading-red mb-8 text-center">
          Transmisión en Vivo
        </h2>
        <div className="max-w-4xl mx-auto aspect-video bg-black rounded-xl shadow-lg overflow-hidden border border-gray-800">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Live Feed"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </section>

   <section className="mt-16">
  <h2 className="about-heading-white mb-8 text-center">Eventos Pasados</h2>
  <div className="flex justify-center">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
      
      {/* Past Event 1 */}
      <div className="group bg-black/60 rounded-xl shadow-lg overflow-hidden border border-gray-800 transition-transform duration-300 hover:scale-105">
        <img
          src="/images/past-event1.jpg"
          alt="Evento Pasado 1"
          className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="p-4">
          <h3 className="font-heading text-xl text-brand-white mb-1">Boxeo Amateur</h3>
          <p className="text-gray-400">Fecha: April 2025</p>
          <p className="text-gray-400">Ubicación: Tijuana</p>
        </div>
      </div>

      {/* Past Event 2 */}
      <div className="group bg-black/60 rounded-xl shadow-lg overflow-hidden border border-gray-800 transition-transform duration-300 hover:scale-105">
        <img
          src="/images/past-event2.jpg"
          alt="Evento Pasado 2"
          className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="p-4">
          <h3 className="font-heading text-xl text-brand-white mb-1">MMA Amateur</h3>
          <p className="text-gray-400">Fecha: Mayo 2025</p>
          <p className="text-gray-400">Ubicación: Tijuana</p>
        </div>
      </div>

      {/* Past Event 3 */}
      <div className="group bg-black/60 rounded-xl shadow-lg overflow-hidden border border-gray-800 transition-transform duration-300 hover:scale-105">
        <img
          src="/images/past-event3.jpg"
          alt="Evento Pasado 3"
          className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="p-4">
          <h3 className="font-heading text-xl text-brand-white mb-1">Titulo Boxeo Amateur</h3>
          <p className="text-gray-400">Fecha: Junio 2025</p>
          <p className="text-gray-400">Ubicación: Tijuana</p>
        </div>
      </div>
    </div>
  </div>
</section>

    </main>
  );
}
