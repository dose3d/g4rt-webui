import { ChangeOptions, MutationOptions } from './types';
import { FieldValues } from 'react-hook-form';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { DrfError } from './errors';
import { useCallback, useState } from 'react';

export type UseDrfChange<
  TFieldValues extends FieldValues = FieldValues,
  Request extends FieldValues = TFieldValues,
  TContext = unknown,
> = MutationOptions<TFieldValues, Request, TContext> &
  ChangeOptions &
  Omit<
    UseMutationOptions<TFieldValues, AxiosError<DrfError<TFieldValues>>, Request, TContext>,
    'mutationFn' | 'onSuccess' | 'onError'
  >;

export type UseDrfChangeReturn<
  TFieldValues extends FieldValues = FieldValues,
  Request extends FieldValues = TFieldValues,
  TContext = unknown,
> = UseMutationResult<TFieldValues, AxiosError<DrfError<TFieldValues>, Request>, Request, TContext> & {
  lastError: AxiosError<DrfError<TFieldValues>, Request> | null;
};

export function useDrfChange<
  TFieldValues extends FieldValues = FieldValues,
  Request extends FieldValues = TFieldValues,
  TContext = unknown,
>(params: UseDrfChange<TFieldValues, Request, TContext>): UseDrfChangeReturn<TFieldValues, Request, TContext> {
  const { axiosInstance = axios, endpoint, config = {}, method, onError, onSuccess, ...rest } = params;

  const [lastError, setLastError] = useState<AxiosError<DrfError<TFieldValues>, Request> | null>(null);

  const hookOnSuccess = useCallback(
    (data: TFieldValues, values: Request, context?: TContext) => {
      setLastError(null);
      if (onSuccess) {
        onSuccess(data, values, context);
      }
    },
    [onSuccess],
  );

  const hookOnError = useCallback(
    (err: AxiosError<DrfError<TFieldValues>>, values: Request, context?: TContext) => {
      setLastError(err);
      if (onError) {
        onError(err, values, context);
      }
    },
    [onError],
  );

  const mutation = useMutation<TFieldValues, AxiosError<DrfError<TFieldValues>, Request>, Request, TContext>({
    mutationFn: async (data: Request): Promise<TFieldValues> => {
      const conf = {
        url: endpoint,
        method,
        data,
        ...config,
      };

      const ret = await axiosInstance.request<TFieldValues, AxiosResponse<TFieldValues>, Request>(conf);
      return ret.data;
    },
    onSuccess: hookOnSuccess,
    onError: hookOnError,
    ...rest,
  });

  return { ...mutation, lastError };
}
