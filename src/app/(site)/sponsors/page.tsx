export default function SponsorsPage() {
  return (
    <main className="px-6 py-20 space-y-20">
      {/* Section 1: Sponsor Invitation */}
      <section className="grid md:grid-cols-2 gap-8 items-start">
        {/* Text */}
        <div className="space-y-6">
          <h1 className="font-heading text-5xl mb-6 text-brand-red">
            ¿TE GUSTARÍA SER PATROCINADOR OFICIAL DEL CENTRO DE ARTES MARCIALES?
          </h1>
          <p>
            ¡Es el momento ideal para hacerlo! Actualmente estamos alcanzando más de{" "}
            <strong>9 millones de vistas</strong> en nuestras redes sociales, con más de{" "}
            <strong>5 millones en Instagram</strong> y más de{" "}
            <strong>4.4 millones en TikTok</strong>, lo que representa una gran oportunidad
            para que tu marca tenga visibilidad constante, directa y efectiva.
          </p>

          <h2 className="about-heading-blue">Beneficios para patrocinadores</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Menciones y agradecimientos diarios en nuestras historias</li>
            <li>Publicaciones y reels promocionando tu negocio o servicio</li>
            <li>Promoción directa con nuestra comunidad</li>
            <li>Presencia de marca en shorts y uniformes oficiales</li>
            <li>Branding dentro del centro</li>
          </ul>
        </div>

        {/* Logos (right side) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <img
            src="/images/sponsor1.jpg"
            alt="Sponsor 1"
            className="w-full h-auto object-contain grayscale hover:grayscale-0 hover:scale-110 transition duration-300 ease-in-out"
          />
          <img
            src="/images/sponsor2.jpg"
            alt="Sponsor 2"
            className="w-full h-auto object-contain grayscale hover:grayscale-0 hover:scale-110 transition duration-300 ease-in-out"
          />
          <img
            src="/images/sponsor3.jpg"
            alt="Sponsor 3"
            className="w-full h-auto object-contain grayscale hover:grayscale-0 hover:scale-110 transition duration-300 ease-in-out"
          />
          <img
            src="/images/sponsor4.jpg"
            alt="Sponsor 4"
            className="w-full h-auto object-contain grayscale hover:grayscale-0 hover:scale-110 transition duration-300 ease-in-out"
          />
          <img
            src="/images/sponsor5.jpg"
            alt="Sponsor 5"
            className="w-full h-auto object-contain grayscale hover:grayscale-0 hover:scale-110 transition duration-300 ease-in-out"
          />
          <img
            src="/images/sponsor6.jpg"
            alt="Sponsor 6"
            className="w-full h-auto object-contain grayscale hover:grayscale-0 hover:scale-110 transition duration-300 ease-in-out"
          />
        </div>
      </section>

      {/* Section 2: Transparency */}
      <section className="grid md:grid-cols-2 gap-8 items-start">
        {/* Text */}
        <div className="space-y-6">
          <h2 className="about-heading-red">
            ¿CÓMO ASEGURAMOS QUE TU APORTACIÓN SERÁ UTILIZADA CORRECTAMENTE?
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Transparencia total en el uso del apoyo</li>
            <li>Evidencia visual del uso de los recursos</li>
            <li>Registro y seguimiento de compras o inversiones</li>
            <li>Participación activa del patrocinador</li>
            <li>Resultados visibles en la comunidad</li>
          </ul>

          <h2 className="about-heading-blue">Facturación disponible</h2>
          <p>
            Somos de los pocos centros de artes marciales que pueden facturar sus donaciones,
            lo que permite a nuestros patrocinadores deducir su apoyo y tener un respaldo fiscal formal.  
            <strong> ¡Apoyas una causa con impacto real y beneficios comprobables!</strong>
          </p>
        </div>

        {/* Image/branding */}
        <div>
          <img
            src="/images/sponsorships.jpg" // 👈 replace with a wide banner-style image
            alt="Patrocinadores"
            className="rounded-2xl shadow-lg w-full h-full object-cover"
          />
        </div>
      </section>
    </main>
  );
}
