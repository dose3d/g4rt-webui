import { AxiosError, AxiosRequestConfig } from 'axios';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useSimpleJwtAxios } from './useSimpleJwtAxios';
import { QueryKey } from '@tanstack/query-core';
import { AxiosOptions } from './types';

/**
 * Options for useQueryWrapper.
 *
 * All values without axiosInstance, config, endpoint and queryFn are passed to useQuery directly.
 * All templates without WrappedError are passed to UseQueryOptions directly.
 *
 * @template TQueryFnData passed directly
 * @template WrappedError passed to TError with wrapping by AxiosError<WrappedError>
 * @template TData passed directly
 * @template TQueryKey passed directly
 */
export interface UseQueryWrapper<
  TQueryFnData = unknown,
  WrappedError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<UseQueryOptions<TQueryFnData, AxiosError<WrappedError, TData>, TData, TQueryKey>, 'queryFn'>,
    AxiosOptions {
  /**
   * Values passed directly to axios.get(endpoint, config)
   */
  config?: Omit<AxiosRequestConfig, 'url' | 'method'>;

  /**
   * Value passed directly to axios.get(endpoint, config)
   */
  endpoint: string;
}

/**
 * Values returned from useQueryWrapper.
 *
 * All values are passed directly from useQuery.
 *
 * @template TData passed directly to UseQueryResult
 * @template WrappedError passed to TError with wrapping by AxiosError<WrappedError>
 */
export type UseQueryWrapperResult<TData = unknown, WrappedError = unknown> = UseQueryResult<
  TData,
  AxiosError<WrappedError, TData>
>;

/**
 * Wrapper for useQuery from TanStack Query.
 *
 * Dedicated for fetch universal GET requests.
 *
 * Implements queryFn for making fetches by axios.get(endpoint, config).
 *
 * Auth headers is provided by interceptors configured in axiosInstance.
 * If axiosInstance is not provided in params then will be got from JwtAuthContext.
 * If component is not wrapped by JwtAuthContext context provider, the default axios will be used.
 *
 * All params without queryFn are passed directly to useQuery and axios.get(endpoint, config).
 * Return of useQuery are passed directly.
 *
 * Example: GET /api/v1/hello
 *
 * const { data } = useQueryWrapper({endpoint: '/api/v1/hello'});
 *
 * @param params @see UseQueryWrapper
 * @return @see UseQueryWrapperResult
 */
export function useQueryWrapper<
  TQueryFnData = unknown,
  WrappedError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(params: UseQueryWrapper<TQueryFnData, WrappedError, TData, TQueryKey>): UseQueryWrapperResult<TData, WrappedError> {
  // get axiosInstance from JwtAuthContext context provider
  const jwtAxios = useSimpleJwtAxios();

  // use axiosInstance from JwtAuthContext when not provided in params
  const { axiosInstance = jwtAxios, endpoint, config, ...rest } = params;

  // useQuery execution
  return useQuery({
    queryFn: () => axiosInstance.get<TQueryFnData>(endpoint, config).then((res) => res.data),
    ...rest,
  });
}
