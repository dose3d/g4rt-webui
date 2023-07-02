import { FieldValues } from 'react-hook-form';
import { ActionOptions, ApiOptions, EntityOptions, ResourceOptions } from './types';
import { buildEndpoint, buildQueryKey } from './utils';
import { useQueryWrapper, UseQueryWrapper, UseQueryWrapperResult } from './useQueryWrapper';

/**
 * Retrieve and cache single entity from DRF backend by REST API.
 *
 * Hook wrap useQueryWrapper and configure endpoint and queryKey.
 *
 * @template TEntity schema of entity
 * @template PK value type of primaryKey
 * @template TFetchEntityError schema of error of entity fetching
 */
export type UseDrfEntity<
  TEntity extends FieldValues = FieldValues,
  PK extends number | string = number | string,
  TFetchEntityError extends FieldValues = FieldValues,
> = Omit<UseQueryWrapper<TEntity, TFetchEntityError>, 'queryKey' | 'endpoint'> &
  ApiOptions &
  ResourceOptions &
  EntityOptions<PK> &
  ActionOptions;

/**
 * Wrap UseQueryWrapperResult by set templates for Entity end error of fetching entity.
 *
 * @template TEntity schema of entity
 * @template TFetchEntityError schema of error of entity fetching
 *
 */
export type UseDrfEntityResult<
  TEntity extends FieldValues = FieldValues,
  TFetchEntityError extends FieldValues = FieldValues,
> = UseQueryWrapperResult<TEntity, TFetchEntityError>;

/**
 * Hook for retrieve entity from DRF backend by REST API and store in cache.
 *
 * The cache is updated or invalidated by useCUD.
 *
 * Example: GET /api/v1/users/7/
 *
 * const { data: user } = useDrfEntity({api: '/api/v1/', resource: 'users', primaryKey: 7});
 * Data will be cached using key: ['users', 'entity', '7']
 *
 * Example with action: GET /api/v1/users/7/details/
 *
 * const { data: userDetails } = useDrfEntity({
 *   api: '/api/v1/',
 *   resource: 'users',
 *   primaryKey: 7,
 *   action: 'details'
 * });
 *
 * Data will be cached using key: ['users', 'entity', '7', 'details']
 *
 * @see buildEndpoint for configure endpoint
 */
export function useDrfEntity<
  TEntity extends FieldValues = FieldValues,
  PK extends number | string = number | string,
  TFetchEntityError extends FieldValues = FieldValues,
>(args: UseDrfEntity<TEntity, PK, TFetchEntityError>): UseDrfEntityResult<TEntity, TFetchEntityError> {
  const {
    api,
    resource,
    resourceQK = resource,
    primaryKey,
    primaryKeyQK = primaryKey,
    action,
    actionQK = action,
    ...rest
  } = args;
  const endpoint = buildEndpoint(api, resource, primaryKey, action);
  const queryKey = buildQueryKey(resourceQK, primaryKeyQK, actionQK);

  return useQueryWrapper<TEntity, TFetchEntityError>({
    queryKey,
    endpoint,
    ...rest,
  });
}
