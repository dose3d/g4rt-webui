import { FieldValues, UseFormProps } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { AxiosInstance } from 'axios';
import { useCreateUpdateDelete, UseCreateUpdateDelete } from './useCreateUpdateDelete';
import { UseRFHIntegration, useRFHIntegration } from './useRFHIntegration';

export interface UseFormCreateUpdate<
  Request extends FieldValues = FieldValues,
  PK extends number | string = number | string,
  Response extends FieldValues = Request,
  RFHContext = any,
  TQContext = undefined,
> {
  endpoint: string;
  queryKey: string;
  primaryKey?: PK;
  formProps?: UseFormProps<Request, RFHContext>;
  cudProps?: Omit<
    UseCreateUpdateDelete<Request, PK, Response, TQContext>,
    'endpoint' | 'queryKey' | 'primaryKey' | 'axiosInstance' | 'method'
  >;
  integrationProps?: Omit<UseRFHIntegration<Request, Response, RFHContext, TQContext>, 'form' | 'drfMutation'>;
  axiosInstance?: AxiosInstance;
}

export function useFormCreateUpdate<
  Request extends FieldValues = FieldValues,
  PK extends number | string = number | string,
  Response extends FieldValues = Request,
  RFHContext = any,
  TQContext = undefined,
>(params: UseFormCreateUpdate<Request, PK, Response, RFHContext, TQContext>) {
  const { endpoint, queryKey, primaryKey, formProps, cudProps = {}, axiosInstance, integrationProps = {} } = params;

  const method = primaryKey ? 'PUT' : 'POST';
  const form = useForm(formProps);
  const createUpdate = useCreateUpdateDelete<Request, PK, Response, TQContext>({
    endpoint,
    queryKey,
    primaryKey,
    axiosInstance,
    method,
    ...cudProps,
  });
  const integration = useRFHIntegration({ form, drfMutation: createUpdate, ...integrationProps });

  return { ...integration, form, createUpdate };
}
