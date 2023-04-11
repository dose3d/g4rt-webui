import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { BearerToken, LoginResponse } from '../api/auth';

interface ContextData {
  user: BearerToken | null;
  setUser: (value: BearerToken | null) => void;
  authTokens: LoginResponse | null;
  setAuthTokens: (value: LoginResponse | null) => void;
  loginUser: (data: LoginResponse) => void;
  logoutUser: () => void;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const AuthContext = createContext<ContextData>();

interface Props {
  children: React.ReactNode;
}

function parseJsonOrNull(v: string | null) {
  if (v) {
    return JSON.parse(v);
  }
  return null;
}

function decodeJwtOrNull<T>(v: string | null) {
  if (v) {
    return jwt_decode<BearerToken>(v) as T;
  }
  return null;
}

export const AuthProvider = ({ children }: Props) => {
  const [authTokens, setAuthTokens] = useState<LoginResponse | null>(() =>
    parseJsonOrNull(localStorage.getItem('authTokens')),
  );
  const [user, setUser] = useState<BearerToken | null>(() => decodeJwtOrNull(localStorage.getItem('authTokens')));
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loginUser = (data: LoginResponse) => {
    setAuthTokens(data);
    setUser(jwt_decode(data.access));
    localStorage.setItem('authTokens', JSON.stringify(data));
    navigate('/');
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    navigate('/');
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

  return <AuthContext.Provider value={contextData}>{loading ? null : children}</AuthContext.Provider>;
};

export default AuthContext;
