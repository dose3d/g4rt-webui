import { FieldValues } from 'react-hook-form';
import { DefaultLoginRequest, JwtTokens } from './types';
import { useFormDrf, UseFormDrf } from './useFormDrf';
import { DEFAULT_LOGIN_ENDPOINT, DEFAULT_MUTATION_KEY } from './consts';

export function useSimpleJwtForm<LoginRequest extends FieldValues = DefaultLoginRequest, TContext = unknown>(
  params: Partial<UseFormDrf<LoginRequest, JwtTokens, TContext>>,
) {
  const { endpoint = DEFAULT_LOGIN_ENDPOINT, method = 'POST', mutationKey = DEFAULT_MUTATION_KEY, ...rest } = params;

  return useFormDrf<LoginRequest, JwtTokens, TContext>({
    endpoint,
    method,
    mutationKey: [mutationKey],
    ...rest,
  });
}
