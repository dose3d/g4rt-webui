import { DefaultLoginRequest, JwtTokens } from './types';
import { UseDrfMutation, useDrfMutation } from './useDrfMutation';
import { FieldValues } from 'react-hook-form';
import { DEFAULT_LOGIN_ENDPOINT, DEFAULT_MUTATION_KEY } from './consts';
import axios from 'axios';

export function useSimpleJwtClient<LoginRequest extends FieldValues = DefaultLoginRequest, TContext = unknown>(
  params: UseDrfMutation<JwtTokens, LoginRequest, TContext>,
) {
  const {
    endpoint = DEFAULT_LOGIN_ENDPOINT,
    method = 'POST',
    mutationKey = [DEFAULT_MUTATION_KEY],
    axiosInstance = axios,
    ...rest
  } = params;

  return useDrfMutation<JwtTokens, LoginRequest, TContext>({
    endpoint,
    method,
    mutationKey,
    axiosInstance,
    ...rest,
  });
}
