import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';

/**
 * Helpers for navigate on pages.
 */
export interface PagesController {
  /**
   * Computed count of pages (count of pages per page_size).
   */
  pagesCount: number;

  /**
   * Go to page no 1.
   */
  goFirst: () => void;

  /**
   * Go to previous page but not lesser than 1.
   */
  goPrev: () => void;

  /**
   * Go to next page but not greater than pagesCount.
   */
  goNext: () => void;

  /**
   * Go to pagesCount page.
   */
  goLatest: () => void;

  /**
   * Go to specified page but in [1, pagesCount] range.
   * @param page page number counted form 1.
   */
  goPage: (page: number) => void;
}

export interface UsePagesController {
  /**
   * Size of page, used for calculate count of pages.
   */
  pageSize: number;

  /**
   * Return of useDrfPaginated, uses only data.count value.
   */
  paginated?: { data?: { count: number } };

  /**
   * Dispatcher for set current page.
   */
  setPage: Dispatch<SetStateAction<number>>;
}

/**
 * Provide helpers methods for navigate on pages.
 *
 * @see UsePagesController
 */
export function usePagesController({ setPage, pageSize = 10, paginated }: UsePagesController) {
  const { data: { count = 0 } = {} } = paginated || {};
  const pagesCount = Math.max(Math.ceil(count / pageSize), 1);

  const goFirst = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const goPrev = useCallback(() => {
    setPage((v) => Math.max(1, v - 1));
  }, [setPage]);

  const goNext = useCallback(() => {
    setPage((v) => Math.min(pagesCount || 1, v + 1));
  }, [pagesCount, setPage]);

  const goLatest = useCallback(() => {
    setPage(pagesCount || 1);
  }, [pagesCount, setPage]);

  const goPage = useCallback(
    (page: number) => {
      setPage(Math.max(1, Math.min(pagesCount || 1, page)));
    },
    [pagesCount, setPage],
  );

  return useMemo<PagesController>(
    () => ({
      goFirst,
      goPrev,
      goNext,
      goLatest,
      goPage,
      pagesCount,
    }),
    [goFirst, goLatest, goNext, goPrev, goPage, pagesCount],
  );
}
