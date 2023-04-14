import { AxiosError, AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import { DrfError } from './errors';
import { FieldValues } from 'react-hook-form';

export interface QueryOptions<TFieldValues extends FieldValues = FieldValues> {
  axiosInstance?: AxiosInstance;
  config?: Omit<AxiosRequestConfig, 'url' | 'method'>;
  onSuccess?: (data: TFieldValues) => void;
  onError?: (err: AxiosError<DrfError<TFieldValues>>) => void;
  endpoint: string;
}

export interface MutationOptions<
  TFieldValues extends FieldValues = FieldValues,
  Request extends FieldValues = TFieldValues,
  TContext = undefined,
> {
  axiosInstance?: AxiosInstance;
  config?: Omit<AxiosRequestConfig<Request>, 'data' | 'url' | 'method'>;
  onSuccess?: (data: TFieldValues, values: Request, context?: TContext) => void;
  onError?: (err: AxiosError<DrfError<TFieldValues>>, values: Request, context?: TContext) => void;
  endpoint: string;
}

export interface ModelOptions {
  queryKey: string;
}

export interface ChangeOptions {
  method: Method;
}

export interface ActionOptions {
  action: string;
}

export interface EntityOptions<PK extends number | string = number | string> {
  primaryKey: PK;
}

export interface PaginatedOptions {
  pageSize?: number;
  initialPage?: number;
}
