import axios, { AxiosError, AxiosInstance, Method } from 'axios';
import { SubmitHandler, useForm, UseFormProps } from 'react-hook-form';
import { FieldPath, FieldValues } from 'react-hook-form/dist/types';
import { useCallback, useState } from 'react';
import useAxios from '../utils/useAxios';
import { UseFormSetError } from 'react-hook-form/dist/types/form';
import { useMutation } from '@tanstack/react-query';
import { MutationKey } from '@tanstack/query-core/build/lib/types';

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

export interface UseBackendParams<Response, TFieldValues extends FieldValues = FieldValues> {
  endpoint: string;
  method?: Method | ((values: TFieldValues) => Method);
  formatEndpoint?: (endpoint: string, method: Method, values: TFieldValues) => string;
  preSubmit?: (values: TFieldValues) => TFieldValues;
  submit?: (axiosInstance: AxiosInstance, method: Method, endpoint: string, values: TFieldValues) => Promise<Response>;
  postSubmit?: (response: Response, values: TFieldValues) => void;
  parseErrors?: (error: unknown, setError: UseFormSetError<TFieldValues>, values: TFieldValues) => string;
  formProps?: UseFormProps<TFieldValues>;
  mutationKey?: MutationKey;
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

function defaultPutPost<TFieldValues extends FieldValues = FieldValues>(values: TFieldValues): Method {
  return values.id ? 'PUT' : 'POST';
}

function defaultFormatEndpoint<TFieldValues extends FieldValues = FieldValues>(
  endpoint: string,
  method: Method,
  values: TFieldValues,
) {
  if (method === 'POST') {
    return endpoint;
  } else {
    return `${endpoint}/${values.id}`;
  }
}

/**
 * Integrate React Form Hooks, Axios, TanSack Query and Django Rest Framework.
 */
export function useBackend<Response, TFieldValues extends FieldValues = FieldValues>(
  params: UseBackendParams<Response, TFieldValues>,
) {
  const {
    endpoint,
    method = defaultPutPost,
    formatEndpoint = defaultFormatEndpoint,
    preSubmit = defaultPreSubmit,
    submit = defaultSubmit,
    postSubmit,
    parseErrors = defaultParseErrors,
    formProps,
    mutationKey,
  } = params;

  const form = useForm(formProps);
  const { setError } = form;
  const axiosInstance = useAxios();
  const [errorMessage, setErrorMessage] = useState('');

  // Send request to backend
  const onSend = useCallback(
    async (data: TFieldValues) => {
      const data2 = preSubmit(data);
      const m = typeof method === 'function' ? method(data2) : method;
      const url = formatEndpoint(endpoint, m, data2);
      return await submit(axiosInstance, m, url, data2);
    },
    [axiosInstance, endpoint, formatEndpoint, method, preSubmit, submit],
  );

  // Handle error response from backend
  const onError = useCallback(
    (error: unknown, data: TFieldValues) => {
      const message = parseErrors(error, setError, data);
      setErrorMessage(message);
    },
    [parseErrors, setError],
  );

  const mutation = useMutation<Response, string, TFieldValues>({
    mutationFn: onSend,
    onSuccess: postSubmit,
    onError: onError,
    mutationKey,
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
