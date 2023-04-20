import { ChangeOptions, MutationOptions } from './types';
import { FieldValues } from 'react-hook-form';
import { AxiosError, AxiosResponse } from 'axios';
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { DrfError } from './errors';
import { useCallback, useState } from 'react';
import { useSimpleJwtAxios } from './useSimpleJwtAxios';

export type UseDrfMutation<
  Request extends FieldValues = FieldValues,
  Response extends FieldValues = Request,
  TContext = unknown,
> = MutationOptions<Request, Response, TContext> &
  ChangeOptions &
  Omit<
    UseMutationOptions<Response, AxiosError<DrfError<Request>, Request>, Request, TContext>,
    'mutationFn' | 'onSuccess' | 'onError'
  >;

export type UseDrfMutationReturn<
  Request extends FieldValues = FieldValues,
  Response extends FieldValues = Request,
  TContext = unknown,
> = UseMutationResult<Response, AxiosError<DrfError<Request>, Request>, Request, TContext> & {
  lastError: AxiosError<DrfError<Request>, Request> | null;
};

export function useDrfMutation<
  Request extends FieldValues = FieldValues,
  Response extends FieldValues = Request,
  TContext = unknown,
>(params: UseDrfMutation<Request, Response, TContext>): UseDrfMutationReturn<Request, Response, TContext> {
  const jwtAxios = useSimpleJwtAxios();

  const { axiosInstance = jwtAxios, endpoint, config = {}, method, onError, onSuccess, ...rest } = params;

  const [lastError, setLastError] = useState<AxiosError<DrfError<Request>, Request> | null>(null);

  const hookOnSuccess = useCallback(
    (data: Response, values: Request, context?: TContext) => {
      setLastError(null);
      if (onSuccess) {
        onSuccess(data, values, context);
      }
    },
    [onSuccess],
  );

  const hookOnError = useCallback(
    (err: AxiosError<DrfError<Request>, Request>, values: Request, context?: TContext) => {
      setLastError(err);
      if (onError) {
        onError(err, values, context);
      }
    },
    [onError],
  );

  const mutation = useMutation({
    mutationFn: async (data: Request): Promise<Response> => {
      const conf = {
        url: endpoint,
        method,
        data,
        ...config,
      };

      const ret = await axiosInstance.request<Response, AxiosResponse<Response>, Request>(conf);
      return ret.data;
    },
    onSuccess: hookOnSuccess,
    onError: hookOnError,
    ...rest,
  });

  return { ...mutation, lastError };
}
