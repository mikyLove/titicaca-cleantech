import type { Report } from "../types/report.types";

export default function ReportCard({ report }: { report: Report }) {
  return (
    <article className="border rounded p-4 bg-white shadow-sm">
      <h3 className="font-medium text-lg mb-1">{report.title}</h3>
      <p className="text-sm text-gray-700 mb-2">{report.description}</p>

      {report.image_url && (
        <img src={report.image_url} alt={`Imagen del reporte ${report.title}`} className="w-full h-48 object-cover rounded mb-2" />
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{report.location ?? "Ubicación no especificada"}</span>
        <span>{new Date(report.created_at).toLocaleString()}</span>
      </div>
    </article>
  );
}
