import { supabase } from "../lib/supabase";
import type { Report, CreateReportPayload } from "../types/report.types";

const STORAGE_BUCKET = "report-images";

async function uploadImage(
  reportId: string,
  file: File
): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const filePath = `public/${reportId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Error al subir imagen:", error.message);
    return null;
  }

  const { data: publicUrl } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
}

export async function createReport(
  payload: CreateReportPayload
): Promise<Report> {
  const reportId = crypto.randomUUID();

  let imageUrl: string | null = null;

  if (payload.file) {
    imageUrl = await uploadImage(reportId, payload.file);
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      id: reportId,
      title: payload.title,
      description: payload.description,
      location: payload.location ?? null,
      image_url: imageUrl,
      user_id: null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear reporte: ${error.message}`);
  }

  return data as Report;
}
