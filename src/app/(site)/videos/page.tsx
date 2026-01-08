'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClientSupabaseClient } from '@/app/lib/clientSupabaseClient';

type Video = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  class_type: string | null;
  created_at: string;
};

const CLASS_TYPES = [
  'Boxeo',
  'Karate Kids',
  'Jiu Jitsu',
  'MMA',
  'Kickboxing',
  'Yoga',
  'Lima Lama',
];

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative rounded-2xl border border-gray-800 bg-black/60 shadow-[0_0_40px_rgba(255,0,0,0.18),inset_0_0_80px_rgba(0,102,255,0.12)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function VideosPage() {
  const supabase = createClientSupabaseClient();
  const router = useRouter();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  // ------------------- INIT — membership + videos -------------------
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init() {
    try {
      setCheckingAccess(true);
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error('Auth error:', authError);
        setHasAccess(false);
        return;
      }

      // Not logged in
      if (!user) {
        setHasAccess(false);
        return;
      }

      const nowIso = new Date().toISOString();

      const { data: membership, error: memError } = await supabase
        .from('user_memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .eq('paid', true)
        .gt('end_date', nowIso)
        .maybeSingle();

      if (memError) {
        console.error('Membership check error:', memError);
        setHasAccess(false);
        return;
      }

      const allowed = !!membership;
      setHasAccess(allowed);

      if (allowed) {
        await fetchVideos();
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error('Fatal init error in /videos:', err);
      setHasAccess(false);
      setVideos([]);
    } finally {
      setCheckingAccess(false);
      setLoading(false);
    }
  }

  // ------------------- Fetch metadata -------------------
  async function fetchVideos() {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data ?? []);
    } catch (err) {
      console.error('Error loading videos:', err);
      setVideos([]);
    }
  }

  // ------------------- Filters -------------------
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(term) ||
          (v.description ?? '').toLowerCase().includes(term)
      );
    }

    if (filterClass !== 'all') {
      result = result.filter((v) => v.class_type === filterClass);
    }

    return result;
  }, [videos, searchTerm, filterClass]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });


  // ------------------- Loader -------------------
  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-t-2 border-b-2 border-red-500 animate-spin" />
          <p className="text-gray-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // ------------------- PAYWALL -------------------
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-md bg-red-900/20 border border-red-600/40 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold mb-3">Se requiere membresía activa</h2>
          <p className="text-gray-300 mb-3">
            Esta biblioteca de videos solo está disponible para alumnos con una
            membresía pagada y vigente.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Si crees que esto es un error, habla con el coach o revisa tu cuenta.
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            Regresar al perfil
          </button>
        </div>
      </div>
    );
  }

  // ------------------- UI -------------------

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 md:px-8">
    
      <div className="max-w-7xl mx-auto space-y-8">
        

        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-2 bg-gradient-to-r from-red-500 via-blue-500 to-red-500 bg-clip-text text-transparent">
              Biblioteca de videos
            </h1>
            <p className="text-gray-400">
              Entrenamientos y técnicas para repasar fuera del tatami.
            </p>
          </div>
          <button
            onClick={() => router.push('/profile')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors whitespace-nowrap"
          >
            Regresar al perfil
          </button>
        </div>

        {/* FILTERS */}
        <GlassCard className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-700 focus:outline-none focus:border-red-500"
              placeholder="Buscar por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las clases</option>
              {CLASS_TYPES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </GlassCard>

        {/* GRID */}
        {filteredVideos.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-lg font-semibold mb-2">No hay videos con estos filtros</p>
            <p className="text-gray-400">
              Ajusta la búsqueda o espera a que se suban nuevos contenidos.
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
              >
                <GlassCard className="overflow-hidden hover:shadow-[0_0_60px_rgba(255,0,0,0.25)] transition-shadow">
                  <button
                    type="button"
                    onClick={() => router.push(`/videos/${video.id}`)}
                    className="block w-full"
                  >
                    <div className="relative aspect-video bg-gray-900">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-700">
                          ▶
                        </div>
                      )}

                      {video.class_type && (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 text-xs border border-red-500/60">
                          {video.class_type}
                        </span>
                      )}
                    </div>
                  </button>

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {video.title}
                    </h3>

                    {video.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {video.description}
                      </p>
                    )}

                    <p className="text-xs text-gray-500">
                      Subido el {formatDate(video.created_at)}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
