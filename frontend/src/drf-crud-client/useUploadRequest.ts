import { useAuthContext } from './useAuthContext';
import { AxiosOptions } from './types';
import { AxiosError, AxiosRequestConfig, AxiosResponse, isAxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { DrfError, useFormatErrorToString } from './errors';

export interface GenericUploadedFileResponse {
  id: number;
  file: string;
}

export interface GenericUploadedFileError {
  file: string;
}

export type UploadFileSuccessCallback<R = GenericUploadedFileResponse> = (
  response: AxiosResponse<R>,
) => void;
export type UploadFileErrorCallback<E = GenericUploadedFileError> = (
  msg: string,
  error: AxiosError<E>,
) => void;

export interface UseUploadRequest<
  R = GenericUploadedFileResponse,
  E = GenericUploadedFileError,
> extends AxiosOptions {
  /**
   * Values passed directly to axios.get(endpoint, config)
   */
  config?: Omit<AxiosRequestConfig, 'url' | 'method'>;

  /**
   * Value passed directly to axios.get(endpoint, config)
   */
  endpoint: string;

  onSuccess?: UploadFileSuccessCallback<R>;
  onError?: UploadFileErrorCallback<E>;
}

function useUploadRequest<
  R = GenericUploadedFileResponse,
  E = GenericUploadedFileError,
>(params: UseUploadRequest<R, E>) {
  const { axiosInstance, endpoint, config = {}, onError = () => {}, onSuccess = () => {} } = params;

  const { headers = {}, ...restConfig } = config;

  // get axiosInstance from AuthContext if not provided
  const authContext = useAuthContext();
  const ai = axiosInstance || authContext.buildAxiosInstance();

  // status
  const [status, setStatus] = useState<'empty' | 'pending' | 'success' | 'error'>('empty');
  const [error, setError] = useState<E | null>(null);
  const [response, setResponse] = useState<AxiosResponse<R> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formatMessage = useFormatErrorToString();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);
      setStatus('pending');
      setError(null);
      setErrorMessage(null);
      setResponse(null);

      ai.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...headers,
        },
        ...restConfig,
      })
        .then((response) => {
          setResponse(response);
          setStatus('success');
          onSuccess(response);
        })
        .catch((error) => {
          setStatus('error');
          setError(error);

          let msg = '';
          if (isAxiosError(error)) {
            const err = error as AxiosError<DrfError<GenericUploadedFileError>>;
            msg = ((err.response && err.response.data.file) || []).join('\n');
          }
          if (!msg) {
            msg = formatMessage(error);
          }

          setErrorMessage(msg);
          onError(msg, error);
        });
    },
    [ai, endpoint, formatMessage, headers, onError, onSuccess, restConfig],
  );

  return {
    onDrop,
    status,
    error,
    response,
    errorMessage,
  };
}

export default useUploadRequest;
