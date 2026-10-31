import Link from "next/link";
import { FaInstagram } from "react-icons/fa";

export default function StorePage() {
  return (
    <main
      className="px-6 py-20 space-y-20 relative"
      style={{
        backgroundImage: "url('/images/Cams.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="flex justify-center">
          <img
            src="/images/fightstore-logo.jpg"
            alt="CAM Fight Store"
            className="w-48 h-48 object-contain rounded-xl"
          />
        </div>
        <h1 className="font-heading text-5xl text-brand-red">
          CAM FIGHT STORE
        </h1>
        <div className="inline-flex items-center gap-3 bg-black text-white px-5 py-3 rounded-full text-sm font-semibold">
          <span className="text-yellow-400">★</span>
          Distribuidores Autorizados
          <img
            src="/images/LOGO-MANISH.webp"
            alt="VENUM"
            className="h-8 object-contain brightness-0 invert"
          />
          <span className="text-yellow-400">★</span>
        </div>
        <p className="text-xl max-w-2xl mx-auto text-white">
          Equipo de pelea de calidad para entrenar y competir al máximo nivel.
          Guantes, vendas, espinilleras, protectores y más.
        </p>
      </section>

      {/* Store Info Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-white">
          <h2 className="about-heading-blue">Equipo Profesional</h2>
          <p>
            En <strong>CAM Fight Store</strong> encontrarás todo el equipo necesario para
            tus entrenamientos y competencias de artes marciales. Como{" "}
            <strong>distribuidores autorizados de VENUM</strong>, ofrecemos productos
            originales de la marca líder mundial en equipo de combate.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Guantes de boxeo y MMA</li>
            <li>Vendas y protectores bucales</li>
            <li>Espinilleras y protectores</li>
            <li>Shorts y ropa de entrenamiento</li>
            <li>Equipo para gimnasio</li>
            <li>Accesorios y más</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 text-center space-y-6">
          <img
            src="/images/fightstore-logo.jpg"
            alt="CAM Fight Store"
            className="w-32 h-32 object-contain rounded-xl mx-auto"
          />
          <h3 className="font-heading text-2xl text-white">Visita Nuestra Tienda</h3>
          <p className="text-gray-300">
            Síguenos en Instagram para ver nuestros productos disponibles,
            promociones y nuevas llegadas.
          </p>
          <a
            href="https://www.instagram.com/camfightstore/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            <FaInstagram className="w-6 h-6" />
            @camfightstore
          </a>
        </div>
      </section>

      {/* Why Buy From Us */}
      <section className="space-y-8">
        <h2 className="about-heading-red text-center">
          ¿Por Qué Comprar Con Nosotros?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-black rounded-xl overflow-hidden text-center">
            <div className="bg-black">
              <img
                src="/images/gloves-venum.webp"
                alt="Guantes VENUM"
                className="w-full"
              />
            </div>
            <div className="p-6 space-y-3">
              <h3 className="font-semibold text-lg text-white">Productos VENUM Originales</h3>
              <p className="text-gray-400">
                Somos distribuidores autorizados de VENUM, garantizando productos 100% originales.
              </p>
            </div>
          </div>
          <div className="bg-black rounded-xl overflow-hidden text-center">
            <div className="bg-black">
              <img
                src="/images/boxing-shoes.jpg"
                alt="Zapatos de boxeo VENUM"
                className="w-full"
              />
            </div>
            <div className="p-6 space-y-3">
              <h3 className="font-semibold text-lg text-white">Precios Accesibles</h3>
              <p className="text-gray-400">
                Equipo de calidad profesional a precios justos para toda la comunidad.
              </p>
            </div>
          </div>
          <div className="bg-black rounded-xl overflow-hidden text-center">
            <div className="bg-black">
              <img
                src="/images/venum-tee.webp"
                alt="Playera VENUM"
                className="w-full"
              />
            </div>
            <div className="p-6 space-y-3">
              <h3 className="font-semibold text-lg text-white">Apoyas al Centro</h3>
              <p className="text-gray-400">
                Cada compra ayuda a mantener y mejorar las instalaciones del CAM.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white rounded-2xl p-10 text-center space-y-6">
        <h2 className="font-heading text-3xl">¿Listo para Equiparte?</h2>
        <p className="text-gray-300 max-w-xl mx-auto">
          Visita nuestra tienda en el Centro de Artes Marciales Amezcuas o contáctanos
          por Instagram para hacer tu pedido.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://www.instagram.com/camfightstore/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            <FaInstagram className="w-5 h-5" />
            Ver Productos
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition-colors"
          >
            Contactar
          </Link>
        </div>
      </section>
      </div>
    </main>
  );
}
