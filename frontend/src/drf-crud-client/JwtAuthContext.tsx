import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import { JwtBearerToken, JwtTokens } from './types';
import { DEFAULT_TOKENS_KEY } from './consts';

interface ContextData {
  user: JwtBearerToken | null;
  setUser: (value: JwtBearerToken | null) => void;
  authTokens: JwtTokens | null;
  setAuthTokens: (value: JwtTokens | null) => void;
  loginUser: (data: JwtTokens) => void;
  logoutUser: () => void;
}

const defaultContextData: ContextData = {
  authTokens: null,
  loginUser: () => {},
  logoutUser: () => {},
  user: null,
  setUser: () => {},
  setAuthTokens: () => {},
};

export const JwtAuthContext = createContext<ContextData>(defaultContextData);

interface Props {
  children: React.ReactNode;
  tokensKey?: string;
  loadingNode?: React.ReactNode;
  loadTokens?: (key: string) => JwtTokens | null;
  storeTokens?: (key: string, tokens: JwtTokens | null) => void;

  onLogin?: (response: JwtTokens) => void;
  onLogout?: () => void;
}

function parseJsonOrNull<T>(v: string | null) {
  if (v) {
    return JSON.parse(v) as T;
  }
  return null;
}

function decodeJwtOrNull<T>(v?: string) {
  if (v) {
    return jwt_decode<JwtBearerToken>(v) as T;
  }
  return null;
}

export function defaultLoadTokens(key: string) {
  return parseJsonOrNull<JwtTokens>(localStorage.getItem(key));
}

export function defaultStoreTokens<LoginResponse extends JwtTokens = JwtTokens>(
  key: string,
  tokens: LoginResponse | null,
) {
  if (tokens == null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(tokens));
  }
}

export const JwtAuthProvider = (props: Props) => {
  const {
    tokensKey = DEFAULT_TOKENS_KEY,
    loadTokens = defaultLoadTokens,
    storeTokens = defaultStoreTokens,
    children,
    loadingNode,
    onLogin = () => {},
    onLogout = () => {},
  } = props;

  const [authTokens, setAuthTokens] = useState<JwtTokens | null>(() => loadTokens(tokensKey));
  const [user, setUser] = useState<JwtBearerToken | null>(() => decodeJwtOrNull(defaultLoadTokens(tokensKey)?.access));
  const [loading, setLoading] = useState(true);

  const loginUser = (data: JwtTokens) => {
    setAuthTokens(data);
    setUser(jwt_decode(data.access));
    storeTokens(tokensKey, data);
    onLogin(data);
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    storeTokens(tokensKey, null);
    onLogout();
  };

  const contextData: ContextData = {
    user,
    setUser,
    authTokens,
    setAuthTokens,
    loginUser,
    logoutUser,
  };

  useEffect(() => {
    if (authTokens) {
      setUser(jwt_decode(authTokens.access));
    }
    setLoading(false);
  }, [authTokens, loading]);

  return <JwtAuthContext.Provider value={contextData}>{loading ? loadingNode : children}</JwtAuthContext.Provider>;
};
