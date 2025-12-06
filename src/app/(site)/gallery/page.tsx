"use client";

import { useEffect, useState } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Tag,
  Loader2,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface GalleryPhoto {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  thumbnail_url: string | null;
  category: string;
  tags: string[];
  is_featured: boolean;
  views_count: number;
  created_at: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GalleryPage() {
  const supabase = createClientSupabaseClient();
  
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const categories = [
    { id: "all", label: "Todas", emoji: "📸" },
    { id: "training", label: "Entrenamientos", emoji: "🥋" },
    { id: "events", label: "Eventos", emoji: "🎉" },
    { id: "competition", label: "Competencias", emoji: "🏆" },
    { id: "kids", label: "Niños", emoji: "👶" },
    { id: "facilities", label: "Instalaciones", emoji: "🏢" },
    { id: "general", label: "General", emoji: "📷" },
  ];

  // ============================================================================
  // FETCH PHOTOS
  // ============================================================================

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPhotos(data || []);
      setFilteredPhotos(data || []);
    } catch (err) {
      console.error("Error fetching gallery:", err);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // FILTER BY CATEGORY
  // ============================================================================

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredPhotos(photos);
    } else {
      setFilteredPhotos(photos.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, photos]);

  // ============================================================================
  // LIGHTBOX NAVIGATION
  // ============================================================================

  function openLightbox(photo: GalleryPhoto, index: number) {
    setLightboxPhoto(photo);
    setLightboxIndex(index);
    
    // Increment view count
    supabase
      .from("gallery")
      .update({ views_count: photo.views_count + 1 })
      .eq("id", photo.id)
      .then(() => {
        setPhotos(prev => prev.map(p => 
          p.id === photo.id ? { ...p, views_count: p.views_count + 1 } : p
        ));
      });
  }

  function closeLightbox() {
    setLightboxPhoto(null);
  }

  function nextPhoto() {
    const nextIndex = (lightboxIndex + 1) % filteredPhotos.length;
    setLightboxIndex(nextIndex);
    setLightboxPhoto(filteredPhotos[nextIndex]);
  }

  function prevPhoto() {
    const prevIndex = (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setLightboxIndex(prevIndex);
    setLightboxPhoto(filteredPhotos[prevIndex]);
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (!lightboxPhoto) return;
      
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    }

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [lightboxPhoto, lightboxIndex]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <section className="pt-28 pb-24 min-h-screen">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          Cargando galería...
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-28 pb-24 px-4 md:px-8 text-white min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold mb-4 uppercase tracking-tight bg-gradient-to-r from-brand-red via-white to-brand-blue bg-clip-text text-transparent">
            📸 Galería
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Momentos memorables de entrenamientos, eventos y competencias
          </p>
        </motion.div>

        {/* CATEGORY FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-brand-red to-brand-blue text-white shadow-[0_0_20px_rgba(255,0,0,0.5)]"
                  : "bg-black/40 border border-gray-700 text-gray-300 hover:bg-black/60"
              }`}
            >
              <span className="mr-2">{cat.emoji}</span>
              {cat.label}
            </motion.button>
          ))}
        </motion.div>

        {/* PHOTO GRID */}
        {filteredPhotos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-black/40 rounded-2xl border border-gray-800"
          >
            <p className="text-gray-400 text-lg">
              No hay fotos en esta categoría aún.
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPhotos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => openLightbox(photo, idx)}
                className="relative group cursor-pointer overflow-hidden rounded-2xl border border-gray-800 bg-black/60 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_50px_rgba(255,0,0,0.3)] transition-all"
              >
                {/* Image */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={photo.thumbnail_url || photo.image_url}
                    alt={photo.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Featured badge */}
                  {photo.is_featured && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold shadow-lg">
                      ⭐ Destacada
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1 line-clamp-1">
                    {photo.title}
                  </h3>
                  {photo.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                      {photo.description}
                    </p>
                  )}
                  
                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {photo.views_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(photo.created_at).toLocaleDateString('es-MX')}
                    </span>
                  </div>

                  {/* Tags */}
                  {photo.tags && photo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {photo.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-brand-blue/20 text-brand-blue border border-brand-blue/40"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-3 rounded-full bg-black/60 border border-gray-700 text-white hover:bg-red-600 transition-colors z-50"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Navigation buttons */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-6 p-3 rounded-full bg-black/60 border border-gray-700 text-white hover:bg-brand-blue transition-colors z-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-6 p-3 rounded-full bg-black/60 border border-gray-700 text-white hover:bg-brand-blue transition-colors z-50"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>

            {/* Image and info */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-6xl w-full max-h-[90vh] flex flex-col md:flex-row gap-6 items-center"
            >
              {/* Image */}
              <div className="relative flex-1 max-h-[70vh] md:max-h-[80vh] w-full">
                <Image
                  src={lightboxPhoto.image_url}
                  alt={lightboxPhoto.title}
                  width={1200}
                  height={800}
                  className="object-contain w-full h-full rounded-xl border-2 border-gray-800 shadow-2xl"
                />
              </div>

              {/* Info panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-black/80 border border-gray-800 rounded-xl p-6 w-full md:w-80 backdrop-blur-xl"
              >
                <h2 className="text-2xl font-bold mb-2">{lightboxPhoto.title}</h2>
                
                {lightboxPhoto.description && (
                  <p className="text-gray-400 mb-4 leading-relaxed">
                    {lightboxPhoto.description}
                  </p>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Tag className="w-4 h-4 text-brand-red" />
                    <span className="capitalize">{lightboxPhoto.category}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400">
                    <Eye className="w-4 h-4 text-brand-blue" />
                    <span>{lightboxPhoto.views_count} vistas</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4 text-brand-red" />
                    <span>{new Date(lightboxPhoto.created_at).toLocaleDateString('es-MX', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>

                {/* Tags */}
                {lightboxPhoto.tags && lightboxPhoto.tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500 mb-2">Etiquetas:</p>
                    <div className="flex flex-wrap gap-2">
                      {lightboxPhoto.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-brand-red/20 to-brand-blue/20 border border-gray-700 text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Counter */}
                <div className="mt-6 pt-4 border-t border-gray-800 text-center text-sm text-gray-500">
                  Foto {lightboxIndex + 1} de {filteredPhotos.length}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}