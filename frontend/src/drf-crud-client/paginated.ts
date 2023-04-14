import { FieldValues } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { PaginatedResponse } from '../api/common';
import { ModelOptions, PaginatedOptions } from './types';
import { usePaginationController } from './paginateController';
import { UseDrfQuery, useDrfQuery } from './query';

export type UsePaginated<TFieldValues extends FieldValues = FieldValues> = Omit<
  UseDrfQuery<PaginatedResponse<TFieldValues>>,
  'queryKey'
> &
  ModelOptions &
  PaginatedOptions;

export function usePaginated<TFieldValues extends FieldValues = FieldValues>(args: UsePaginated<TFieldValues>) {
  const { queryKey, pageSize = 10, config = {}, ...rest } = args;

  const { params = {}, ...configRest } = config;

  const [pagesCount, setPagesCount] = useState(1);
  const controller = usePaginationController(1, pagesCount);
  const drfQuery = useDrfQuery<PaginatedResponse<TFieldValues>>({
    config: { params: { ...params, page_size: pageSize, page: controller.page }, ...configRest },
    queryKey: queryKey ? [queryKey, 'page', pageSize, controller.page] : undefined,
    ...rest,
  });

  const pages_count = drfQuery.data?.pages_count;
  useEffect(() => setPagesCount(pages_count || 1), [pages_count]);

  return { ...drfQuery, controller };
}
