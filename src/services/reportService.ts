export type CreateReportPayload = {
  title: string;
  description: string;
  location?: string;
  file?: File;
};

export async function createReport(payload: CreateReportPayload) {
  // Stub implementation: replace with Supabase storage + insert when ready.
  // For now, log and return a fake id.
  // eslint-disable-next-line no-console
  console.log("createReport stub", payload);
  return Promise.resolve({ id: Date.now().toString() });
}
