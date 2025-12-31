import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AuthRedirect from "@/components/AuthRedirect";
import ClientErrorLogger from "@/components/ClientErrorLogger";
import { Analytics } from "@vercel/analytics/react";
import { Bebas_Neue } from 'next/font/google';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas',
});

export const metadata = {
  title: "C.A.M Amezcuas - Artes Marciales y Gimnasio en Tijuana | Boxeo, MMA, Jiu Jitsu",
  description: "Gimnasio de artes marciales en Santa Fe, Tijuana. Clases de Boxeo, MMA, Kickboxing, Jiu Jitsu, Karate Kids y Yoga. Mensualidades desde $900 pesos. ¡Inscríbete hoy!",
  keywords: "artes marciales Tijuana, gimnasio Tijuana, boxeo Tijuana, MMA Tijuana, kickboxing Tijuana, jiu jitsu Tijuana, karate kids Tijuana, yoga Tijuana, gym funcional Tijuana, Santa Fe Tijuana, clases artes marciales, escuela boxeo, academia MMA",
  manifest: "/site.webmanifest",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", type: "image/png", sizes: "96x96", url: "/favicon-96x96.png" },
    { rel: "apple-touch-icon", sizes: "180x180", url: "/apple-touch-icon.png" },
  ],
  verification: {
    google: "ANHiY4PLgGuEMbQEs6ezNfP573AFnNy6cnFSDuEU4fg",
  },
  openGraph: {
    title: "C.A.M Amezcuas - Artes Marciales y Gimnasio en Tijuana",
    description: "Gimnasio de artes marciales en Santa Fe, Tijuana. Clases de Boxeo, MMA, Kickboxing, Jiu Jitsu, Karate Kids y Yoga. Mensualidades desde $900 pesos.",
    url: "https://www.camamezcuas.com",
    siteName: "C.A.M Amezcuas",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "https://www.camamezcuas.com/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "C.A.M Amezcuas - Gimnasio de Artes Marciales en Tijuana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "C.A.M Amezcuas - Artes Marciales en Tijuana",
    description: "Clases de Boxeo, MMA, Kickboxing, Jiu Jitsu y más en Santa Fe, Tijuana",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.camamezcuas.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": "C.A.M Amezcuas",
    "description": "Gimnasio de artes marciales en Santa Fe, Tijuana. Clases de Boxeo, MMA, Kickboxing, Jiu Jitsu, Karate Kids y Yoga.",
    "url": "https://www.camamezcuas.com",
    "telephone": "+52-664-XXX-XXXX",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Santa Fe",
      "addressLocality": "Tijuana",
      "addressRegion": "Baja California",
      "postalCode": "22000",
      "addressCountry": "MX"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "32.5149",
      "longitude": "-117.0382"
    },
    "priceRange": "$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "06:00",
        "closes": "22:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "08:00",
        "closes": "14:00"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Clases de Artes Marciales",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Boxeo"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "MMA / Kickboxing"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Jiu Jitsu"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Karate Kids"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Yoga Fit"
          }
        }
      ]
    }
  };

  return (
    <html lang="es" className={bebasNeue.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body className="bg-black text-white font-body">
        <ClientErrorLogger />
        <AuthRedirect />
        <ClientLayout>{children}</ClientLayout>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111",
              color: "#fff",
              border: "1px solid #e60000",
              borderRadius: "12px",
              fontSize: "0.9rem",
              padding: "12px 16px",
            },
            success: {
              icon: "✅",
              style: { borderColor: "#22c55e" },
            },
            error: {
              icon: "❌",
              style: { borderColor: "#e60000" },
            },
          }}
        />

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}