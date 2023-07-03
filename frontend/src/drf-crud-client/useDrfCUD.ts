import { FieldValues } from 'react-hook-form';
import { ActionOptions, ApiOptions, EntityOptions, ResourceOptions } from './types';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { buildEndpoint, buildQueryKey } from './utils';
import { useMutationWrapper, UseMutationWrapper, UseMutationWrapperResult } from './useMutationWrapper';
import { DrfError } from './errors';
import { AxiosRequestConfig } from 'axios';

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
> = Omit<UseMutationWrapper<TResponse, DrfError<TRequest>, TRequest, TContext>, 'config'> &
  ApiOptions &
  ResourceOptions &
  Partial<EntityOptions<PK>> &
  ActionOptions & {
    /**
     * Cache update behaviour.
     *
     * Cause follow action on [resourceQK, 'entity', pk] where pk is
     * from primaryKeyQK or from data.id from response after success:
     * - none - no invalidateQueries nor setQueryData
     * - set - setQueryData on [resourceQK, 'entity', pk]
     * - invalidate - invalidateQueries on [resourceQK, 'entity', pk]
     * - default - like set when backend returns data,
     *     otherwise invalidateQueries on [resourceQK, 'entity', primaryKeyQK] if
     *     primaryKeyQK is provided.
     */
    cacheBehaviour?: 'default' | 'set' | 'invalidate' | 'none';

    /**
     * Use [resourceQK, 'entity', pk, action] instead [resourceQK, 'entity', pk]
     * as cache key. Default: false.
     */
    cacheAction?: boolean;

    /**
     * Invalidate [resourceQK, 'list']. Default: true.
     */
    cacheInvalidateList?: boolean;

    /**
     * Optional config for axios. The url is filled by buildEndpoint.
     */
    config?: AxiosRequestConfig<Partial<TRequest>>;
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
 * By default, cache on ['users', 'list'] will be invalidated and
 * cache on ['users', 'entity', data.id] will be stored by data from response.
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
 * By default, cache on ['users', 'list'] will be invalidated and
 * cache on ['users', 'entity', primaryKey] will be stored by data from response.
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
 * By default, cache on ['users', 'list'] and ['users', 'entity', primaryKey]
 * will be invalidated.
 *
 * Example of action: POST /api/v1/users/7/send_mail/
 *
 * const { mutate: sendMail } = useDrfCUD({
 *   api: '/api/v1/',
 *   resource: 'users',
 *   primaryKey: 7,
 *   config: { method: 'POST' },
 *   action: 'send_mail',
 *   cacheInvalidateList: false,
 *   cacheAction: true,
 * });
 * sendMail({...});
 *
 * Cache on ['users', 'list'] will not be invalidated and
 * cache on ['users', 'entity', primaryKey, 'send_mail'] will be stored by
 * data from response.
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
    action,
    actionQK = action,
    onSuccess,
    cacheBehaviour = 'default',
    cacheAction = false,
    cacheInvalidateList = true,
    config,
    ...rest
  } = params;

  const url = buildEndpoint(api, resource, primaryKey, action);
  const queryClient = useQueryClient();

  const hookOnSuccess = useCallback(
    (data: TResponse, values: TRequest, context?: TContext) => {
      const queryKey = buildQueryKey(resourceQK, primaryKeyQK || data.id);
      if (cacheAction && actionQK) {
        queryKey.push(actionQK);
      }

      if (cacheInvalidateList) {
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
    [
      actionQK,
      cacheAction,
      cacheBehaviour,
      cacheInvalidateList,
      onSuccess,
      primaryKey,
      primaryKeyQK,
      queryClient,
      resourceQK,
    ],
  );

  return useMutationWrapper<TResponse, DrfError<TRequest>, TRequest, TContext>({
    config: { url, ...config },
    onSuccess: hookOnSuccess,
    ...rest,
  });
}
