import { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { UseRFHIntegration, useRFHIntegration, UseRFHIntegrationResult } from './useRFHIntegration2';
import { UseMutationWrapper, useMutationWrapper, UseMutationWrapperResult } from './useMutationWrapper';
import { DrfError } from './errors';

/**
 * Options for useDrfForm.
 *
 * @template TRequest schema of useForm and passed to backend in request
 * @template TResponse schema of response from backend
 * @template RFHContext passed directly to useForm as TContext
 * @template TQContext passed directly to useMutationWrapper as TContext
 */
export interface UseDrfForm<
  TRequest extends FieldValues = FieldValues,
  TResponse extends FieldValues = TRequest,
  RFHContext = any,
  TQContext = undefined,
> extends UseMutationWrapper<TResponse, DrfError<TRequest>, TRequest, TQContext> {
  /**
   * Options passed directly to useForm.
   */
  formProps?: UseFormProps<TRequest, RFHContext>;

  /**
   * Additional options passed directly to useRFHIntegration
   * (without form and mutation because they are filled by this hook).
   */
  integrationProps?: Omit<UseRFHIntegration<TRequest, TResponse, RFHContext, TQContext>, 'form' | 'mutation'>;
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
export interface UseDrfFormResult<
  TRequest extends FieldValues = FieldValues,
  TResponse extends FieldValues = TRequest,
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
  mutation: UseMutationWrapperResult<TResponse, DrfError<TRequest>, TRequest, TQContext>;
}

/**
 * useForm from react-form-hook integrated with useMutationWrapper
 *
 * Crates useForm and useMutationWrapper and integrate via useRFHIntegration.
 *
 * Please use for universal non-CRUD forms passed to DRF backend and parse
 * validation errors from backend.
 *
 * @see useMutationWrapper
 * @see useRFHIntegration
 */
export function useDrfForm<
  TRequest extends FieldValues = FieldValues,
  TResponse extends FieldValues = TRequest,
  RFHContext = any,
  TQContext = undefined,
>(
  params: UseDrfForm<TRequest, TResponse, RFHContext, TQContext>,
): UseDrfFormResult<TRequest, TResponse, RFHContext, TQContext> {
  const { formProps, integrationProps = {}, ...mutationProps } = params;

  const form = useForm(formProps);
  const mutation = useMutationWrapper(mutationProps);
  const { mutateAsync } = mutation;
  const integration = useRFHIntegration({ form, mutateAsync, ...integrationProps });

  return { ...integration, form, mutation };
}
