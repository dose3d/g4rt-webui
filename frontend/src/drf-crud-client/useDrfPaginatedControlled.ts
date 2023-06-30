import { FieldValues } from 'react-hook-form';
import { UseDrfPaginated, useDrfPaginated, UseDrfPaginatedResult } from './useDrfPaginated';
import { useState } from 'react';
import { PagesController, usePagesController } from './usePagesController';

/**
 * Extend PagesController with current page.
 */
export type PaginationController = PagesController & {
  /**
   * Current page.
   */
  page: number;
};

/**
 * Wrap UseDrfPaginatedResult by add .
 *
 * @template TEntity schema of entity
 * @template TFetchListError schema of error of entity fetching
 */
export type UseDrfPaginatedControlledResult<
  TEntity extends FieldValues = FieldValues,
  TFetchPaginatedError extends FieldValues = FieldValues,
> = UseDrfPaginatedResult<TEntity, TFetchPaginatedError> & {
  /**
   * Functions for switch to first/prev/next/latest page.
   */
  controller: PaginationController;
};

/**
 * Join useDrfPaginated and usePagesController for handle state of current page.
 *
 * @see useDrfPaginated
 * @see usePagesController
 */
export function useDrfPaginatedControlled<
  TEntity extends FieldValues = FieldValues,
  TFetchPaginatedError extends FieldValues = FieldValues,
>(
  args: UseDrfPaginated<TEntity, TFetchPaginatedError>,
): UseDrfPaginatedControlledResult<TEntity, TFetchPaginatedError> {
  const { page: initialPage = 1, ...rest } = args;
  const { pageSize = 10 } = rest;
  const [page, setPage] = useState(initialPage);
  const paginated = useDrfPaginated<TEntity, TFetchPaginatedError>({ page, ...rest });
  const controller = usePagesController({ setPage, pageSize, paginated });
  return { ...paginated, controller: { page, ...controller } };
}
