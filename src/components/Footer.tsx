import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 className="font-heading text-xl mb-4">C.A.M Amezcuas</h3>
          <p className="text-sm text-gray-400">
            Entrena como si fuera <span className="text-brand-red">tu última vez</span>.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Enlaces</h4>
          <ul className="space-y-2">
            <li>
  <Link href="/">Inicio</Link>
</li>
            <li><Link href="/about">Sobre Nosotros</Link></li>
            <li><Link href="/events">Eventos</Link></li>
            <li><Link href="/classes">Clases</Link></li>
            <li><Link href="/memberships">Membresias</Link></li>
            <li><Link href="/sponsors">Patrocinio</Link></li>
            <li><Link href="/location">Ubicación</Link></li>
            <li><Link href="/contact">Contacto</Link></li>
            <li><Link href="/register">Registro</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Síguenos</h4>
          <div className="flex justify-center md:justify-start gap-4">
            <div className="flex justify-center md:justify-start gap-4">
              <a
                href="https://www.tiktok.com/@centrodeartesmarcialesam"
                className="footer__icon footer__icon--tiktok"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg"
                  alt="TikTok"
                />
              </a>
              <a
                href="https://www.instagram.com/centrodeartesmarcialesamezcuas"
                className="footer__icon footer__icon--instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg"
                  alt="Instagram"
                />
              </a>
              <a
                href="https://www.facebook.com/centrodeartesmarcialesamezcuas"
                className="footer__icon footer__icon--facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg"
                  alt="Facebook"
                />
              </a>
              <a
                href="https://youtube.com/@centrodeartesmarcialesamezcuas?si=Tod9HMr7n_fpa2R1"
                className="footer__icon footer__icon--youtube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg"
                  alt="YouTube"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-500 text-sm mt-8">
        © {new Date().getFullYear()} C.A.M Amezcuas. Todos los derechos reservados.
      </div>
    </footer>
  );
}