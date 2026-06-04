import ReportForm from "../components/ReportForm";
import ReportsList from "../components/ReportsList";
import useReports from "../hooks/useReports";

export default function HomePage() {
  const { reports, loading, error, page, hasMore, next, prev, refetch } = useReports();

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-6">Inicio</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ReportForm onSuccess={refetch} />
        </div>

        <div>
          <ReportsList
            reports={reports}
            loading={loading}
            error={error}
            onRefresh={refetch}
            onNext={next}
            onPrev={prev}
            page={page}
            hasMore={hasMore}
          />
        </div>
      </div>
    </div>
  );
}
