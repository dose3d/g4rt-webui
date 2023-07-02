import { FieldValues } from 'react-hook-form';
import { ActionOptions, ApiOptions, ResourceOptions } from './types';
import { UseQueryWrapper, useQueryWrapper, UseQueryWrapperResult } from './useQueryWrapper';
import { buildEndpoint, buildQueryKey } from './utils';

/**
 * Retrieve and cache list of entities from DRF backend by REST API.
 *
 * Hook wrap useQueryWrapper and configure endpoint and queryKey.
 *
 * @template TEntity schema of entity
 * @template TFetchListError schema of error of entity fetching
 */
export type UseDrfList<
  TEntity extends FieldValues = FieldValues,
  TFetchListError extends FieldValues = FieldValues,
> = Omit<UseQueryWrapper<TEntity[], TFetchListError>, 'queryKey' | 'endpoint'> &
  ApiOptions &
  ResourceOptions &
  ActionOptions;

/**
 * Wrap UseQueryWrapperResult by set templates for Entity and error of fetching list of entities.
 *
 * @template TEntity schema of entity
 * @template TFetchListError schema of error of entity fetching
 */
export type UseDrfListResult<
  TEntity extends FieldValues = FieldValues,
  TFetchEntityError extends FieldValues = FieldValues,
> = UseQueryWrapperResult<TEntity[], TFetchEntityError>;

/**
 * Hook for retrieve list of entities from DRF backend by REST API and store in cache.
 *
 * The cache is updated or invalidated by useCUD.
 *
 * Example: GET /api/v1/users/
 *
 * const { data: users } = useDrfList({api: '/api/v1/', resource: 'users'});
 * Data will be cached using key: ['users', 'list']
 *
 * If you want to pass query params i.e. for backend filters:
 *
 * Example: GET /api/v1/users/?category=gamers&age=16
 *
 * const params = { category: 'gamers', age: 16 }
 * const { data: users } = useDrfList({api: '/api/v1/', resource: 'users', config: {params}});
 * Data will be cached using key: ['users', 'list', stringify(params)]
 *
 * The filter parameters are serialized to string and store in different queryKey.
 *
 * Example with action: GET /api/v1/users/active/
 *
 * const { data: users } = useDrfList({
 *   api: '/api/v1/',
 *   resource: 'users',
 *   action: 'active'
 * });
 *
 * Data will be cached using key: ['users', 'list', 'active']
 *
 * @see buildEndpoint for configure endpoint
 */
export function useDrfList<
  TEntity extends FieldValues = FieldValues,
  TFetchListError extends FieldValues = FieldValues,
>(args: UseDrfList<TEntity, TFetchListError>): UseDrfListResult<TEntity, TFetchListError> {
  const { api, resource, resourceQK = resource, action, actionQK = action, ...rest } = args;

  const endpoint = buildEndpoint(api, resource, undefined, action);
  const queryKey = buildQueryKey(resourceQK, undefined, actionQK);

  // When filters are used append it to queryKey
  if (rest.config?.params) {
    queryKey.push(JSON.stringify(rest.config?.params));
  }

  return useQueryWrapper<TEntity[], TFetchListError>({
    queryKey,
    endpoint,
    ...rest,
  });
}
