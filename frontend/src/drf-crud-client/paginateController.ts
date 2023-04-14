import { useCallback, useMemo, useState } from 'react';

export interface PaginationController {
  page: number;
  pagesCount: number;
  goFirst: () => void;
  goPrev: () => void;
  goNext: () => void;
  goLatest: () => void;
  goPage: (v: number) => void;
}

export function usePaginationController(initialPage = 1, pagesCount = 1) {
  const [page, setPage] = useState(Math.max(1, Math.min(pagesCount || 1, initialPage)));

  const goFirst = useCallback(() => {
    setPage(1);
  }, []);

  const goPrev = useCallback(() => {
    setPage((v) => Math.max(1, v - 1));
  }, []);

  const goNext = useCallback(() => {
    setPage((v) => Math.min(pagesCount || 1, v + 1));
  }, [pagesCount]);

  const goLatest = useCallback(() => {
    setPage(pagesCount || 1);
  }, [pagesCount]);

  const goPage = useCallback(
    (page: number) => {
      setPage(Math.max(1, Math.min(pagesCount || 1, page)));
    },
    [pagesCount],
  );

  return useMemo<PaginationController>(
    () => ({
      page,
      goFirst,
      goPrev,
      goNext,
      goLatest,
      goPage,
      pagesCount
    }),
    [page, goFirst, goLatest, goNext, goPrev, goPage, pagesCount],
  );
}
