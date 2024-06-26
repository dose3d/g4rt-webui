import { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { AxiosOptions } from './types';
import { merge } from 'lodash';
import { useAuthContext } from './useAuthContext';

/**
 * Options for useMutationWrapper.
 *
 * All values without axiosInstance, config, endpoint, method and mutationFn are passed to useMutation directly.
 * All templates without WrappedError are passed to UseMutationOptions directly.
 *
 * @template TData passed directly, it is response data
 * @template WrappedError passed to TError with wrapping by AxiosError<WrappedError>
 * @template TVariables passed directly, it is request data
 * @template TContext passed directly
 */
export interface UseMutationWrapper<TData = unknown, WrappedError = unknown, TVariables = void, TContext = unknown>
  extends Omit<UseMutationOptions<TData, AxiosError<WrappedError, TVariables>, TVariables, TContext>, 'mutationFn'>,
    AxiosOptions {
  /**
   * Values passed directly to axios.request(config).
   *
   * Config.data will be merged with values passed with mutate or mutateAsync
   * so config.data can be used for provide default values.
   *
   * The Partial<TVariables> is used because config.data is optional.
   */
  config: AxiosRequestConfig<Partial<TVariables>>;
}

/**
 * Values returned from useMutationWrapper.
 *
 * All values are passed directly from useMutation.
 *
 * @template TData passed directly, it is response data
 * @template WrappedError passed to TError with wrapping by AxiosError<WrappedError>
 * @template TVariables passed directly, it is request data
 * @template TContext passed directly
 */
export type UseMutationWrapperResult<
  TData = unknown,
  WrappedError = unknown,
  TVariables = unknown,
  TContext = unknown,
> = UseMutationResult<TData, AxiosError<WrappedError, TVariables>, TVariables, TContext>;

/**
 * Wrapper for useMutation from TanStack Query.
 *
 * Dedicated for fetch universal HTTP requests (i.e. POST, PUT, DELETE etc.).
 *
 * Implements mutationFn for making fetches by axios.request(endpoint, config)
 * but default HTTP method is POST instead GET.
 *
 * Auth headers is provided by interceptors configured in axiosInstance.
 * If axiosInstance is not provided in params then will be got from JwtAuthContext.
 * If component is not wrapped by JwtAuthContext context provider, the default axios will be used.
 *
 * All params without mutationFn are passed directly to useQuery and axios.request(endpoint, config).
 * Return of useQuery are passed directly.
 *
 * Example: PUT /api/v1/hello
 * const requestData = {...};
 * const { data, mutate, mutateAsync } = useMutationWrapper({config: {url: '/api/v1/hello', method: 'PUT'}});
 * mutate(requestData);
 * // or
 * mutateAsync(requestData).then();
 *
 * @param params @see UseMutationWrapper
 * @return @see UseMutationWrapperResult
 */
export function useMutationWrapper<TData = unknown, WrappedError = unknown, TVariables = void, TContext = unknown>(
  params: UseMutationWrapper<TData, WrappedError, TVariables, TContext>,
): UseMutationWrapperResult<TData, WrappedError, TVariables, TContext> {
  // use axiosInstance from JwtAuthContext when not provided in params
  const { axiosInstance, config: { data: confData = {}, method = 'POST', ...confRest } = {}, ...rest } = params;

  // get axiosInstance from AuthContext if not provided
  const authContext = useAuthContext();
  const ai = axiosInstance || authContext.buildAxiosInstance();

  // useMutation execution
  return useMutation({
    mutationFn: async (data: TVariables): Promise<TData> => {
      const conf = {
        data: merge(confData, data),
        method,
        ...confRest,
      };

      const ret = await ai.request<TData, AxiosResponse<TData>, TVariables>(conf);
      return ret.data;
    },
    ...rest,
  });
}
