import { JwtTokens } from './types';
import { UseDrfMutation, useDrfMutation } from './useDrfMutation';
import { FieldValues } from 'react-hook-form';
import { UseFormDrf, useFormDrf } from './useFormDrf';

export interface DefaultLoginRequest {
  username: string;
  password: string;
}

export function useSimpleJwtClient<LoginRequest extends FieldValues = DefaultLoginRequest, TContext = unknown>(
  params: UseDrfMutation<JwtTokens, LoginRequest, TContext>,
) {
  const { endpoint = '/api/token/', method = 'POST', ...rest } = params;

  return useDrfMutation<JwtTokens, LoginRequest, TContext>({
    endpoint,
    method,
    ...rest,
  });
}

export function useSimpleJwtForm<LoginRequest extends FieldValues = DefaultLoginRequest, TContext = unknown>(
  params: UseFormDrf<LoginRequest, JwtTokens, TContext>,
) {
  const { endpoint = '/api/token/', method = 'POST', ...rest } = params;

  return useFormDrf<LoginRequest, JwtTokens, TContext>({
    endpoint,
    method,
    ...rest,
  });
}
