import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CAM Fight Store - Equipo de Pelea',
  description: 'Tienda de equipo de pelea del Centro de Artes Marciales Amezcuas. Guantes, vendas, espinilleras, protectores y más.',
  alternates: {
    canonical: 'https://www.camamezcuas.com/store',
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
