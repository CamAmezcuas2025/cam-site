"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import React from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "../lib/supabaseClient";

type SignatureCanvasProps = {
  penColor?: string;
  backgroundColor?: string;
  canvasProps?: { width?: number; height?: number; className?: string };
  ref?: React.Ref<any>;
};

const SignatureCanvas = dynamic<SignatureCanvasProps>(
  () => Promise.resolve(require("react-signature-canvas").default),
  { ssr: false }
);

export default function WaiverPage() {
  const GYM_NAME = "C.A.M Amezcuas";
  const OWNERS =
    "Josue Alejandro Amezcua Uriarte, Andrea Elizabeth Onofre Márquez";
  const GYM_LOCATION = "Tijuana, B.C., México";

  const [form, setForm] = useState({
    participant_name: "",
    participant_email: "",
    participant_age: "",
    accepted_esign_law: false,
    allow_image_rights: true,
    is_minor: false,
    guardian_name: "",
    guardian_relation: "",
    minor_name: "",
    minor_age: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const sigCanvasRef = useRef<any>(null);
  const router = useRouter();
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.replace("/login");
    }
    checkSession();
  }, [supabase, router]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("No se pudo obtener el perfil");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const supabase = createClientSupabaseClient();
    setUploadingSignature(true);

    let signature_url: string | null = null;

    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const canvas = sigCanvasRef.current.getTrimmedCanvas();
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b: Blob | null) => resolve(b), "image/png")
      );

      if (!blob) {
        setResult({ error: "Error procesando la firma. Intenta nuevamente." });
        setUploadingSignature(false);
        setSubmitting(false);
        return;
      }

      const fileName = `signature-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("signatures")
        .upload(fileName, blob, { upsert: false, contentType: "image/png" });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setResult({ error: "No se pudo subir la firma. Intenta de nuevo." });
        setUploadingSignature(false);
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("signatures")
        .getPublicUrl(fileName);
      signature_url = urlData.publicUrl;
    } else {
      setResult({ error: "Debes firmar el documento para continuar." });
      setUploadingSignature(false);
      setSubmitting(false);
      return;
    }

    setUploadingSignature(false);

    const body = {
      ...form,
      gym_name: GYM_NAME,
      owners: OWNERS,
      gym_location: GYM_LOCATION,
      signature_url,
      ...(form.is_minor
        ? {
            participant_name: form.minor_name,
            participant_age: form.minor_age,
            guardian_name: form.guardian_name,
            guardian_relation: form.guardian_relation,
          }
        : {}),
    };

    const res = await fetch("/api/waiver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setResult({ success: true });
      sigCanvasRef.current?.off?.(); // disable drawing

      setForm({
        participant_name: "",
        participant_email: "",
        participant_age: "",
        accepted_esign_law: false,
        allow_image_rights: true,
        is_minor: false,
        guardian_name: "",
        guardian_relation: "",
        minor_name: "",
        minor_age: "",
      });
    } else {
      const data = await res.json().catch(() => ({}));
      setResult({ error: data.error || "Error al enviar el formulario" });
    }

    setSubmitting(false);
  }

  // ✅ redirect after success (watcher pattern)
  useEffect(() => {
    if (result?.success) {
      const timer = setTimeout(() => {
        router.push("/profile");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [result, router]);

  if (!profile) {
    return (
      <div className="text-center text-gray-300 py-10">
        Cargando información del perfil...
      </div>
    );
  }

  if (profile.hasSignedWaiver) {
    return (
      <div className="max-w-xl mx-auto my-10 p-6 bg-black/70 rounded-xl text-white text-center">
        <h1 className="text-2xl font-bold mb-2 text-brand-red">
          Carta Responsiva ya firmada ✅
        </h1>
        <p className="text-gray-300 mb-4">
          Firmado el{" "}
          {new Date(profile.waiverSignedAt).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        {profile.waiverSignatureUrl && (
          <img
            src={profile.waiverSignatureUrl}
            alt="Firma del participante"
            className="mx-auto border border-gray-500 rounded-lg bg-white p-2 max-h-40"
          />
        )}
        <p className="mt-6 text-gray-400 text-sm">
          Si necesitas revocar o actualizar este documento, contacta al
          administrador del gimnasio.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-black/60 rounded-xl shadow-lg text-white">
      <h1 className="text-2xl font-bold mb-2 text-brand-red">
        RENUNCIA DE RESPONSABILIDAD Y CONSENTIMIENTO INFORMADO
      </h1>
      <div className="mb-4 space-y-1">
        <div>
          <b>Nombre del Gimnasio:</b> {GYM_NAME}
        </div>
        <div>
          <b>Nombre de propietario(s):</b> {OWNERS}
        </div>
        <div>
          <b>Ubicación:</b> {GYM_LOCATION}
        </div>
      </div>

      <div className="mb-5 text-sm text-gray-200">
        <p>
          <b>IMPORTANTE:</b> Antes de participar en cualquier actividad física
          dentro de las instalaciones del gimnasio, se solicita leer
          cuidadosamente el siguiente documento.
        </p>
        <ol className="list-decimal ml-4 space-y-2 mt-2">
          <li>
            <b>Aceptación de Riesgos:</b> Reconozco que las actividades físicas,
            artes marciales, box, yoga o cualquier disciplina ofrecida en este
            gimnasio implican esfuerzo físico, contacto y riesgo de lesiones,
            tanto leves como graves. Entiendo estos riesgos y los acepto de
            manera voluntaria.
          </li>
          <li>
            <b>Liberación de Responsabilidad:</b> Por la presente, libero al
            gimnasio {GYM_NAME}, a sus propietarios, entrenadores y personal, de
            toda responsabilidad civil, penal o de cualquier otro tipo por
            lesiones, accidentes o daños que pudieran surgir durante la práctica
            de las actividades o el uso de las instalaciones.
          </li>
          <li>
            <b>Condición Médica:</b> Declaro estar en condiciones físicas
            adecuadas para participar y no tener enfermedades o lesiones que
            representen un riesgo para mi salud o la de otros. En caso de tener
            alguna condición médica, notifico y asumo la total responsabilidad
            de participar bajo mi propio riesgo.
          </li>
          <li>
            <b>Derechos de Imagen:</b> Autorizo al gimnasio a usar fotografías o
            videos donde aparezca durante entrenamientos o eventos con fines
            promocionales, sin compensación económica.
            <br />
            <span className="block mt-1">
              <input
                type="checkbox"
                name="allow_image_rights"
                checked={form.allow_image_rights}
                onChange={handleChange}
              />{" "}
              No autorizo el uso de mi imagen.
            </span>
          </li>
          <li>
            <b>Menores de Edad:</b> En caso de que el participante sea menor de
            edad, el padre, madre o tutor legal debe firmar este documento,
            asumiendo la total responsabilidad por la participación del menor y
            aceptando las condiciones aquí descritas.
          </li>
          <li>
            <b>Declaración y Firma Electrónica:</b> He leído y comprendido los
            términos de este documento. Confirmo que mi firma electrónica tiene
            la misma validez legal que una firma física conforme a las leyes
            mexicanas aplicables.
            <br />
            <span className="block mt-1">
              <input
                type="checkbox"
                name="accepted_esign_law"
                checked={form.accepted_esign_law}
                onChange={handleChange}
                required
              />{" "}
              Declaro y acepto que esta firma electrónica constituye mi
              consentimiento legal y voluntario.
            </span>
          </li>
        </ol>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {!form.is_minor && (
          <>
            <input
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              placeholder="Nombre del Participante"
              name="participant_name"
              value={form.participant_name}
              onChange={handleChange}
              required
            />
            <input
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              type="email"
              placeholder="Correo Electrónico"
              name="participant_email"
              value={form.participant_email}
              onChange={handleChange}
              required
            />
            <input
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              type="number"
              min={1}
              max={99}
              placeholder="Edad"
              name="participant_age"
              value={form.participant_age}
              onChange={handleChange}
              required
            />
          </>
        )}

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_minor"
            checked={form.is_minor}
            onChange={handleChange}
          />
          El participante es menor de edad
        </label>

        {form.is_minor && (
          <>
            <input
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              placeholder="Nombre del Menor"
              name="minor_name"
              value={form.minor_name}
              onChange={handleChange}
              required
            />
            <input
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              type="number"
              min={1}
              max={99}
              placeholder="Edad del Menor"
              name="minor_age"
              value={form.minor_age}
              onChange={handleChange}
              required
            />
            <input
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              placeholder="Nombre del Padre/Madre o Tutor"
              name="guardian_name"
              value={form.guardian_name}
              onChange={handleChange}
              required
            />
            <input
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              placeholder="Relación"
              name="guardian_relation"
              value={form.guardian_relation}
              onChange={handleChange}
              required
            />
          </>
        )}

        <input type="hidden" name="gym_name" value={GYM_NAME} />
        <input type="hidden" name="owners" value={OWNERS} />
        <input type="hidden" name="gym_location" value={GYM_LOCATION} />

        <div className="mb-4">
          <label className="block mb-2 font-semibold">
            Firma Electrónica (dibuje aquí):
          </label>
          <div className="border-2 border-gray-400 rounded-lg bg-white w-full h-40 mb-2 flex items-center">
            <SignatureCanvas
              penColor="black"
              canvasProps={{ width: 400, height: 150, className: "w-full h-full" }}
              ref={sigCanvasRef}
              backgroundColor="#fff"
            />
          </div>
          <button
            type="button"
            onClick={() => sigCanvasRef.current?.clear()}
            className="bg-gray-500 hover:bg-gray-700 text-white px-2 py-1 rounded mr-2"
          >
            Borrar firma
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting || uploadingSignature}
          className="w-full bg-brand-red hover:bg-brand-blue text-white p-3 rounded-lg font-bold"
        >
          {submitting || uploadingSignature ? "Enviando…" : "Firmar y Enviar"}
        </button>

        {result?.success && (
          <p className="text-green-400 font-bold mt-2">¡Formulario enviado!</p>
        )}
        {result?.error && (
          <p className="text-red-400 font-bold mt-2">{result.error}</p>
        )}
      </form>
    </div>
  );
}
