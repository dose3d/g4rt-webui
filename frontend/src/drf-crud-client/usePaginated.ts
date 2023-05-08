import { FieldValues } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { ModelOptions, PaginatedOptions } from './types';
import { usePaginationController } from './usePaginationController';
import { UseDrfQuery, useDrfQuery } from './useDrfQuery';

export interface PaginatedResponse<E> {
  count: number;
  next: string;
  pages_count: number;
  previous: string;
  results: E[];
}

export type UsePaginated<Entity extends FieldValues = FieldValues> = Omit<
  UseDrfQuery<PaginatedResponse<Entity>>,
  'queryKey'
> &
  ModelOptions &
  PaginatedOptions;

export function usePaginated<Entity extends FieldValues = FieldValues>(args: UsePaginated<Entity>) {
  const { queryKey, pageSize = 10, config = {}, ...rest } = args;

  const { params = {}, ...configRest } = config;

  const [pagesCount, setPagesCount] = useState(1);
  const controller = usePaginationController(1, pagesCount);
  const drfQuery = useDrfQuery<PaginatedResponse<Entity>>({
    config: { params: { ...params, page_size: pageSize, page: controller.page }, ...configRest },
    queryKey: queryKey ? [queryKey, 'page', pageSize, controller.page] : undefined,
    ...rest,
  });

  const pages_count = drfQuery.data?.pages_count;
  useEffect(() => setPagesCount(pages_count || 1), [pages_count]);

  return { ...drfQuery, controller };
}
