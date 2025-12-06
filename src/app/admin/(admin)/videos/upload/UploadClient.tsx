"use client";

import { useState } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";

const CLASS_TYPES = [
  "Boxeo",
  "Karate Kids",
  "Jiu Jitsu",
  "MMA",
  "Kickboxing",
  "Yoga",
  "Lima Lama",
];

export default function UploadClient() {
  const supabase = createClientSupabaseClient();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classType, setClassType] = useState("");

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");

  async function handleUpload() {
    if (!videoFile) return alert("Selecciona un video");
    if (!title.trim()) return alert("El título es requerido");

    setProcessing(true);
    setProgress("Iniciando...");

    try {
      const safeName = videoFile.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
      const fileName = `${Date.now()}-${safeName}`;

      setProgress("Solicitando URL firmada...");

      const signRes = await fetch("/api/videos/get-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          contentType: videoFile.type,
        }),
      });

      if (!signRes.ok) {
        const t = await signRes.text();
        throw new Error("Failed to get signed URL: " + t);
      }

      const { uploadUrl, publicUrl, key } = await signRes.json();

      console.log("Received from API:");
      console.log("- uploadUrl:", uploadUrl);
      console.log("- publicUrl:", publicUrl);
      console.log("- key:", key);

      setProgress("Subiendo a DigitalOcean...");

      console.log("Uploading to:", uploadUrl);
      console.log("File key:", key);
      console.log("Public URL will be:", publicUrl);

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": videoFile.type,
          "x-amz-acl": "public-read", // ✅ Add ACL header
        },
        body: videoFile,
      });

      console.log("Upload response status:", uploadResponse.status);
      console.log("Upload response headers:", Object.fromEntries(uploadResponse.headers));

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload failed:", errorText);
        throw new Error(`Upload to DigitalOcean failed: ${uploadResponse.status} - ${errorText}`);
      }

      // ✅ NEW STEP: Set file permissions to public-read
      setProgress("Configurando permisos públicos...");

      const aclRes = await fetch("/api/videos/set-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (!aclRes.ok) {
        const errText = await aclRes.text();
        console.warn("Failed to set public ACL:", errText);
        // Continue anyway - file is uploaded, just might not be public
      }

      setProgress("Guardando en base de datos...");

      const { data: { user } } = await supabase.auth.getUser();

      const { error: dbErr } = await supabase.from("videos").insert({
        title,
        description: description || null,
        class_type: classType || null,
        video_url: publicUrl,
        uploaded_by: user?.id,
      });

      if (dbErr) throw dbErr;

      alert("¡Video subido correctamente!");

      setVideoFile(null);
      setThumbnail(null);
      setTitle("");
      setDescription("");
      setClassType("");
      setProgress("");

    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
      setProgress("");
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-8 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/images/upload_vid_bg.jpeg')",
      }}
    >
      <div className="bg-black/70 backdrop-blur rounded-xl p-8 border border-white/10 shadow-xl w-full max-w-2xl text-white">
        <h1 className="text-2xl font-heading mb-6 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Subir Video
        </h1>

        {progress && (
          <div className="mb-4 p-3 bg-blue-600/50 rounded text-sm">
            {progress}
          </div>
        )}

        <div className="mb-6">
          <label className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Miniatura (Opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            className="text-white"
            onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Archivo de Video *
          </label>
          <input
            type="file"
            accept="video/*"
            className="text-white"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          />
          {videoFile && (
            <p className="text-sm text-gray-300 mt-1">
              Tamaño: {(videoFile.size / 1024 / 1024).toFixed(2)}MB
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Título *
          </label>
          <input
            className="w-full px-3 py-2 rounded bg-gray-900 text-white"
            placeholder="Título del video"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Descripción
          </label>
          <textarea
            className="w-full px-3 py-2 rounded bg-gray-900 text-white"
            placeholder="Descripción del video"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Tipo de clase
          </label>
          <select
            className="w-full px-3 py-2 rounded bg-gray-900 text-white"
            value={classType}
            onChange={(e) => setClassType(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {CLASS_TYPES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          disabled={processing}
          onClick={handleUpload}
          className="bg-red-600 hover:bg-blue-600 px-4 py-2 rounded-md font-semibold transition disabled:bg-gray-600 disabled:cursor-not-allowed w-full"
        >
          {processing ? progress || "Procesando..." : "Subir y Comprimir"}
        </button>

        {videoFile && !processing && (
          <p className="text-sm text-gray-400 mt-2 text-center">
            El video se comprimirá automáticamente antes de subir
          </p>
        )}
      </div>
    </div>
  );
}