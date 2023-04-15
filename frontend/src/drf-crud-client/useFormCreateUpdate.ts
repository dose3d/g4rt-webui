import { FieldValues, UseFormProps } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import axios, { AxiosInstance } from 'axios';
import { useCreateUpdateDelete, UseCreateUpdateDelete } from './useCreateUpdateDelete';
import { UseRFHIntegration, useRFHIntegration } from './useRFHIntegration';

export interface UseFormCreateUpdate<
  TFieldValues extends FieldValues = FieldValues,
  PK extends number | string = number | string,
  RFHContext = any,
  TQContext = undefined,
> {
  endpoint: string;
  queryKey: string;
  primaryKey?: PK;
  formProps?: UseFormProps<TFieldValues, RFHContext>;
  cudProps?: Omit<
    UseCreateUpdateDelete<TFieldValues, TFieldValues, PK, TQContext>,
    'endpoint' | 'queryKey' | 'primaryKey' | 'axiosInstance' | 'method'
  >;
  integrationProps?: Omit<UseRFHIntegration<TFieldValues, RFHContext, TQContext>, 'form' | 'createUpdate'>;
  axiosInstance?: AxiosInstance;
}

export function useFormCreateUpdate<
  TFieldValues extends FieldValues = FieldValues,
  PK extends number | string = number | string,
  RFHContext = any,
  TQContext = undefined,
>(params: UseFormCreateUpdate<TFieldValues, PK, RFHContext, TQContext>) {
  const {
    endpoint,
    queryKey,
    primaryKey,
    formProps,
    cudProps = {},
    axiosInstance = axios,
    integrationProps = {},
  } = params;

  const method = primaryKey ? 'PUT' : 'POST';
  const form = useForm(formProps);
  const createUpdate = useCreateUpdateDelete({ endpoint, queryKey, primaryKey, axiosInstance, method, ...cudProps });
  const integration = useRFHIntegration({ form, createUpdate, ...integrationProps });

  return { ...integration, form, createUpdate };
}
