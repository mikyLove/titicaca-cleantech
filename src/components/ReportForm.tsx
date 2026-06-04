import React, { useState } from "react";
import { createReport } from "../services/reportService";

type FormState = {
  title: string;
  description: string;
  location: string;
  file: File | null;
};

export default function ReportForm() {
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    location: "",
    file: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function onChange(field: keyof FormState, value: any) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!form.title.trim() || !form.description.trim()) {
      setMessage("Por favor completa título y descripción.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim() || undefined,
        file: form.file || undefined,
      };

      const res = await createReport(payload);
      setMessage(`Reporte creado: ${res.id}`);
      setForm({ title: "", description: "", location: "", file: null });
    } catch (err) {
      setMessage("Error al crear el reporte.");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="w-full max-w-xl bg-white p-6 rounded shadow" onSubmit={onSubmit}>
      <h2 className="text-xl font-semibold mb-4">Nuevo reporte</h2>

      <label className="block mb-2">
        <span className="text-sm">Título</span>
        <input
          className="mt-1 block w-full border rounded px-3 py-2"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Ej: Basura en la orilla del lago"
          required
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm">Descripción</span>
        <textarea
          className="mt-1 block w-full border rounded px-3 py-2"
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Describe el tipo y ubicación del residuo"
          rows={4}
          required
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm">Ubicación (opcional)</span>
        <input
          className="mt-1 block w-full border rounded px-3 py-2"
          value={form.location}
          onChange={(e) => onChange("location", e.target.value)}
          placeholder="Dirección aproximada, distrito o coordenadas"
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm">Foto (opcional)</span>
        <input
          type="file"
          accept="image/*"
          className="mt-1"
          onChange={(e) => onChange("file", e.target.files?.[0] ?? null)}
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Enviando…" : "Enviar reporte"}
        </button>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </div>
    </form>
  );
}
