import { FieldValues } from 'react-hook-form';
import { DefaultLoginRequest, JwtTokens } from './types';
import { DEFAULT_LOGIN_ENDPOINT, DEFAULT_MUTATION_KEY } from './consts';
import { useDrfForm, UseDrfForm } from './useDrfForm';
import axios from 'axios';

export function useSimpleJwtForm<LoginRequest extends FieldValues = DefaultLoginRequest, TContext = unknown>(
  params: Partial<UseDrfForm<LoginRequest, JwtTokens, TContext>> & { url?: string },
) {
  const {
    url = DEFAULT_LOGIN_ENDPOINT,
    mutationKey = DEFAULT_MUTATION_KEY,
    axiosInstance = axios,
    config = {},
    ...rest
  } = params;

  return useDrfForm<LoginRequest, JwtTokens, TContext>({
    axiosInstance,
    mutationKey: [mutationKey],
    config: {
      url,
      ...config,
    },
    ...rest,
  });
}
