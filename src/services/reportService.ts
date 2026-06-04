import { supabase } from "../lib/supabase";
import type { Report, CreateReportPayload } from "../types/report.types";

const STORAGE_BUCKET = "report-images";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function uploadImage(
  userId: string,
  reportId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const filePath = `${userId}/${reportId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Error al subir imagen: ${error.message}`);
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

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error("Debes iniciar sesión para crear un reporte.");
  }

  let imageUrl: string | null = null;

  if (payload.file) {
    if (!ALLOWED_MIME_TYPES.includes(payload.file.type)) {
      throw new Error("Formato no válido. Solo se aceptan JPEG, PNG y WebP.");
    }
    if (payload.file.size > MAX_FILE_SIZE) {
      throw new Error("La imagen no debe superar los 2 MB.");
    }
    imageUrl = await uploadImage(userId, reportId, payload.file);
  }

  const insertPayload = {
    id: reportId,
    title: payload.title,
    description: payload.description,
    location: payload.location ?? null,
    image_url: imageUrl,
    user_id: userId,
  };

  const { error } = await supabase
    .from("reports")
    .insert(insertPayload);

  if (error) {
    console.error("Error al crear reporte en Supabase:", error.message);
    throw new Error("Error al crear reporte. Intenta de nuevo.");
  }

  const newReport: Report = {
    id: reportId,
    title: payload.title,
    description: payload.description,
    location: payload.location ?? null,
    image_url: imageUrl,
    user_id: userId,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return newReport;
}

export interface ListReportsOptions {
  page?: number;
  limit?: number;
  onlyMine?: boolean;
}

export async function listReports(
  opts: ListReportsOptions = {}
): Promise<Report[]> {
  const { page = 1, limit = 20, onlyMine = false } = opts;

  const from = (page - 1) * limit;
  const to = page * limit - 1;

  // Ensure we have session so Supabase sends auth token (RLS enforcement)
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id ?? null;

  let query = supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (onlyMine) {
    // if onlyMine requested, require an authenticated user
    if (!userId) {
      return [];
    }
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error al listar reportes en Supabase:", error.message);
    throw new Error("Error al cargar reportes. Intenta de nuevo.");
  }

  return (data ?? []) as Report[];
}
