import { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { UseRFHIntegration, useRFHIntegration } from './useRFHIntegration';
import { UseRFHIntegrationResult } from './useRFHIntegration';
import { useDrfCUD, UseDrfCUD, UseDrfCUDResult } from './useDrfCUD';
import { AxiosRequestConfig } from 'axios';

/**
 * Options for useDrfEntityForm.
 *
 * @template TRequest schema of useForm and passed to backend in request
 * @template PK value type of primaryKey
 * @template TResponse schema of response from backend
 * @template RFHContext passed directly to useForm as TContext
 * @template TQContext passed directly to useMutationWrapper as TContext
 */
export interface UseDrfEntityForm<
  TRequest extends FieldValues = FieldValues,
  PK extends number | string = number | string,
  TResponse extends FieldValues = Request,
  RFHContext = any,
  TQContext = undefined,
> extends Omit<UseDrfCUD<TRequest, PK, TResponse, TQContext>, 'config'> {
  /**
   * Optional additional options for axios used in useMutationWrapper.
   */
  config?: AxiosRequestConfig<TRequest>;

  /**
   * Options passed directly to useForm.
   */
  formProps?: UseFormProps<TRequest, RFHContext>;

  /**
   * Additional options passed directly to useRFHIntegration
   * (without form and mutateAsync because they are filled by this hook).
   */
  integrationProps?: Omit<UseRFHIntegration<TRequest, TResponse, RFHContext, TQContext>, 'form' | 'mutateAsync'>;
}

/**
 * Result from useDrfForm. Returns result of useRFHIntegration with injected
 * results of useForm and useMutationWrapper.
 *
 * @template TRequest schema of useForm and passed to backend in request
 * @template TResponse schema of response from backend
 * @template RFHContext passed directly to useForm as TContext
 * @template TQContext passed directly to useMutationWrapper as TContext
 */
export interface UseDrfEntityFormResult<
  TRequest extends FieldValues = FieldValues,
  TResponse extends FieldValues = Request,
  RFHContext = any,
  TQContext = undefined,
> extends UseRFHIntegrationResult<TRequest> {
  /**
   * Result of useForm.
   */
  form: UseFormReturn<TRequest, RFHContext>;

  /**
   * Result of useMutationWrapper.
   */
  cud: UseDrfCUDResult<TRequest, TResponse, TQContext>;
}

/**
 * useForm from react-form-hook integrated with useDrfCUD
 *
 * Crates useForm and useDrfCUD and integrate via useRFHIntegration.
 *
 * Dedicated to create or update entities.
 *
 * If primeryKey is not provided, the entity will be created via request:
 * POST {endpoint}{resource}/
 *
 * Otherwise the entity will be updated via request:
 * PUT {endpoint}{resource}/{primaryKey}/
 *
 * Validation errors from DRF backend will be delivered to react-form-hooks.
 *
 * @see useDrfCUD
 * @see useRFHIntegration
 */
export function useDrfEntityForm<
  TRequest extends FieldValues = FieldValues,
  PK extends number | string = number | string,
  TResponse extends FieldValues = TRequest,
  RFHContext = any,
  TQContext = undefined,
>(
  params: UseDrfEntityForm<TRequest, PK, TResponse, RFHContext, TQContext>,
): UseDrfEntityFormResult<TRequest, TResponse, RFHContext, TQContext> {
  const { formProps, integrationProps, primaryKey, config = {}, ...cudProps } = params;

  const method = primaryKey ? 'PUT' : 'POST';
  const form = useForm(formProps);
  const cud = useDrfCUD<TRequest, PK, TResponse, TQContext>({
    primaryKey,
    config: { method, ...config },
    ...cudProps,
  });
  const { mutateAsync } = cud;
  const integration = useRFHIntegration({ form, mutateAsync, ...integrationProps });

  return { ...integration, form, cud };
}
