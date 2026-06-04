import { useEffect, useState, useCallback } from "react";
import type { Report } from "../types/report.types";
import { listReports, type ListReportsOptions } from "../services/reportService";

export default function useReports(initialOptions?: ListReportsOptions) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialOptions?.page ?? 1);
  const [limit] = useState<number>(initialOptions?.limit ?? 20);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const fetchReports = useCallback(
    async (p = page) => {
      setLoading(true);
      setError(null);
      try {
        const data = await listReports({ page: p, limit, onlyMine: false });
        setReports(data);
        setHasMore(data.length === limit);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [limit, page]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchReports(page);
  }, [fetchReports, page]);

  const next = useCallback(() => setPage((p) => p + 1), []);
  const prev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const refetch = useCallback(() => void fetchReports(page), [fetchReports, page]);

  return { reports, loading, error, page, limit, hasMore, next, prev, refetch } as const;
}
