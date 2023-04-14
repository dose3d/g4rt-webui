import { FieldPath, FieldValues } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { UseFormSetError } from 'react-hook-form';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export type DrfError<TFieldValues extends FieldValues = FieldValues> = {
  [V in FieldPath<TFieldValues>]?: string[];
} & { detail?: string };

export function formatErrorToString(err: unknown, t: TFunction): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<DrfError>;
    if (axiosErr.response) {
      if (axiosErr.response.headers['content-type'] == 'application/json') {
        return t('errors.server', { detail: axiosErr.response.data.detail });
      } else {
        return t('errors.server_unknown');
      }
    } else {
      return t('errors.noconnection');
    }
  } else if (err instanceof Error) {
    return t('errors.browser_unknown', { msg: `${err}` });
  } else {
    return t('errors.unknown', { msg: `${err}` });
  }
}

export function loadErrorsToRFH<TFieldValues extends FieldValues = FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  t: TFunction,
) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<DrfError<TFieldValues>>;
    if (axiosError.response) {
      const resp = axiosError.response.data;
      const fields = Object.keys(resp) as FieldPath<TFieldValues>[];
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const value = resp[field];
        if (Array.isArray(value)) {
          const message = value.join('\n');
          setError(field, { type: 'custom', message });
        }
      }
    }
  }
  return formatErrorToString(error, t);
}

export function useFormatErrorToString() {
  const { t } = useTranslation('drf');
  return useCallback((err: unknown) => formatErrorToString(err, t), [t]);
}
