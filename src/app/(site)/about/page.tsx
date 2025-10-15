export default function AboutPage() {
  return (
    <section className="grid md:grid-cols-2 gap-8 items-center px-6 py-20">
      {/* Text Section */}
      <div className="text-left space-y-6">
        <h2 className="text-red-600 font-heading text-4xl mb-4">Sobre Nosotros</h2>

        <p>
          Bienvenidos al <strong>Centro de Artes Marciales Amezcuas (C.A.M.)</strong>, tu espacio de transformación a través del deporte y la disciplina.
        </p>

        <h3 className="text-blue-600 font-heading text-2xl mt-6">Quiénes somos</h3>
        <p>
          En C.A.M. somos una comunidad apasionada por los deportes de combate, el bienestar y el crecimiento personal.
          Nos ubicamos en <strong>Tijuana</strong>, en la zona de Santa Fe / Cedros, y estamos comprometidos en crear un
          ambiente seguro, motivador y profesional donde todos —niños, jóvenes y adultos— puedan entrenar con confianza.
        </p>

        <h3 className="font-heading text-2xl mt-6">Qué hacemos</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Kickboxing</li>
          <li>Boxeo</li>
          <li>MMA (Artes Marciales Mixtas)</li>
          <li>Jiu-Jitsu</li>
          <li>Point Fighting</li>
          <li>Limalama</li>
          <li>Yoga</li>
          <li>Programas para niños (“Kids”)</li>
          <li>Clases para jóvenes y adultos</li>
        </ul>
        <p>
          En nuestro centro tenemos clases para toda la familia, porque lo más importante para nosotros es que nuestra comunidad
          crezca sana, con objetivos claros y motivación en cada etapa de la vida.
        </p>

        <h3 className="text-blue-600 font-heading text-2xl mt-6">Nuestra filosofía</h3>
        <p>
          Cada día nos capacitamos y seguimos creciendo para ofrecerte lo mejor. Somos uno de los centros más grandes de Tijuana y
          estamos comprometidos no solo con la comunidad de Santa Fe, sino también con los alrededores, Rosarito y toda Tijuana.
          Además, recibimos con gusto a practicantes de otras escuelas: aquí todos son bienvenidos.
        </p>

        <h3 className="text-red-600 font-heading text-2xl mt-6">Por qué elegirnos</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Técnicos capacitados y comprometidos</li>
          <li>Variedad de disciplinas para todas las edades y niveles</li>
          <li>Un ambiente familiar, amigable y motivador</li>
          <li>Comunidad unida: somos “El C.A.M. de campeones”</li>
          <li>Eventos y competencias que impulsan tu progreso</li>
        </ul>

        <p className="mt-4 font-semibold">
          En el C.A.M. entrenamos cuerpo, mente y espíritu. ¡Aquí encuentras más que un gimnasio, encuentras una familia!
        </p>
      </div>

      {/* Image Section */}
      <div
  className="rounded-2xl shadow-lg w-full h-full bg-cover bg-center"
  style={{ backgroundImage: "url('/images/about.jpg')" }}
></div>

    </section>
  );
}
