import React, { createContext, useState, useCallback } from 'react';
import axios, { AxiosInstance } from 'axios';
import { useInterval } from 'usehooks-ts';
import { AuthManager } from './AuthManager';
import { SimpleJwtAuthManager } from './SimpleJwtAuthManager';

/**
 * Data and methods provided by AuthContext.
 */
interface ContextData {
  /**
   * Auth token (or token and something user data) when logged or null when no logged.
   */
  authData: any | null;

  /**
   * Set authData i.e. after successful logon or load by onLoadAuthData.
   *
   * @param authData auth token
   * @param store launch onStoreAuthData
   */
  setAuthData: (authData: any | null, store: boolean) => void;

  /**
   * Remove auth data from Context state and launch onStoreAuthData(null).
   */
  cleanAuthData: () => void;

  /**
   * Provide methods for store auth data (i.e. in sessionStorage), load stored auth data
   * and build axiosInstance for useQueryWrapper and useMutationWrapper.
   *
   * By default, the SimpleJwtAuthManager is used.
   *
   * @see SimpleJwtAuthManager
   */
  authManager?: AuthManager;

  /**
   * Used to build default axiosInstance by useQueryWrapper and useMutationWrapper.
   *
   * The axiosInstance can implement interceptors for inject auth tokens in
   * HTTP requests and handle session expired error.
   */
  buildAxiosInstance: () => AxiosInstance;
}

const defaultContextData: ContextData = {
  authData: null,
  setAuthData: () => {},
  cleanAuthData: () => {},

  buildAxiosInstance: () => axios,
};

export const AuthContext = createContext<ContextData>(defaultContextData);

interface Props {
  children?: React.ReactNode;

  /**
   * Provide methods for store auth data (i.e. in sessionStorage), load stored auth data
   * and build axiosInstance for useQueryWrapper and useMutationWrapper.
   *
   * By default, the SimpleJwtAuthManager is used.
   *
   * @see SimpleJwtAuthManager
   */
  authManager?: AuthManager;

  /**
   * Optional callback to ping backend for prevent session expiration.
   */
  onPingSession?: (data: any, setAuthData: (data: any | null, store: boolean) => void) => void;

  /**
   * Interval for onPingSession (ms).
   */
  pingInterval?: number;
}

/**
 * Manage auth state.
 */
export const AuthProvider = (props: Props) => {
  const { children, authManager, pingInterval = 60000, onPingSession } = props;

  const { onLoadAuthData, onStoreAuthData, onBuildAxiosInstance } = authManager || new SimpleJwtAuthManager();

  const [authData, setAuthDataState] = useState(() => onLoadAuthData());

  // set authData state and launch onStoreAuthData if store is true
  const setAuthData = useCallback(
    (data: any, store: boolean) => {
      setAuthDataState(data);
      if (store) {
        onStoreAuthData(data);
      }
    },
    [onStoreAuthData],
  );

  const cleanAuthData = useCallback(() => {
    setAuthDataState(null);
    onStoreAuthData(null);
  }, [onStoreAuthData]);

  const buildAxiosInstance = useCallback(
    () => onBuildAxiosInstance(authData, setAuthData),
    [authData, onBuildAxiosInstance, setAuthData],
  );

  const contextData: ContextData = {
    authData,
    setAuthData,
    cleanAuthData,
    buildAxiosInstance,
    authManager,
  };

  // ping backend if logged and onPingSession provided
  useInterval(
    () => onPingSession && authData && onPingSession(authData, setAuthData),
    onPingSession && authData && pingInterval,
  );

  return <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>;
};
