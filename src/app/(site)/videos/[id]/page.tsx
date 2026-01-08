// src/app/(site)/videos/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '@/app/lib/clientSupabaseClient';
import { motion } from 'framer-motion';


type Video = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  class_type: string | null;
  created_at: string;
};

export default function VideoDetailPage() {
  const supabase = createClientSupabaseClient();
  const params = useParams();
  const router = useRouter();

  const videoId = params?.id as string;

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!videoId) return;
    loadVideoAndAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  async function loadVideoAndAccess() {
    try {
      setLoading(true);

      // 1) Load video data (public)
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (videoError || !videoData) {
        console.error('Video not found:', videoError);
        setVideo(null);
        setHasAccess(false);
        return;
      }

      setVideo(videoData);

      // 2) Check membership
      setCheckingAccess(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error('Auth error:', authError);
        setHasAccess(false);
        return;
      }

      if (!user) {
        // Not logged in → no access
        setHasAccess(false);
        return;
      }

      const nowIso = new Date().toISOString();

      const { data: membership, error: memError } = await supabase
        .from('user_memberships')
        .select('id, paid, active, end_date')
        .eq('user_id', user.id)
        .eq('active', true)
        .eq('paid', true)
        .gt('end_date', nowIso)
        .single();

      if (memError || !membership) {
        setHasAccess(false);
      } else {
        setHasAccess(true);
      }
    } catch (err) {
      console.error('Fatal error loading video/access:', err);
      setHasAccess(false);
    } finally {
      setLoading(false);
      setCheckingAccess(false);
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (loading || !video) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-full border-t-2 border-b-2 border-red-500 animate-spin mb-4" />
        <p className="text-gray-400">Cargando video...</p>
      </div>
    );
  }

  const showPaywall = checkingAccess || hasAccess === false;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.button
  initial={{ opacity: 0, x: -10 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.25 }}
  onClick={() => router.push('/profile')}
  className="fixed top-28 left-6 z-50 px-5 py-2 rounded-lg bg-gradient-to-r from-brand-red to-brand-blue font-semibold shadow-[0_0_20px_rgba(255,0,0,0.45)] hover:scale-105 transition"
>
  ← Volver al perfil
</motion.button>
<div className="flex justify-center">
  <motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    onClick={() => router.push('/profile')}
    className="mb-6 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-red to-brand-blue font-bold shadow-[0_0_30px_rgba(255,0,0,0.5)] hover:opacity-90 transition"
  >
    ← Volver al perfil
  </motion.button>
</div>

        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-gray-200"
        >
          ← Volver a la biblioteca
        </button>

        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            {video.title}
          </h1>
          <div className="flex flex-wrap gap-3 text-sm text-gray-400">
            {video.class_type && (
              <span className="px-3 py-1 rounded-full border border-red-500/60 text-xs">
                {video.class_type}
              </span>
            )}
            <span>Subido el {formatDate(video.created_at)}</span>
          </div>
        </header>

        {/* PAYWALL / ACCESS CHECK */}
        {showPaywall ? (
          <div className="bg-red-900/20 border border-red-600/40 rounded-xl p-6 mt-4">
            <h2 className="text-lg font-semibold mb-2">
              Se requiere membresía activa
            </h2>
            <p className="text-sm text-gray-300 mb-3">
              Este contenido está disponible solo para alumnos con membresía
              pagada y vigente.
            </p>
            <p className="text-xs text-gray-400">
              Si crees que esto es un error, habla con el coach para revisar tu
              estado de pago o vuelve a iniciar sesión.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl overflow-hidden bg-black border border-gray-800">
            <video
              src={video.video_url}
              controls
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              className="w-full aspect-video bg-black"
            >
              Tu navegador no soporta la etiqueta de video.
            </video>
          </div>
        )}

        {video.description && (
          <section className="mt-4 border-t border-gray-800 pt-4">
            <h2 className="text-lg font-semibold mb-2">Descripción</h2>
            <p className="text-sm text-gray-300 whitespace-pre-line">
              {video.description}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
