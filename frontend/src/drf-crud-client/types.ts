import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { DrfError } from './errors';
import { FieldValues } from 'react-hook-form';

export interface RequestOptions<TFieldValues extends FieldValues = FieldValues> {
  axiosInstance?: AxiosInstance;
  config?: AxiosRequestConfig;
  onSuccess?: (data: TFieldValues) => void;
  onError?: (err: AxiosError<DrfError<TFieldValues>>) => void;
  endpoint: string;
}

export interface ModelOptions {
  queryKey: string;
}

export interface PaginatedOptions {
  pageSize?: number;
  initialPage?: number;
}
