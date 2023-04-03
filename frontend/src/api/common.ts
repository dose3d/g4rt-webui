import axios, { AxiosError, AxiosInstance, Method } from 'axios';
import { SubmitHandler, useForm, UseFormProps } from "react-hook-form";
import { FieldPath, FieldValues } from "react-hook-form/dist/types";
import { useCallback, useState } from 'react';
import useAxios from '../utils/useAxios';
import { UseFormSetError } from 'react-hook-form/dist/types/form';

interface DrfError<TFieldValues extends FieldValues = FieldValues> {
  detail: string;
}

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

function defaultParseErrors<Response, TFieldValues extends FieldValues = FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  values: TFieldValues,
) {
  if (axios.isAxiosError(error)) {
    const aerr = error as AxiosError<DrfError>;
    if (aerr.response) {
      const resp = aerr.response.data as unknown as {[key: string]: string[]};
      const fields = Object.keys(resp);
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i] as FieldPath<TFieldValues>;
        setError(field, { type: 'custom', message: resp[field].join('\n') });
      }
    }
  }
  return formatErrorToString(error);
}

function defaultPutPost<TFieldValues extends FieldValues = FieldValues>(values: TFieldValues): Method {
  // TODO: check if ID field in values is filled, when yes use POST otherwise use PUT
  return 'POST';
}

function defaultFormatEndpoint<TFieldValues extends FieldValues = FieldValues>(
  endpoint: string,
  method: Method,
  values: TFieldValues,
) {
  if (method === 'POST') {
    return endpoint;
  } else {
    // TODO: append ID
    return endpoint;
  }
}

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
    formProps
  } = params;

  const form = useForm(formProps);
  const { setError } = form;
  const axiosInstance = useAxios();
  const [status, setStatus] = useState<'' | 'pending' | 'success' | 'error'>('');
  const [message, setMessage] = useState('');

  const onSubmit: SubmitHandler<TFieldValues> = useCallback(
    async (data) => {
      const data2 = preSubmit(data);
      const m = typeof method === 'function' ? method(data2) : method;
      const url = formatEndpoint(endpoint, m, data2);
      try {
        setStatus('pending');
        const response = await submit(axiosInstance, m, url, data2);
        setStatus('success');
        setMessage('');
        if (postSubmit) {
          postSubmit(response, data2);
        }
      } catch (e) {
        setStatus('error');
        setMessage(parseErrors(e, setError, data2));
      }
    },
    [axiosInstance, endpoint, formatEndpoint, method, parseErrors, postSubmit, preSubmit, setError, submit],
  );

  return { ...form, onSubmit, message, status };
}
