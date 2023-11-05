import { AxiosInstance } from 'axios';

export abstract class AuthManager<TAuthData = any> {
  /**
   * Callback to load authData from storage (i.e. localStorage or sessionStorage).
   */
  abstract onLoadAuthData: () => TAuthData | null;

  /**
   * Callback to store authData (i.e. in localStorage or sessionStorage) for onLoadAuthData.
   */
  abstract onStoreAuthData: (authData: TAuthData | null) => void;

  /**
   * Callback to build default axiosInstance for useQueryWrapper and useMutationWrapper.
   *
   * @param authData auth token
   * @parem setAuthData use for update authData or clean if backend returns 401 Unauthorized.
   */
  abstract onBuildAxiosInstance: (
    loadAuthData: () => TAuthData | null,
    setAuthData: (data: TAuthData | null, store: boolean) => void,
  ) => AxiosInstance;
}
