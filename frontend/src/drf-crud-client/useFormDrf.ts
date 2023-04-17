import { FieldValues, UseFormProps } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import axios, { AxiosInstance, Method } from 'axios';
import { UseRFHIntegration, useRFHIntegration } from './useRFHIntegration';
import { useDrfMutation, UseDrfMutation } from './useDrfMutation';
import { MutationKey } from '@tanstack/query-core/src/types';

export interface UseFormDrf<
  Request extends FieldValues = FieldValues,
  Response extends FieldValues = Request,
  RFHContext = any,
  TQContext = undefined,
> {
  endpoint: string;
  method: Method;
  mutationKey: MutationKey;
  formProps?: UseFormProps<Request, RFHContext>;
  cudProps?: Omit<UseDrfMutation<Request, Response, TQContext>, 'axiosInstance'>;
  integrationProps?: Omit<UseRFHIntegration<Request, Response, RFHContext, TQContext>, 'form' | 'drfMutation'>;
  axiosInstance?: AxiosInstance;
}

export function useFormDrf<
  Request extends FieldValues = FieldValues,
  Response extends FieldValues = Request,
  RFHContext = any,
  TQContext = undefined,
>(params: UseFormDrf<Request, Response, RFHContext, TQContext>) {
  const {
    endpoint,
    method,
    mutationKey,
    formProps,
    cudProps = {},
    axiosInstance = axios,
    integrationProps = {},
  } = params;

  const form = useForm(formProps);
  const drfMutation = useDrfMutation<Request, Response, TQContext>({
    endpoint,
    method,
    mutationKey,
    axiosInstance,
    ...cudProps,
  });
  const integration = useRFHIntegration({ form, drfMutation, ...integrationProps });

  return { ...integration, form, drfMutation };
}
