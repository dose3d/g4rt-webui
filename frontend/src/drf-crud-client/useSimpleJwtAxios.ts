import { useContext } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import { defaultStoreTokens, JwtAuthContext } from './JwtAuthContext';
import { JwtTokens } from './types';
import { DEFAULT_TOKENS_KEY } from './consts';

export interface UseSimpleJwtAxios {
  refreshEndpoint?: string;
  tokensKey?: string;
  storeTokens?: (key: string, tokens: JwtTokens | null) => void;
}

export function useSimpleJwtAxios(params: UseSimpleJwtAxios = {}) {
  const {
    refreshEndpoint = '/api/token/refresh/',
    tokensKey = DEFAULT_TOKENS_KEY,
    storeTokens = defaultStoreTokens,
  } = params;
  const { authTokens, setUser, setAuthTokens } = useContext(JwtAuthContext);

  const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${authTokens?.access}` },
  });

  axiosInstance.interceptors.request.use(async (req) => {
    if (!authTokens) {
      return req;
    }

    const user = jwt_decode(authTokens.access) as { exp: number };
    const isExpired = moment.unix(user.exp).diff(moment()) < 1;

    if (!isExpired) {
      return req;
    }

    const response = await axios.post(refreshEndpoint, {
      refresh: authTokens.refresh,
    });

    storeTokens(tokensKey, response.data);

    setAuthTokens(response.data);
    setUser(jwt_decode(response.data.access));

    req.headers.Authorization = `Bearer ${response.data.access}`;
    return req;
  });

  return axiosInstance;
}
