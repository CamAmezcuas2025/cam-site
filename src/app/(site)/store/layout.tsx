import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CAM Fight Store | Equipo de Boxeo y MMA en Tijuana - VENUM, Title Boxing, Fighters Inc',
  description: 'Tienda de equipo de pelea en Tijuana. Distribuidores autorizados de VENUM, Title Boxing y Fighters Inc. Guantes de boxeo, MMA, vendas, espinilleras, protectores, shorts y ropa de entrenamiento. Productos 100% originales.',
  keywords: 'equipo de boxeo Tijuana, guantes VENUM Tijuana, tienda MMA Tijuana, equipo de pelea, Title Boxing Mexico, Fighters Inc, guantes de boxeo, espinilleras, vendas de boxeo, protectores bucales, shorts MMA, ropa de entrenamiento, CAM Fight Store, artes marciales Tijuana',
  alternates: {
    canonical: 'https://www.camamezcuas.com/store',
  },
  openGraph: {
    title: 'CAM Fight Store | Equipo de Boxeo y MMA en Tijuana',
    description: 'Distribuidores autorizados de VENUM, Title Boxing y Fighters Inc. Guantes, vendas, espinilleras, protectores y más. Productos 100% originales.',
    url: 'https://www.camamezcuas.com/store',
    siteName: 'C.A.M Amezcuas',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: 'https://www.camamezcuas.com/images/fightstore-logo.jpg',
        width: 800,
        height: 800,
        alt: 'CAM Fight Store - Equipo de Boxeo y MMA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CAM Fight Store | Equipo de Boxeo y MMA en Tijuana',
    description: 'Distribuidores autorizados de VENUM, Title Boxing y Fighters Inc. Productos 100% originales.',
    images: ['https://www.camamezcuas.com/images/fightstore-logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
