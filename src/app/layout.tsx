import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next"; // ✅ Added
import AuthRedirect from "@/components/AuthRedirect";

export const metadata = {
  title: "C.A.M Amezcuas",
  description: "Entrena como si fuera tu última vez",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-black text-white font-body">
       
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
        {/* ✅ Add Speed Insights here */}
        <SpeedInsights />
      </body>
    </html>
  );
}
