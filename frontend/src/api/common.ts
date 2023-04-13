import axios, { AxiosError, AxiosInstance, Method } from 'axios';
import { SubmitHandler, useForm, UseFormProps } from 'react-hook-form';
import { FieldValues } from 'react-hook-form/dist/types';
import { useCallback, useMemo, useState } from 'react';
import useAxios from '../utils/useAxios';
import { UseFormSetError } from 'react-hook-form/dist/types/form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DrfError, loadErrorsToRFH } from '../drf-client';

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
    parseErrors = loadErrorsToRFH,
    formProps,
    queryKey,
  } = params;

  const form = useForm(formProps);
  const { setError } = form;
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useTranslation('drf');

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
      const message = parseErrors(error, setError, t, data);
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

export interface PaginationController {
  current: number;
  count?: number;
  goFirst: () => void;
  goPrev: () => void;
  goNext: () => void;
  goLatest: () => void;
  setPage: (v: number) => void;
}

export interface UseSelect {
  queryKey: string;
  endpoint: string;
  refetchInterval?: number;
  pageSize?: number;
}

export function useSelect<TFieldValues extends FieldValues = FieldValues>({
  queryKey,
  endpoint,
  refetchInterval = 60000,
  pageSize = 10,
}: UseSelect) {
  const axiosInstance = useAxios();
  const [current, setCurrent] = useState(1);
  const [latestError, setLatestError] = useState<AxiosError<DrfError<TFieldValues>> | null>(null);

  const query = useQuery<PaginatedResponse<TFieldValues>, AxiosError<DrfError<TFieldValues>>>({
    queryKey: queryKey ? [queryKey, 'list', pageSize, current] : undefined,
    refetchInterval,
    queryFn: () =>
      axiosInstance
        .get<PaginatedResponse<TFieldValues>>(endpoint, { params: { page_size: pageSize, page: current } })
        .then((res) => res.data),
    onSuccess: () => setLatestError(null),
    onError: (err) => setLatestError(err),
  });

  const pages_count = query.data?.pages_count;

  const goFirst = useCallback(() => {
    setCurrent(1);
  }, []);

  const goPrev = useCallback(() => {
    setCurrent((v) => Math.max(1, v - 1));
  }, []);

  const goNext = useCallback(() => {
    setCurrent((v) => Math.min(pages_count || 1, v + 1));
  }, [pages_count]);

  const goLatest = useCallback(() => {
    setCurrent(pages_count || 1);
  }, [pages_count]);

  const setPage = useCallback(
    (page: number) => {
      setCurrent(Math.max(1, Math.min(pages_count || 1, page)));
    },
    [pages_count],
  );

  const controller = useMemo<PaginationController>(
    () => ({
      current,
      goFirst,
      goPrev,
      goNext,
      goLatest,
      setPage,
      count: pages_count,
    }),
    [current, goFirst, goLatest, goNext, goPrev, pages_count, setPage],
  );

  return { ...query, controller, latestError };
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

  const axiosInstance = useAxios();
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
