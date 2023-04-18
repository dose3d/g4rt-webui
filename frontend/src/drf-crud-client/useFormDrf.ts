import { FieldValues, UseFormProps } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import axios, { AxiosInstance, Method } from 'axios';
import { UseRFHIntegration, useRFHIntegration } from './useRFHIntegration';
import { useDrfMutation, UseDrfMutation } from './useDrfMutation';
import { MutationKey } from '@tanstack/react-query';

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
  mutationProps?: Omit<UseDrfMutation<Request, Response, TQContext>, 'axiosInstance' | 'method' | 'endpoint'>;
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
    mutationProps = {},
    axiosInstance = axios,
    integrationProps = {},
  } = params;

  const form = useForm(formProps);
  const drfMutation = useDrfMutation({
    endpoint,
    method,
    mutationKey,
    axiosInstance,
    ...mutationProps,
  });
  const integration = useRFHIntegration({ form, drfMutation, ...integrationProps });

  return { ...integration, form, drfMutation };
}
