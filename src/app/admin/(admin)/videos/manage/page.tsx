"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";

export default function AdminVideoListPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return setIsAdmin(false);

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(data?.role === "admin");
    } catch {
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    if (isAdmin) loadVideos();
  }, [isAdmin]);

  async function loadVideos() {
    setLoading(true);
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    setVideos(data || []);
    setLoading(false);
  }

  async function deleteVideo(id: string, videoUrl: string) {
    if (!confirm("¿Seguro que deseas eliminar este video?")) return;

    try {
      // Extract DO Spaces file key from the video URL
      // URL format: https://<bucket>.<region>.digitaloceanspaces.com/<key>
      // or: https://<endpoint>/<bucket>/<key>
      let key = videoUrl;
      try {
        const urlObj = new URL(videoUrl);
        // The pathname starts with /, remove leading slash
        key = urlObj.pathname.replace(/^\//, "");
        // If the first segment is the bucket name, remove it
        const bucket = process.env.NEXT_PUBLIC_SPACES_BUCKET;
        if (bucket && key.startsWith(`${bucket}/`)) {
          key = key.slice(bucket.length + 1);
        }
      } catch {
        // If URL parsing fails, try a simple approach: extract everything after the domain
        const match = videoUrl.match(/\.com\/(.+)$/) || videoUrl.match(/spaces\.com\/(.+)$/);
        if (match) key = match[1];
      }

      // Try deleting the actual file from DO Spaces
      await fetch("/api/videos/delete-from-spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      // Always delete DB metadata, even if file deletion fails
      await supabase.from("videos").delete().eq("id", id);

      // Remove from UI
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error eliminando video.");
    }
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-t-2 border-b-2 border-red-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <p>Acceso restringido</p>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen 
        bg-cover bg-center bg-no-repeat 
        bg-[url('/images/vid_bg.jpeg')]
        py-24 px-4
      "
    >
      <div className="max-w-4xl mx-auto backdrop-blur-sm bg-white/10 p-6 rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            Videos Subidos
          </h1>

          <Link
            href="/admin/videos/upload"
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Subir Nuevo
          </Link>
        </div>

        {loading && <p className="text-white">Cargando videos...</p>}

        {!loading && videos.length === 0 && (
          <p className="text-white">No hay videos aún.</p>
        )}

        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white/20 backdrop-blur-md shadow-lg rounded-xl p-5 border border-white/20"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {video.title}
                  </h2>
                  <p className="text-sm text-gray-300">
                    {video.class_type || "Sin categoría"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Subido: {new Date(video.created_at).toLocaleString()}
                  </p>
                </div>

                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Ver video
                </a>
              </div>

              <button
                onClick={() => deleteVideo(video.id, video.video_url)}
                className="mt-4 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
