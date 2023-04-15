import { QueryOptions } from './types';
import { FieldValues } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { DrfError } from './errors';
import { useCallback, useState } from 'react';

export interface UseDrfQuery<TFieldValues extends FieldValues = FieldValues>
  extends QueryOptions<TFieldValues>,
    Omit<UseQueryOptions<TFieldValues, AxiosError<DrfError<TFieldValues>>>, 'queryFn' | 'onSuccess' | 'onError'> {}

export function useDrfQuery<TFieldValues extends FieldValues = FieldValues>(params: UseDrfQuery<TFieldValues>) {
  const { axiosInstance = axios, endpoint, config, onError, onSuccess, ...rest } = params;

  const [lastError, setLastError] = useState<AxiosError<DrfError<TFieldValues>> | null>(null);

  const hookOnSuccess = useCallback(
    (data: TFieldValues) => {
      setLastError(null);
      if (onSuccess) {
        onSuccess(data);
      }
    },
    [onSuccess],
  );

  const hookOnError = useCallback(
    (err: AxiosError<DrfError<TFieldValues>>) => {
      setLastError(err);
      if (onError) {
        onError(err);
      }
    },
    [onError],
  );

  const query = useQuery<TFieldValues, AxiosError<DrfError<TFieldValues>>>({
    queryFn: () => axiosInstance.get<TFieldValues>(endpoint, config).then((res) => res.data),
    onSuccess: hookOnSuccess,
    onError: hookOnError,
    ...rest,
  });

  return { ...query, lastError };
}
