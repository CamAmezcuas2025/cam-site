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
  title: "C.A.M Amezcuas",
  description: "Entrena como si fuera tu última vez",
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
    title: "C.A.M Amezcuas",
    description: "Entrena como si fuera tu última vez",
    url: "https://www.camamezcuas.com",
    siteName: "C.A.M Amezcuas",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "C.A.M Amezcuas",
    description: "Entrena como si fuera tu última vez",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={bebasNeue.variable}>
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