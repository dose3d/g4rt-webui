import { FieldValues, UseFormReturn } from 'react-hook-form';
import { DrfError, loadErrorsToRFH } from './errors';
import { SubmitHandler, UseFormSetError } from 'react-hook-form';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { TFunction } from 'i18next';
import { UseMutationWrapperResult } from './useMutationWrapper';

/**
 * Options for useRFHIntegration.
 *
 * @template TRequest schema of useForm and passed to backend in request
 * @template TResponse schema of response from backend
 * @template RFHContext passed directly to useForm as TContext
 * @template TQContext passed directly to useMutationWrapper as TContext
 */
export interface UseRFHIntegration<
  TRequest extends FieldValues = FieldValues,
  TResponse extends FieldValues = TRequest,
  RFHContext = any,
  TQContext = undefined,
> {
  /**
   * Result of useForm.
   */
  form: UseFormReturn<TRequest, RFHContext>;

  /**
   * Result of useMutationWrapper
   */
  mutation: UseMutationWrapperResult<TResponse, DrfError<TRequest>, TRequest, TQContext>;

  /**
   * Behaviour after success of submit:
   * - false - no action,
   * - true - reset form by values from response,
   * - function - reset form by values returned from function.
   * @param response values from response.
   */
  resetOnSuccess?: boolean | ((response: TResponse) => TRequest);

  /**
   * Function used to parse error and inject to useForm.
   * @param error the error from useMutationWrapper
   * @param setError the setError metod from useForm
   * @param t translator function from t param
   * @param data request data
   * @return parsedError
   */
  errorsParser?: (error: unknown, setError: UseFormSetError<TRequest>, t: TFunction, data: TRequest) => string;

  /**
   * The translator used for translate non-backend errors (i.e. connection error).
   *
   * Used for generate parsedError.
   */
  t?: TFunction;
}

/**
 * Result of useRFHIntegration.
 *
 * @template TRequest schema of useForm and passed to backend in request
 */
export interface UseRFHIntegrationResult<TRequest extends FieldValues = FieldValues> {
  /**
   * Handler to use in handleSubmit. @see handleSubmitShort
   */
  onSubmit: SubmitHandler<TRequest>;

  /**
   * Returns handleSubmit(onSubmit)
   *
   * Can be used as <form onsubmit={handleSubmitShort}>
   */
  handleSubmitShort: (e?: React.BaseSyntheticEvent) => Promise<void>;

  /**
   * Summary of error, generated by errorsParser and translated by t.
   */
  parsedError: string | null;
}

/**
 * Integrate react-form-hook with useMutationWrapper.
 *
 * Provides handleSubmitShort for submit values from useForm via
 * useMutationWrapper. When backends validation fail errors will parse
 * and injected to useForm by errorsParser.
 *
 * By default, as errorsParser the loadErrorsToRFH is used.
 *
 * @see loadErrorsToRFH
 */
export function useRFHIntegration<
  TRequest extends FieldValues = FieldValues,
  TResponse extends FieldValues = TRequest,
  RFHContext = any,
  TQContext = undefined,
>(params: UseRFHIntegration<TRequest, TResponse, RFHContext, TQContext>): UseRFHIntegrationResult<TRequest> {
  const { form, mutation, resetOnSuccess = false, t: myT, errorsParser = loadErrorsToRFH } = params;
  const { setError, reset, handleSubmit } = form;
  const [parsedError, setParsedError] = useState<string | null>(null);
  const { t } = useTranslation('drf');

  const onSubmit: SubmitHandler<TRequest> = useCallback(
    async (data) => {
      try {
        const ret = await mutation.mutateAsync(data);
        setParsedError(null);
        if (resetOnSuccess) {
          if (typeof resetOnSuccess === 'function') {
            reset(resetOnSuccess(ret));
          } else {
            reset(ret as unknown as TRequest);
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setParsedError(errorsParser(error, setError, myT || t, data));
        } else {
          throw error;
        }
      }
    },
    [mutation, errorsParser, myT, reset, resetOnSuccess, setError, t],
  );

  // Shortcut for handleSubmit(onSubmit)
  const handleSubmitShort = handleSubmit(onSubmit);

  return { onSubmit, handleSubmitShort, parsedError };
}
