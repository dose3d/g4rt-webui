import { FieldValues } from 'react-hook-form';
import { ApiOptions, EntityOptions, ResourceOptions } from './types';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { buildEndpoint, buildQueryKey } from './utils';
import { useMutationWrapper, UseMutationWrapper, UseMutationWrapperResult } from './useMutationWrapper';
import { DrfError, DrfErrorSimple } from './errors';
import { AxiosRequestConfig } from 'axios';

/**
 * Create, update or delete single entity via DRF backend by REST API.
 *
 * Hook wrap useMutationWrapper and configure config.url and queryKey.
 *
 * @template PK value type of primaryKey
 * @template TDeleteEntityError schema of request, should be schema of entity or Partial<entity>
 * @template TResponse schema of response, should be schema of entity
 * @template TRequest schema of request, should be schema of entity or Partial<entity>
 * @template TContext passed directly
 */
export type UseDrfDelete<
  PK extends number | string = number | string,
  TDeleteEntityError extends FieldValues = DrfErrorSimple,
  TResponse extends FieldValues = FieldValues,
  TRequest extends FieldValues = FieldValues,
  TContext = undefined,
> = Omit<UseMutationWrapper<TResponse, DrfError<TDeleteEntityError>, TRequest, TContext>, 'config'> &
  ApiOptions &
  ResourceOptions &
  EntityOptions<PK> & {
    /**
     * Cache update behaviour.
     *
     * Cause follow action on [resourceQK, 'entity', primaryKeyQK]:
     * - default = invalidate - invalidateQueries on [resourceQK, 'entity', primaryKeyQK]
     * - none - no action on [resourceQK, 'entity', primaryKeyQK]
     */
    cacheBehaviour?: 'default' | 'invalidate' | 'none';

    /**
     * Invalidate [resourceQK, 'list']. Default: true.
     */
    cacheInvalidateList?: boolean;

    /**
     * Optional config for axios. The method is filled by DELETE, url by buildEndpoint.
     */
    config?: AxiosRequestConfig<Partial<TRequest>>;
  };

/**
 * Values returned from useMutationWrapper.
 *
 * All values are passed directly from useMutation.
 *
 * @template TDeleteEntityError schema of request, should be schema of entity or Partial<entity>
 * @template TResponse schema of response, should be schema of entity
 * @template TRequest schema of request, should be schema of entity or Partial<entity>
 * @template TContext passed directly
 */
export type UseDrfCUDResult<
  TDeleteEntityError extends FieldValues = DrfErrorSimple,
  TResponse extends FieldValues = FieldValues,
  TRequest extends FieldValues = FieldValues,
  TContext = undefined,
> = UseMutationWrapperResult<TResponse, DrfError<TDeleteEntityError>, TRequest, TContext>;

/**
 * Hook for delete and clear cache when success.
 *
 * This is simpler version of useDrfCUD for DELETE only.
 *
 * Example: DELETE /api/v1/users/7/
 *
 * const { mutate: remove } = useDrfDelete({
 *   api: '/api/v1/',
 *   resource: 'users',
 *   primaryKey: 7,
 * });
 * remove({});
 *
 * @see buildEndpoint for configure endpoint
 */
export function useDrfDelete<
  PK extends number | string = number | string,
  TDeleteEntityError extends FieldValues = DrfErrorSimple,
  TResponse extends FieldValues = FieldValues,
  TRequest extends FieldValues = FieldValues,
  TContext = undefined,
>(
  params: UseDrfDelete<PK, TDeleteEntityError, TResponse, TRequest, TContext>,
): UseDrfCUDResult<TDeleteEntityError, TResponse, TRequest, TContext> {
  const {
    api,
    resource,
    resourceQK = resource,
    primaryKey,
    primaryKeyQK = primaryKey,
    onSuccess,
    cacheBehaviour = 'default',
    cacheInvalidateList = true,
    config,
    ...rest
  } = params;

  const url = buildEndpoint(api, resource, primaryKey);
  const queryClient = useQueryClient();

  const hookOnSuccess = useCallback(
    (data: TResponse, values: TRequest, context?: TContext) => {
      const queryKey = buildQueryKey(resourceQK, primaryKeyQK || data.id);

      if (cacheInvalidateList) {
        queryClient.invalidateQueries({ queryKey: buildQueryKey(resourceQK) }).then();
      }

      switch (cacheBehaviour) {
        case 'default':
        case 'invalidate':
          queryClient.invalidateQueries({ queryKey }).then();
          break;
      }

      if (onSuccess) {
        onSuccess(data, values, context);
      }
    },
    [cacheBehaviour, cacheInvalidateList, onSuccess, primaryKeyQK, queryClient, resourceQK],
  );

  return useMutationWrapper<TResponse, DrfError<TDeleteEntityError>, TRequest, TContext>({
    config: { url, method: 'DELETE', ...config },
    onSuccess: hookOnSuccess,
    ...rest,
  });
}
