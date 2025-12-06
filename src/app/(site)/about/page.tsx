import { 
  GiBoxingRing,
  GiHighKick,
  GiBoxingGlove, 
  GiBlackBelt,
  GiLegArmor,
  GiAtlas,
  GiCardPickup,
  GiThink,
  GiTeamIdea,
} from "react-icons/gi";
import { MdOutlineSportsMma, MdFamilyRestroom } from "react-icons/md";
import { PiFlowerLotusDuotone } from "react-icons/pi"
import { FaHandsHoldingChild } from "react-icons/fa6";



export default function AboutPage() {
  return (
    <section className="grid md:grid-cols-2 gap-8 items-center px-6 py-20">
      {/* Text Section */}
      <div className="text-left space-y-6">
        <h2 className="text-red-600 font-heading text-4xl mb-4">Sobre Nosotros</h2>
        <GiBoxingRing className="w-8 h-8 text-red-600" />
        <p>
          Bienvenidos al <strong>Centro de Artes Marciales Amezcuas (C.A.M.)</strong>, tu espacio de transformación a través del deporte y la disciplina.
        </p>
        <h3 className="text-blue-600 font-heading text-2xl mt-6">Quiénes somos</h3>
        <GiThink className="w-7 h-7 text-violet-200" />
        <p>
          En C.A.M. somos una comunidad apasionada por los deportes de combate, el bienestar y el crecimiento personal.
          Nos ubicamos en <strong>Tijuana</strong>, en la zona de Santa Fe / Cedros, y estamos comprometidos en crear un
          ambiente seguro, motivador y profesional donde todos —niños, jóvenes y adultos— puedan entrenar con confianza.
        </p>

        <h3 className="font-heading text-2xl mt-6">Qué hacemos</h3>
        <ul className="space-y-3 text-lg">
  <li className="flex items-center justify-between">
    <span>Kickboxing</span>
    <GiLegArmor className="w-7 h-7 text-red-600" />
  </li>

  <li className="flex items-center justify-between">
    <span>Boxeo</span>
    <GiBoxingGlove className="w-7 h-7 text-amber-700" />
  </li>

  <li className="flex items-center justify-between">
    <span>MMA (Artes Marciales Mixtas)</span>
    <MdOutlineSportsMma className="w-7 h-7 text-gray-800" />
  </li>

  <li className="flex items-center justify-between">
    <span>Jiu-Jitsu</span>
    <GiBlackBelt className="w-7 h-7 text-blue-700" />
  </li>

  <li className="flex items-center justify-between">
    <span>Point Fighting</span>
    <GiHighKick className="w-7 h-7 text-purple-600" />
  </li>

  <li className="flex items-center justify-between">
    <span>Limalama</span>
    <GiAtlas  className="w-7 h-7 text-blue-700" />
  </li>

  <li className="flex items-center justify-between">
    <span>Yoga</span>
    <PiFlowerLotusDuotone className="w-7 h-7 text-pink-500" />
  </li>

  <li className="flex items-center justify-between">
    <span>Programas para niños (“Kids”)</span>
    <FaHandsHoldingChild className="w-7 h-7 text-green-600" />
  </li>
  <li className="flex items-center justify-between">
    <span>Clases para jóvenes y adultos</span>
<MdFamilyRestroom  className="w-7 h-7 text-red-200" />
  </li>
</ul>
        <p>
          En nuestro centro tenemos clases para toda la familia, porque lo más importante para nosotros es que nuestra comunidad
          crezca sana, con objetivos claros y motivación en cada etapa de la vida.
        </p>

        <h3 className="text-blue-600 font-heading text-2xl mt-6">Nuestra filosofía</h3>
        <GiTeamIdea className="w-7 h-7 text-sky-600" />
        <p>
          Cada día nos capacitamos y seguimos creciendo para ofrecerte lo mejor. Somos uno de los centros más grandes de Tijuana y
          estamos comprometidos no solo con la comunidad de Santa Fe, sino también con los alrededores, Rosarito y toda Tijuana.
          Además, recibimos con gusto a practicantes de otras escuelas: aquí todos son bienvenidos.
        </p>

        <h3 className="text-red-600 font-heading text-2xl mt-6">Por qué elegirnos</h3>
        <GiCardPickup className="w-7 h-7 text-green-500" />
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
        className="rounded-2xl shadow-lg w-full h-64 md:h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/about.jpg')" }}
      ></div>

    </section>
  );
}