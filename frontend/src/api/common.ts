import axios, { AxiosError, AxiosInstance, Method } from 'axios';
import { SubmitHandler, useForm, UseFormProps } from 'react-hook-form';
import { FieldPath, FieldValues } from 'react-hook-form/dist/types';
import { useCallback, useState } from 'react';
import useAxios from '../utils/useAxios';
import { UseFormSetError } from 'react-hook-form/dist/types/form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { JobEntityList } from './jobs';

type DrfError<TFieldValues extends FieldValues = FieldValues> = {
  [V in FieldPath<TFieldValues>]?: string[];
} & { detail?: string };

export function formatErrorToString(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<DrfError>;
    if (axiosErr.response) {
      if (axiosErr.response.headers['content-type'] == 'application/json') {
        return `Server returns error: ${axiosErr.response.data.detail}`;
      } else {
        return `Server returns undefined error, please look to backend logs`;
      }
    } else {
      return `Connection error`;
    }
  } else if (err instanceof Error) {
    return `Another browser error: ${err}`;
  } else {
    return `Another error: ${err}`;
  }
}

export interface UseBackendParamsBase<Response, TFieldValues extends FieldValues = FieldValues> {
  method?: Method | ((pk: number | string, values: TFieldValues) => Method);
  requestPrimaryKey?: number | string | ((values: TFieldValues) => number | string);
  responsePrimaryKey?: (values: Response) => number | string;
  formatEndpoint?: (endpoint: string, method: Method, pk: number | string, values: TFieldValues) => string;
  preSubmit?: (values: TFieldValues) => TFieldValues;
  submit?: (axiosInstance: AxiosInstance, method: Method, endpoint: string, values: TFieldValues) => Promise<Response>;
  postSubmit?: (response: Response, values: TFieldValues) => void;
  parseErrors?: (error: unknown, setError: UseFormSetError<TFieldValues>, values: TFieldValues) => string;
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

function defaultParseErrors<TFieldValues extends FieldValues = FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<DrfError<TFieldValues>>;
    if (axiosError.response) {
      const resp = axiosError.response.data;
      const fields = Object.keys(resp) as FieldPath<TFieldValues>[];
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const value = resp[field];
        const message = Array.isArray(value) ? value.join('\n') : `${value}`;
        setError(field, { type: 'custom', message });
      }
    }
  }
  return formatErrorToString(error);
}

function defaultPrimaryKey<T>(values: T): number | string {
  return (values as unknown as { id: number | string }).id;
}

function defaultPutPost(pk: number | string): Method {
  return pk ? 'PUT' : 'POST';
}

function defaultFormatEndpoint(endpoint: string, method: Method, pk: number | string) {
  if (method === 'POST') {
    return endpoint;
  } else {
    if (!pk) {
      throw Error('Primary Key required');
    }
    return `${endpoint}/${pk}`;
  }
}

/**
 * Integrate React Form Hooks, Axios, TanSack Query and Django Rest Framework.
 */
export function useCreateUpdate<Response, TFieldValues extends FieldValues = FieldValues>(
  params: UseBackendParams<Response, TFieldValues>,
) {
  const {
    endpoint,
    method = defaultPutPost,
    requestPrimaryKey = defaultPrimaryKey,
    responsePrimaryKey = defaultPrimaryKey,
    formatEndpoint = defaultFormatEndpoint,
    preSubmit = defaultPreSubmit,
    submit = defaultSubmit,
    postSubmit,
    parseErrors = defaultParseErrors,
    formProps,
    queryKey,
  } = params;

  const form = useForm(formProps);
  const { setError } = form;
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState('');

  // Send request to backend
  const onSend = useCallback(
    async (data: TFieldValues) => {
      const data2 = preSubmit(data);
      const pk = typeof requestPrimaryKey === 'function' ? requestPrimaryKey(data2) : requestPrimaryKey;
      const m = typeof method === 'function' ? method(pk, data2) : method;
      const url = formatEndpoint(endpoint, m, pk, data2);
      return await submit(axiosInstance, m, url, data2);
    },
    [axiosInstance, endpoint, formatEndpoint, method, preSubmit, requestPrimaryKey, submit],
  );

  // Handle error response from backend
  const onError = useCallback(
    (error: unknown, data: TFieldValues) => {
      const message = parseErrors(error, setError, data);
      setErrorMessage(message);
    },
    [parseErrors, setError],
  );

  const onSuccess = useCallback(
    (response: Response, values: TFieldValues) => {
      if (queryKey) {
        //queryClient.invalidateQueries({ queryKey: [queryKey, responsePrimaryKey(response)] }).then();
        queryClient.setQueryData([queryKey, responsePrimaryKey(response)], response);
      }
      if (postSubmit) {
        postSubmit(response, values);
      }
    },
    [postSubmit, queryClient, queryKey, responsePrimaryKey],
  );

  const mutation = useMutation<Response, string, TFieldValues>({
    mutationFn: onSend,
    onSuccess,
    onError: onError,
  });

  // React Form Hook with TanSack Query integration
  const onSubmit: SubmitHandler<TFieldValues> = useCallback(
    async (data) => {
      try {
        await mutation.mutateAsync(data);
      } catch (e) {
        if (!axios.isAxiosError(e)) {
          throw e;
        }
      }
    },
    [mutation],
  );

  // Shortcut for handleSubmit(onSubmit)
  const simpleHandleSubmit = form.handleSubmit(onSubmit);

  return { ...form, onSubmit, ...mutation, errorMessage, simpleHandleSubmit };
}

export interface UseSelect {
  queryKey: string;
  endpoint: string;
  refetchInterval?: number;
}

export function useSelect<TFieldValues extends FieldValues = FieldValues>({
  queryKey,
  endpoint,
  refetchInterval = 60000,
}: UseSelect) {
  const axiosInstance = useAxios();

  return useQuery({
    queryKey: queryKey ? [queryKey, 'list'] : undefined,
    refetchInterval,
    queryFn: () => axiosInstance.get<PaginatedResponse<TFieldValues>>(endpoint).then((res) => res.data),
  });
}

export interface UseEntity {
  queryKey: string;
  endpoint: string;
  primaryKey: string | number;
  refetchInterval?: number;
}

export function useEntity<TFieldValues extends FieldValues = FieldValues>({
  queryKey,
  endpoint,
  primaryKey,
  refetchInterval = 60000,
}: UseEntity) {
  const axiosInstance = useAxios();

  return useQuery({
    queryKey: queryKey ? [queryKey, primaryKey] : undefined,
    refetchInterval,
    queryFn: () => axiosInstance.get<TFieldValues>(`${endpoint}${primaryKey}/`).then((res) => res.data),
  });
}

export function useDelete() {
  //queryClient.invalidateQueries({ queryKey: [queryKey, responsePrimaryKey(response)] }).then();
}
