import { AuthManager } from './AuthManager';
import axios, { AxiosError, AxiosInstance, isAxiosError } from 'axios';
import jwt_decode from 'jwt-decode';
import { JwtBearerToken, JwtTokens } from './types';
import { DEFAULT_TOKENS_KEY } from './consts';
import moment from 'moment';

function parseJsonOrNull<T>(v: string | null) {
  if (v) {
    return JSON.parse(v) as T;
  }
  return null;
}

export function decodeJwtOrNull<T>(v?: string) {
  if (v) {
    return jwt_decode<JwtBearerToken>(v) as T;
  }
  return null;
}

/**
 * Manage tokens from djangorestframework-simplejwt
 */
export class SimpleJwtAuthManager extends AuthManager<JwtTokens> {
  private useLocalStorage: boolean;
  private readonly tokensKey: string;
  private readonly refreshEndpoint: string;

  /**
   * Create object and fill settings.
   *
   * @param useLocalStorage if true tokens will be stored in localStorage instead session storage
   * @param tokensKey key in storage for store tokens
   * @param refreshEndpoint endpoint for refresh token (it is SimpleJwt functionality).
   */
  constructor(
    useLocalStorage = false,
    tokensKey: string = DEFAULT_TOKENS_KEY,
    refreshEndpoint = '/api/token/refresh/',
  ) {
    super();
    this.tokensKey = tokensKey;
    this.useLocalStorage = useLocalStorage;
    this.refreshEndpoint = refreshEndpoint;
  }

  /**
   * Switch local od session storage.
   */
  setUseLocalStorage = (v: boolean) => {
    if (v != this.useLocalStorage) {
      this.useLocalStorage = v;
      this.onStoreAuthData(this.onLoadAuthData());
    }
  };

  /**
   * Build axiosInstance with w interceptor who case:
   * - inject HTTP header with bearer token,
   * - if auth token is expired, refresh token before request,
   * - if got 401 error (invalid token and invalid refresh token)
   *   launch setAuthData(null) for invalidate client session.
   *
   * @param loadAuthData auth tokens used for injection
   * @param setAuthData callback for set null when gets 401 error
   */
  onBuildAxiosInstance = (
    loadAuthData: () => JwtTokens | null,
    setAuthData: (data: JwtTokens | null, store: boolean) => void,
  ): AxiosInstance => {
    const authData = loadAuthData();

    const axiosInstance = axios.create({
      headers: { Authorization: `Bearer ${authData?.access}` },
    });

    axiosInstance.interceptors.request.use(async (req) => {
      const authData = loadAuthData();

      if (!authData) {
        return req;
      }

      req.headers.Authorization = `Bearer ${authData.access}`;

      const user = jwt_decode(authData.access) as { exp: number };
      const isExpired = moment.unix(user.exp).diff(moment()) < 1;

      if (!isExpired) {
        return req;
      }

      try {
        const response = await axios.post(this.refreshEndpoint, {
          refresh: authData.refresh,
        });

        if (response.data.refresh) {
          setAuthData(response.data, true);
        } else {
          // when 'ROTATE_REFRESH_TOKENS': False then no refresh token in response
          setAuthData({ ...response.data, refresh: authData.refresh }, true);
        }

        req.headers.Authorization = `Bearer ${response.data.access}`;
      } catch (err) {
        if (isAxiosError(err)) {
          const ar = err as AxiosError;
          if (ar.response?.status === 401) {
            setAuthData(null, true);
          }
        }
      }

      return req;
    });

    return axiosInstance;
  };

  /**
   * Callback implementation for load auth tokens from localStorage or sessionStorage.
   */
  onLoadAuthData = () => {
    return parseJsonOrNull<JwtTokens>(localStorage.getItem(this.tokensKey) || sessionStorage.getItem(this.tokensKey));
  };

  /**
   * Callback implementation for store auth tokens in localStorage or sessionStorage
   * (depend on this.useLocalStorage).
   *
   * If authData is null (logout) the HTTP request for logout will be called in
   * background without result handle.
   *
   * @param authData to store or null to clean
   */
  onStoreAuthData = (authData: JwtTokens | null): void => {
    if (authData == null) {
      localStorage.removeItem(this.tokensKey);
      sessionStorage.removeItem(this.tokensKey);
      // TODO: axios.post logout
    } else {
      (this.useLocalStorage ? localStorage : sessionStorage).setItem(this.tokensKey, JSON.stringify(authData));
    }
  };
}
