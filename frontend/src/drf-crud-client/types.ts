import { AxiosInstance } from 'axios';

/**
 * Options for axios request.
 */
export interface AxiosOptions {
  /**
   * The axios instance for fetches. Please use for implement interceptors for authentication.
   *
   * If not provided, the useSimpleJwtAxios is used by default.
   */
  axiosInstance?: AxiosInstance;
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
  action?: string;

  /**
   * Unique identifier used as a part of queryKey in useQuery cache.
   * If not provided the action value will be used.
   *
   * @see buildEndpoint
   */
  actionQK?: string;
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
