import { QueryOptions } from './types';
import { FieldValues } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { DrfError } from './errors';
import { useCallback, useState } from 'react';

export interface UseDrfQuery<Response extends FieldValues = FieldValues>
  extends QueryOptions<Response>,
    Omit<UseQueryOptions<Response, AxiosError<DrfError<Response>>>, 'queryFn' | 'onSuccess' | 'onError'> {}

export function useDrfQuery<Response extends FieldValues = FieldValues>(params: UseDrfQuery<Response>) {
  const { axiosInstance = axios, endpoint, config, onError, onSuccess, ...rest } = params;

  const [lastError, setLastError] = useState<AxiosError<DrfError<Response>> | null>(null);

  const hookOnSuccess = useCallback(
    (data: Response) => {
      setLastError(null);
      if (onSuccess) {
        onSuccess(data);
      }
    },
    [onSuccess],
  );

  const hookOnError = useCallback(
    (err: AxiosError<DrfError<Response>>) => {
      setLastError(err);
      if (onError) {
        onError(err);
      }
    },
    [onError],
  );

  const query = useQuery({
    queryFn: () => axiosInstance.get<Response>(endpoint, config).then((res) => res.data),
    onSuccess: hookOnSuccess,
    onError: hookOnError,
    ...rest,
  });

  return { ...query, lastError };
}
