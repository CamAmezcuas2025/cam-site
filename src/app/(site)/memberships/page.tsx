// src/app/prices/page.tsx

export default function PricesPage() {
  return (
    <main className="px-6 py-20 bg-black relative">
      {/* Smoky Background */}
      <div className="absolute inset-0 bg-[url('/images/smoke-bg.jpg')] bg-cover bg-center opacity-20 pointer-events-none"></div>

      {/* Page Header */}
      <section className="relative text-center mb-16">
        <h1 className="font-heading text-6xl text-brand-red mb-4">
          Planes de Membresía
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-300">
          Elige el plan que mejor se adapte a ti y comienza tu entrenamiento en
          C.A.M Amezcuas.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="relative grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Card 1 */}
        <div className="bg-black/70 rounded-xl shadow-lg border border-gray-800 overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-brand-red/40">
          <img
            src="/images/plan1.png"
            alt="Plan 1"
            className="w-full h-[600px] object-cover md:h-[750px]"
          />
          <div className="p-6 flex justify-center">
            <a
              href="/register"
              className="inscribirme-btn rounded-lg px-6 py-3 font-bold"
            >
              Inscribirme ahora
            </a>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-black/70 rounded-xl shadow-lg border border-gray-800 overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-brand-blue/40">
          <img
            src="/images/plan2.png"
            alt="Plan 2"
            className="w-full h-[600px] object-cover md:h-[750px]"
          />
          <div className="p-6 flex justify-center">
            <a
              href="/register"
              className="inscribirme-btn rounded-lg px-6 py-3 font-bold"
            >
              Inscribirme ahora
            </a>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-black/70 rounded-xl shadow-lg border border-gray-800 overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-brand-white/40">
          <img
            src="/images/plan3.png"
            alt="Plan 3"
            className="w-full h-[600px] object-cover md:h-[750px]"
          />
          <div className="p-6 flex justify-center">
            <a
              href="/register"
              className="inscribirme-btn rounded-lg px-6 py-3 font-bold"
            >
              Inscribirme ahora
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
