import ReportCard from "./ReportCard";
import type { Report } from "../types/report.types";

export default function ReportsList({
  reports,
  loading,
  error,
  onRefresh,
  onNext,
  onPrev,
  page,
  hasMore,
}: {
  reports: Report[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onNext: () => void;
  onPrev: () => void;
  page: number;
  hasMore: boolean;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Reportes</h2>
        <div className="flex items-center gap-3">
          <button className="text-sm text-blue-600" onClick={onRefresh}>
            Actualizar
          </button>
          <span className="text-sm text-gray-500">Página {page}</span>
        </div>
      </div>

      {loading && <p className="text-gray-500">Cargando reportes…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && reports.length === 0 && (
        <p className="text-gray-600">No hay reportes todavía.</p>
      )}

      <div className="grid grid-cols-1 gap-4 mb-4">
        {reports.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button className="px-3 py-1 border rounded" onClick={onPrev} disabled={page === 1}>
          Anterior
        </button>
        <button className="px-3 py-1 border rounded" onClick={onNext} disabled={!hasMore}>
          Siguiente
        </button>
      </div>
    </section>
  );
}
