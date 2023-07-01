import { FieldValues } from 'react-hook-form';
import { ApiOptions, EntityOptions, ResourceOptions } from './types';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { buildEndpoint, buildQueryKey } from './utils';
import { useMutationWrapper, UseMutationWrapper, UseMutationWrapperResult } from './useMutationWrapper';
import { DrfError } from './errors';

/**
 * Create, update or delete single entity via DRF backend by REST API.
 *
 * Hook wrap useMutationWrapper and configure config.url and queryKey.
 *
 * @template TRequest schema of request, should be schema of entity or Partial<entity>
 * @template PK value type of primaryKey
 * @template TResponse schema of response, should be schema of entity
 * @template TContext passed directly
 */
export type UseDrfCUD<
  TRequest extends FieldValues = FieldValues,
  PK extends number | string = number | string,
  TResponse extends FieldValues = TRequest,
  TContext = undefined,
> = UseMutationWrapper<TResponse, DrfError<TRequest>, TRequest, TContext> &
  ApiOptions &
  ResourceOptions &
  Partial<EntityOptions<PK>> & {
    cacheBehaviour?: 'default' | 'set' | 'invalidate' | 'none';
  };

/**
 * Values returned from useMutationWrapper.
 *
 * All values are passed directly from useMutation.
 *
 * @template TRequest schema of request, should be schema of entity or Partial<entity>
 * @template TResponse schema of response, should be schema of entity
 * @template TContext passed directly
 */
export type UseDrfCUDResult<
  TRequest extends FieldValues = FieldValues,
  TResponse extends FieldValues = TRequest,
  TContext = undefined,
> = UseMutationWrapperResult<TResponse, DrfError<TRequest>, TRequest, TContext>;

/**
 * Hook for write entity (create, update od delete) and cache when success.
 *
 * This hook can be used for delete but recommended to use dedicated useDrfDelete.
 *
 * Example of create entity: POST /api/v1/users/
 *
 * const { mutate: create } = useDrfCUD({
 *   api: '/api/v1/',
 *   resource: 'users',
 *   config: { method: 'POST' }
 * });
 * create({ first_name: 'John', ... });
 *
 * Example of update entity: PUT /api/v1/users/7/
 *
 * const { mutate: update } = useDrfCUD({
 *   api: '/api/v1/',
 *   resource: 'users',
 *   primaryKey: 7,
 *   config: { method: 'PUT' },
 * });
 * update({ id: 7, first_name: 'Mike', ... });
 *
 * Example of delete entity: DELETE /api/v1/users/7/
 *
 * const { mutate: remove } = useDrfCUD({
 *   api: '/api/v1/',
 *   resource: 'users',
 *   primaryKey: 7,
 *   config: { method: 'DELETE' },
 * });
 * remove({});
 *
 * @see buildEndpoint for configure endpoint
 */
export function useDrfCUD<
  TRequest extends FieldValues = FieldValues,
  PK extends number | string = number | string,
  TResponse extends FieldValues = TRequest,
  TContext = undefined,
>(params: UseDrfCUD<TRequest, PK, TResponse, TContext>): UseDrfCUDResult<TRequest, TResponse, TContext> {
  const {
    api,
    resource,
    resourceQK = resource,
    primaryKey,
    primaryKeyQK = primaryKey,
    onSuccess,
    cacheBehaviour = 'default',
    config,
    ...rest
  } = params;

  const url = buildEndpoint(api, resource, primaryKey);
  const queryClient = useQueryClient();

  const hookOnSuccess = useCallback(
    (data: TResponse, values: TRequest, context?: TContext) => {
      const queryKey = buildQueryKey(resourceQK, primaryKeyQK || data.id);

      if (cacheBehaviour !== 'none') {
        queryClient.invalidateQueries({ queryKey: buildQueryKey(resourceQK) }).then();
      }

      switch (cacheBehaviour) {
        case 'default':
          if (data) {
            queryClient.setQueryData(queryKey, data);
          } else if (primaryKey) {
            queryClient.invalidateQueries({ queryKey }).then();
          }
          break;

        case 'set':
          queryClient.setQueryData(queryKey, data);
          break;

        case 'invalidate':
          queryClient.invalidateQueries({ queryKey }).then();
          break;
      }

      if (onSuccess) {
        onSuccess(data, values, context);
      }
    },
    [cacheBehaviour, onSuccess, primaryKey, primaryKeyQK, queryClient, resourceQK],
  );

  return useMutationWrapper<TResponse, DrfError<TRequest>, TRequest, TContext>({
    config: { url, ...config },
    onSuccess: hookOnSuccess,
    ...rest,
  });
}
