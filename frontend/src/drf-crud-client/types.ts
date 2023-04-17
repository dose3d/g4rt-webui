import { AxiosError, AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import { DrfError } from './errors';
import { FieldValues } from 'react-hook-form';

export interface QueryOptions<Response extends FieldValues = FieldValues> {
  axiosInstance?: AxiosInstance;
  config?: Omit<AxiosRequestConfig, 'url' | 'method'>;
  onSuccess?: (data: Response) => void;
  onError?: (err: AxiosError<DrfError<Response>>) => void;
  endpoint: string;
}

export interface MutationOptions<
  Request extends FieldValues = FieldValues,
  Response extends FieldValues = Request,
  TContext = undefined,
> {
  axiosInstance?: AxiosInstance;
  config?: Omit<AxiosRequestConfig<Request>, 'data' | 'url' | 'method'>;
  onSuccess?: (data: Response, values: Request, context?: TContext) => void;
  onError?: (err: AxiosError<DrfError<Request>, Request>, values: Request, context?: TContext) => void;
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

export interface JwtBearerToken {
  email: string;
  exp: number;
  iat: number;
  jti: string;
  token_type: 'access' | 'refresh';
  user_id: number;
  username: string;
}

export interface JwtTokens {
  refresh: string;
  access: string;
}
