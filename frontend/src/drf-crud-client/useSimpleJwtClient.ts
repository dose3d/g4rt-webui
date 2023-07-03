import { DefaultLoginRequest, JwtTokens } from './types';
import { UseMutationWrapper, useMutationWrapper } from './useMutationWrapper';
import { FieldValues } from 'react-hook-form';
import { DEFAULT_LOGIN_ENDPOINT, DEFAULT_MUTATION_KEY } from './consts';
import axios from 'axios';

export function useSimpleJwtClient<LoginRequest extends FieldValues = DefaultLoginRequest, TContext = unknown>(
  params: UseMutationWrapper<JwtTokens, LoginRequest, TContext> & { url?: string },
) {
  const {
    url = DEFAULT_LOGIN_ENDPOINT,
    mutationKey = [DEFAULT_MUTATION_KEY],
    axiosInstance = axios,
    config = {},
    ...rest
  } = params;

  return useMutationWrapper<JwtTokens, LoginRequest, TContext>({
    mutationKey,
    axiosInstance,
    config: { url, ...config },
    ...rest,
  });
}
