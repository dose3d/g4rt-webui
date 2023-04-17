import { FieldValues, UseFormReturn } from 'react-hook-form';
import { loadErrorsToRFH } from './errors';
import { SubmitHandler, UseFormSetError } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { UseDrfMutationReturn } from './useDrfMutation';
import { TFunction } from 'i18next';

export interface UseRFHIntegration<
  Request extends FieldValues = FieldValues,
  Response extends FieldValues = Request,
  RFHContext = any,
  TQContext = undefined,
> {
  form: UseFormReturn<Request, RFHContext>;
  drfMutation: UseDrfMutationReturn<Request, Response, TQContext>;
  resetOnSuccess?: boolean | ((response: Response) => Request);
  errorsParser?: (error: unknown, setError: UseFormSetError<Request>, t: TFunction, data: Request) => string;
  t?: TFunction;
}

export function useRFHIntegration<
  Request extends FieldValues = FieldValues,
  Response extends FieldValues = Request,
  RFHContext = any,
  TQContext = undefined,
>(params: UseRFHIntegration<Request, Response, RFHContext, TQContext>) {
  const { form, drfMutation, resetOnSuccess = false, t: myT, errorsParser = loadErrorsToRFH } = params;
  const { setError, reset, handleSubmit } = form;
  const [parsedError, setParsedError] = useState<string | null>(null);
  const { t } = useTranslation('drf');

  const onSubmit: SubmitHandler<Request> = useCallback(
    async (data) => {
      try {
        const ret = await drfMutation.mutateAsync(data);
        setParsedError(null);
        if (resetOnSuccess) {
          if (typeof resetOnSuccess === 'function') {
            reset(resetOnSuccess(ret));
          } else {
            reset(ret as unknown as Request);
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
    [drfMutation, errorsParser, myT, reset, resetOnSuccess, setError, t],
  );

  // Shortcut for handleSubmit(onSubmit)
  const handleSubmitShort = handleSubmit(onSubmit);

  return { onSubmit, handleSubmitShort, parsedError };
}
