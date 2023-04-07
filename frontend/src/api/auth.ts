import { useBackend, UseBackendParams } from './common';

export interface BearerToken {
  email: string;
  exp: number;
  iat: number;
  jti: string;
  token_type: 'access' | 'refresh';
  user_id: number;
  username: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
}

export function useLoginApi(params: Omit<UseBackendParams<LoginResponse, LoginRequest>, 'endpoint' | 'method'>) {
  return useBackend({
    endpoint: '/api/token/',
    method: 'POST',
    ...params,
  });
}
