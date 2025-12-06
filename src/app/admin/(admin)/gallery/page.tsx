"use client";

import { useEffect, useState, useRef } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Upload,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Save,
  X,
  Loader2,
  Image as ImageIcon,
  Plus,
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
  is_published: boolean;
  display_order: number;
  views_count: number;
  created_at: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminGalleryPage() {
  const supabase = createClientSupabaseClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
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
  // UPLOAD PHOTO
  // ============================================================================

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("❌ Solo se permiten imágenes");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("❌ La imagen debe ser menor a 5MB");
      return;
    }

    setUploading(true);

    try {
      // Upload to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(fileName);

      // Create database entry
      const { data: newPhoto, error: dbError } = await supabase
        .from("gallery")
        .insert({
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          description: "",
          image_url: publicUrl,
          thumbnail_url: publicUrl,
          category: "general",
          tags: [],
          is_featured: false,
          is_published: true,
          display_order: photos.length,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setPhotos([newPhoto, ...photos]);
      alert("✅ Foto subida exitosamente");
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("❌ Error al subir la foto: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  // ============================================================================
  // UPDATE PHOTO
  // ============================================================================

  async function updatePhoto(id: string, updates: Partial<GalleryPhoto>) {
    try {
      const { error } = await supabase
        .from("gallery")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setPhotos(photos.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (err: any) {
      console.error("Update error:", err);
      alert("❌ Error al actualizar: " + err.message);
    }
  }

  // ============================================================================
  // DELETE PHOTO
  // ============================================================================

  async function deletePhoto(photo: GalleryPhoto) {
    if (!confirm(`¿Eliminar "${photo.title}"?`)) return;

    setDeletingId(photo.id);

    try {
      // Extract file path from URL
      const url = new URL(photo.image_url);
      const pathParts = url.pathname.split("/");
      const fileName = pathParts[pathParts.length - 1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("gallery")
        .remove([fileName]);

      if (storageError) console.error("Storage delete error:", storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from("gallery")
        .delete()
        .eq("id", photo.id);

      if (dbError) throw dbError;

      setPhotos(photos.filter(p => p.id !== photo.id));
      alert("✅ Foto eliminada");
    } catch (err: any) {
      console.error("Delete error:", err);
      alert("❌ Error al eliminar: " + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================================================
  // SAVE EDITED PHOTO
  // ============================================================================

  async function saveEditedPhoto() {
    if (!editingPhoto) return;

    try {
      const { error } = await supabase
        .from("gallery")
        .update({
          title: editingPhoto.title,
          description: editingPhoto.description,
          category: editingPhoto.category,
          tags: editingPhoto.tags,
          is_featured: editingPhoto.is_featured,
          is_published: editingPhoto.is_published,
          display_order: editingPhoto.display_order,
        })
        .eq("id", editingPhoto.id);

      if (error) throw error;

      setPhotos(photos.map(p => p.id === editingPhoto.id ? editingPhoto : p));
      setEditingPhoto(null);
      alert("✅ Cambios guardados");
    } catch (err: any) {
      console.error("Save error:", err);
      alert("❌ Error al guardar: " + err.message);
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <section className="pt-28 pb-24 max-w-7xl mx-auto px-6">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          Cargando galería...
        </div>
      </section>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-28 pb-24 px-4 md:px-8 text-white min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-blue flex items-center gap-2">
            <ImageIcon className="w-8 h-8 text-brand-red" />
            Administrar Galería
          </h1>

          {/* Upload button */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-brand-red to-brand-blue font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Subir Foto
                </>
              )}
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/40 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">Total Fotos</div>
            <div className="text-2xl font-bold text-brand-blue">{photos.length}</div>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">Publicadas</div>
            <div className="text-2xl font-bold text-green-400">
              {photos.filter(p => p.is_published).length}
            </div>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">Destacadas</div>
            <div className="text-2xl font-bold text-yellow-400">
              {photos.filter(p => p.is_featured).length}
            </div>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">Vistas Totales</div>
            <div className="text-2xl font-bold text-purple-400">
              {photos.reduce((sum, p) => sum + p.views_count, 0)}
            </div>
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="flex flex-wrap gap-3 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
              selectedCategory === "all"
                ? "bg-gradient-to-r from-brand-red to-brand-blue text-white shadow-[0_0_20px_rgba(255,0,0,0.5)]"
                : "bg-black/40 border border-gray-700 text-gray-300 hover:bg-black/60"
            }`}
          >
            <span className="mr-2">📸</span>
            Todas ({photos.length})
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
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
              {cat.label} ({photos.filter(p => p.category === cat.id).length})
            </motion.button>
          ))}
        </div>

        {/* PHOTO GRID */}
        {photos.length === 0 ? (
          <div className="text-center py-20 bg-black/40 rounded-2xl border border-gray-800">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg mb-4">
              No hay fotos en la galería
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-brand-red to-brand-blue font-semibold hover:opacity-90 transition"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Subir Primera Foto
            </button>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20 bg-black/40 rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-lg">
              No hay fotos en esta categoría
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-black/60 border border-gray-800 rounded-xl overflow-hidden shadow-glow hover:shadow-[0_0_30px_rgba(255,0,0,0.3)] transition-all"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-900">
                  <Image
                    src={photo.thumbnail_url || photo.image_url}
                    alt={photo.title}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {photo.is_featured && (
                      <span className="px-2 py-1 rounded-full bg-yellow-500 text-black text-xs font-bold">
                        ⭐
                      </span>
                    )}
                    {!photo.is_published && (
                      <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                        Oculta
                      </span>
                    )}
                  </div>

                  {/* Views count */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {photo.views_count}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1 line-clamp-1">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-2">
                    {categories.find(c => c.id === photo.category)?.emoji} {categories.find(c => c.id === photo.category)?.label || photo.category}
                  </p>
                  {photo.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                      {photo.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPhoto(photo)}
                      className="flex-1 px-3 py-2 rounded-lg bg-brand-blue/20 border border-brand-blue/40 text-brand-blue hover:bg-brand-blue/30 transition text-sm font-semibold flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>

                    <button
                      onClick={() => updatePhoto(photo.id, { is_published: !photo.is_published })}
                      className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                      title={photo.is_published ? "Ocultar" : "Publicar"}
                    >
                      {photo.is_published ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => updatePhoto(photo.id, { is_featured: !photo.is_featured })}
                      className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                      title={photo.is_featured ? "Quitar destacado" : "Destacar"}
                    >
                      {photo.is_featured ? (
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ) : (
                        <StarOff className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => deletePhoto(photo)}
                      disabled={deletingId === photo.id}
                      className="px-3 py-2 rounded-lg bg-red-900/40 border border-red-700 text-red-400 hover:bg-red-900/60 transition disabled:opacity-50"
                    >
                      {deletingId === photo.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingPhoto(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/90 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Editar Foto</h2>
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Preview */}
                <div className="relative h-64 rounded-lg overflow-hidden bg-gray-900">
                  <Image
                    src={editingPhoto.image_url}
                    alt={editingPhoto.title}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Título</label>
                  <input
                    type="text"
                    value={editingPhoto.title}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-brand-blue outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Descripción</label>
                  <textarea
                    value={editingPhoto.description || ""}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-brand-blue outline-none resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Categoría</label>
                  <select
                    value={editingPhoto.category}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-brand-blue outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Etiquetas (separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={editingPhoto.tags.join(", ")}
                    onChange={(e) => setEditingPhoto({
                      ...editingPhoto,
                      tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                    })}
                    placeholder="bjj, entrenamiento, competencia"
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-brand-blue outline-none"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPhoto.is_published}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, is_published: e.target.checked })}
                      className="w-4 h-4 rounded accent-brand-blue"
                    />
                    <span className="text-sm">Publicada</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPhoto.is_featured}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, is_featured: e.target.checked })}
                      className="w-4 h-4 rounded accent-yellow-500"
                    />
                    <span className="text-sm">Destacada</span>
                  </label>
                </div>

                {/* Display order */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Orden de visualización
                  </label>
                  <input
                    type="number"
                    value={editingPhoto.display_order}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-brand-blue outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveEditedPhoto}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-brand-red to-brand-blue font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </button>
                  <button
                    onClick={() => setEditingPhoto(null)}
                    className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}