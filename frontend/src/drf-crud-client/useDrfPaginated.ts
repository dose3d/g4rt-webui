import { FieldValues } from 'react-hook-form';
import { ApiOptions, PaginatedOptions, ResourceOptions } from './types';
import { buildEndpoint, buildQueryKey } from './utils';
import { useQueryWrapper, UseQueryWrapper, UseQueryWrapperResult } from './useQueryWrapper';

/**
 * Response when PageNumberPagination is used as pagination_class.
 */
export interface PaginatedResponse<TEntity> {
  /**
   * Count of all entities.
   *
   * Count of pages = ceil(count/page_size)
   */
  count: number;

  /**
   * URL query for fetch next page. Not used by useDrfPaginated.
   */
  next: string;

  /**
   * URL query for fetch previous page. Not used by useDrfPaginated.
   */
  previous: string;

  /**
   * Entities in fetched page.
   */
  results: TEntity[];
}

/**
 * Retrieve and cache page of entities from DRF backend by REST API.
 *
 * Hook wrap useQueryWrapper and configure endpoint and queryKey and config.params.
 *
 * @template TEntity schema of entity
 * @template TFetchListError schema of error of entity fetching
 */
export type UseDrfPaginated<
  TEntity extends FieldValues = FieldValues,
  TFetchPaginatedError extends FieldValues = FieldValues,
> = Omit<UseQueryWrapper<PaginatedResponse<TEntity>, TFetchPaginatedError>, 'queryKey' | 'endpoint'> &
  ApiOptions &
  ResourceOptions &
  PaginatedOptions;

/**
 * Wrap UseQueryWrapperResult by set templates for Entity and error of fetching page of entities.
 *
 * @template TEntity schema of entity
 * @template TFetchListError schema of error of entity fetching
 */
export type UseDrfPaginatedResult<
  TEntity extends FieldValues = FieldValues,
  TFetchPaginatedError extends FieldValues = FieldValues,
> = UseQueryWrapperResult<PaginatedResponse<TEntity>, TFetchPaginatedError>;

/**
 * Hook for retrieve page of entities from DRF backend by REST API and store in cache.
 *
 * The cache is updated or invalidated by useCUD.
 *
 * Example: GET /api/v1/users/?page=4&page_size=100
 *
 * const { data: { results: users } = {} } = useDrfPaginated({
 *   api: '/api/v1/',
 *   resource: 'users',
 *   page: 4,
 *   pageSize: 100
 * });
 *
 * If you want to pass query params i.e. for backend filters:
 *
 * Example: GET /api/v1/users/?page=4&page_size=100&category=gamers&age=16
 *
 * const params = { category: 'gamers', age: 16 }
 * const { data: { results: users } = {} } = useDrfPaginated({
 *   api: '/api/v1/',
 *   resource: 'users',
 *   page: 4,
 *   pageSize: 100,
 *   config: { params },
 * });
 *
 * The filter parameters are serialized to string and store in different queryKey.
 *
 * @see buildEndpoint for configure endpoint
 */
export function useDrfPaginated<
  TEntity extends FieldValues = FieldValues,
  TFetchPaginatedError extends FieldValues = FieldValues,
>(args: UseDrfPaginated<TEntity, TFetchPaginatedError>): UseDrfPaginatedResult<TEntity, TFetchPaginatedError> {
  const { api, resource, resourceQK = resource, pageSize = 10, page = 1, config, ...rest } = args;

  const { params, ...configRest } = config || {};
  const endpoint = buildEndpoint(api, resource);
  const queryKey = buildQueryKey(resourceQK);

  // Append page size and page number to queryKey
  queryKey.push('page', `${pageSize}`, `${page}`);

  // When filters are used append it to queryKey
  if (params) {
    queryKey.push(JSON.stringify(params));
  }

  return useQueryWrapper<PaginatedResponse<TEntity>, TFetchPaginatedError>({
    // append page and page_size to config.params
    config: { params: { ...(params || {}), page_size: pageSize, page }, ...configRest },
    endpoint,
    queryKey,
    ...rest,
  });
}
