import { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSimpleJwtAxios } from './useSimpleJwtAxios';
import { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface UseQueryWrapper<Response = unknown, Error = unknown>
  extends Omit<UseQueryOptions<Response, AxiosError<Error>>, 'queryFn'> {
  axiosInstance?: AxiosInstance;
  config?: Omit<AxiosRequestConfig, 'url' | 'method'>;
  endpoint: string;
}

/**
 * Wrapper for TanStack Query.
 * @param params
 */
export function useQueryWrapper<Response = unknown, Error = unknown>(params: UseQueryWrapper<Response, Error>) {
  const jwtAxios = useSimpleJwtAxios();

  const { axiosInstance = jwtAxios, endpoint, config, ...rest } = params;

  const [lastError, setLastError] = useState<AxiosError<Error> | null>(null);

  const query = useQuery({
    queryFn: () => axiosInstance.get<Response>(endpoint, config).then((res) => res.data),
    ...rest,
  });

  const { status, error } = query;

  useEffect(() => {
    if (status == 'success') {
      setLastError(null);
    } else if (status == 'error') {
      setLastError(error);
    }
  }, [status, error]);

  return { ...query, lastError };
}
