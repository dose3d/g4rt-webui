import { FieldValues } from 'react-hook-form';
import { AxiosOptions, DefaultLoginRequest, JwtTokens, Partial2nd } from './types';
import { DEFAULT_LOGIN_ENDPOINT, DEFAULT_MUTATION_KEY } from './consts';
import { useDrfForm, UseDrfForm } from './useDrfForm';
import axios, { Method } from 'axios';

export function useSimpleJwtForm<LoginRequest extends FieldValues = DefaultLoginRequest, TContext = unknown>(
  params: Partial2nd<UseDrfForm<LoginRequest, JwtTokens, TContext>> &
    AxiosOptions & { url?: string; method?: Method; mutationKey?: string },
) {
  const {
    url = DEFAULT_LOGIN_ENDPOINT,
    method = 'POST',
    mutationKey = DEFAULT_MUTATION_KEY,
    mutationProps = {},
    axiosInstance = axios,
    ...rest
  } = params;
  const { config = {} } = mutationProps;

  return useDrfForm<LoginRequest, JwtTokens, TContext>({
    mutationProps: {
      axiosInstance,
      mutationKey: [mutationKey],
      config: {
        url,
        method,
        ...config,
      },
      ...mutationProps,
    },
    ...rest,
  });
}
