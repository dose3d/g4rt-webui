import { AxiosError, AxiosInstance, Method } from 'axios';
import { UseFormProps } from 'react-hook-form';
import { FieldValues } from 'react-hook-form/dist/types';
import { useCallback } from 'react';
import { UseFormSetError } from 'react-hook-form/dist/types/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TFunction } from 'i18next';
import { DrfError, useSimpleJwtAxios } from '../drf-crud-client';

export interface UseBackendParamsBase<Response, TFieldValues extends FieldValues = FieldValues> {
  method?: Method | ((pk: number | string, values: TFieldValues) => Method);
  requestPrimaryKey?: number | string | ((values: TFieldValues) => number | string);
  responsePrimaryKey?: (values: Response) => number | string;
  formatEndpoint?: (endpoint: string, method: Method, pk: number | string, values: TFieldValues) => string;
  preSubmit?: (values: TFieldValues) => TFieldValues;
  submit?: (axiosInstance: AxiosInstance, method: Method, endpoint: string, values: TFieldValues) => Promise<Response>;
  postSubmit?: (response: Response, values: TFieldValues) => void;
  parseErrors?: (error: unknown, setError: UseFormSetError<TFieldValues>, t: TFunction, values: TFieldValues) => string;
  formProps?: UseFormProps<TFieldValues>;
}

export interface UseBackendParams<Response, TFieldValues extends FieldValues = FieldValues>
  extends UseBackendParamsBase<Response, TFieldValues> {
  endpoint: string;
  queryKey?: string;
}

export interface PaginatedResponse<E> {
  count: number;
  next: string;
  pages_count: number;
  previous: string;
  results: E[];
}

function defaultPreSubmit<TFieldValues extends FieldValues = FieldValues>(values: TFieldValues) {
  return values;
}

async function defaultSubmit<Response, TFieldValues extends FieldValues = FieldValues>(
  axiosInstance: AxiosInstance,
  method: Method,
  endpoint: string,
  values: TFieldValues,
) {
  const response = await axiosInstance.request<Response>({ url: endpoint, method, data: values });
  return response.data;
}

export interface UseActionParamsBase<Response, TFieldValues extends FieldValues = FieldValues> {
  primaryKey?: number | string;
  formatEndpoint?: (endpoint: string, pk?: number | string, action?: string) => string;
  preSubmit?: (values: TFieldValues) => TFieldValues;
  submit?: (axiosInstance: AxiosInstance, method: Method, endpoint: string, values: TFieldValues) => Promise<Response>;
  postSubmit?: (response: Response, values: TFieldValues) => void;
  onError?: (error: AxiosError<DrfError<TFieldValues>>, values: TFieldValues) => void;
}

export interface UseActionParams<Response, TFieldValues extends FieldValues = FieldValues>
  extends UseActionParamsBase<Response, TFieldValues> {
  endpoint: string;
  queryKey?: string;
  method?: Method;
  action?: string;
}

function defaultFormatActionEndpoint(endpoint: string, pk?: number | string, action?: string) {
  let ret = `${endpoint}`;
  if (pk) {
    ret = `${ret}${pk}/`;
  }
  if (action) {
    ret = `${ret}${action}/`;
  }
  return ret;
}

export function useAction<Response, TFieldValues extends FieldValues = FieldValues>(
  params: UseActionParams<Response, TFieldValues>,
) {
  const {
    primaryKey,
    formatEndpoint = defaultFormatActionEndpoint,
    preSubmit = defaultPreSubmit,
    submit = defaultSubmit,
    postSubmit,
    onError,
    endpoint,
    queryKey,
    method = 'GET',
    action,
  } = params;

  const axiosInstance = useSimpleJwtAxios();
  const queryClient = useQueryClient();

  const onSend = useCallback(
    async (data: TFieldValues) => {
      const url = formatEndpoint(endpoint, primaryKey, action);
      const data2 = preSubmit(data);
      return await submit(axiosInstance, method, url, data2);
    },
    [action, axiosInstance, endpoint, formatEndpoint, method, preSubmit, primaryKey, submit],
  );

  const onSuccess = useCallback(
    (response: Response, values: TFieldValues) => {
      if (queryKey) {
        if (method == 'DELETE') {
          queryClient.invalidateQueries({ queryKey: [queryKey, primaryKey] }).then();
        } else {
          queryClient.setQueryData([queryKey, primaryKey], response);
        }
      }
      if (postSubmit) {
        postSubmit(response, values);
      }
    },
    [method, postSubmit, primaryKey, queryClient, queryKey],
  );

  return useMutation<Response, AxiosError<DrfError<TFieldValues>>, TFieldValues>({
    mutationFn: onSend,
    onSuccess,
    onError: onError,
    mutationKey: [queryKey, primaryKey],
  });
}

export interface UseDeleteParams<Response, TFieldValues extends FieldValues = FieldValues>
  extends UseActionParamsBase<Response, TFieldValues> {
  endpoint: string;
  queryKey?: string;
}

export function useDelete<Response, TFieldValues extends FieldValues = FieldValues>(
  params: UseDeleteParams<Response, TFieldValues>,
) {
  return useAction<Response, TFieldValues>({ method: 'DELETE', ...params });
}
