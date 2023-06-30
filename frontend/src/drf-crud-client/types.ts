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

/**
 * REST API general options
 */
export interface ApiOptions {
  /**
   * Prefix for REST API endpoint.
   *
   * @see buildEndpoint
   */
  api: string;
}

/**
 * REST API resource options
 */
export interface ResourceOptions {
  /**
   * Resource name in REST API requests.
   *
   * @see buildEndpoint
   */
  resource: string;

  /**
   * Part of queryKey in useQuery cache.
   * If not provided the resource value will be used.
   */
  resourceQK?: string;
}

/**
 * REST API single entity options.
 *
 * @template PK type of entity unique identifier (primary key)
 */
export interface EntityOptions<PK extends number | string = number | string> {
  /**
   * Unique identifier of entity.
   *
   * @see buildEndpoint
   */
  primaryKey: PK;

  /**
   * Unique identifier used as a part of queryKey in useQuery cache.
   * If not provided the primaryKey value will be used.
   */
  primaryKeyQK?: PK;
}

export interface ActionOptions {
  /**
   * Action endpoint for resource or entity.
   *
   * @see buildEndpoint
   */
  action: string;
}

export interface ModelOptions {
  queryKey: string;
}

export interface ChangeOptions {
  method: Method;
}

export interface PaginatedOptions {
  page?: number;
  pageSize?: number;
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

export interface DefaultLoginRequest {
  username: string;
  password: string;
}
