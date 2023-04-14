import { FieldValues, UseFormReturn } from 'react-hook-form';
import { loadErrorsToRFH } from './errors';
import { SubmitHandler, UseFormSetError } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { UseDrfChangeReturn } from './change';
import { TFunction } from 'i18next';

export interface UseRFHIntegration<
  TFieldValues extends FieldValues = FieldValues,
  RFHContext = any,
  TQContext = undefined,
> {
  form: UseFormReturn<TFieldValues, RFHContext>;
  createUpdate: UseDrfChangeReturn<TFieldValues, TFieldValues, TQContext>;
  resetOnSuccess?: boolean | ((response: TFieldValues) => TFieldValues);
  errorsParser?: (error: unknown, setError: UseFormSetError<TFieldValues>, t: TFunction, data: TFieldValues) => string;
  t?: TFunction;
}

export function useRFHIntegration<
  TFieldValues extends FieldValues = FieldValues,
  RFHContext = any,
  TQContext = undefined,
>(params: UseRFHIntegration<TFieldValues, RFHContext, TQContext>) {
  const { form, createUpdate, resetOnSuccess = false, t: myT, errorsParser = loadErrorsToRFH } = params;
  const { setError, reset, handleSubmit } = form;
  const [parsedError, setParsedError] = useState<string | null>(null);
  const { t } = useTranslation('drf');

  const onSubmit: SubmitHandler<TFieldValues> = useCallback(
    async (data) => {
      try {
        const ret = await createUpdate.mutateAsync(data);
        setParsedError(null);
        if (resetOnSuccess) {
          if (typeof resetOnSuccess === 'function') {
            reset(resetOnSuccess(ret));
          } else {
            reset(ret);
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
    [createUpdate, errorsParser, myT, reset, resetOnSuccess, setError, t],
  );

  // Shortcut for handleSubmit(onSubmit)
  const handleSubmitShort = handleSubmit(onSubmit);

  return { onSubmit, handleSubmitShort, parsedError };
}
