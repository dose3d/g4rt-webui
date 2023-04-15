import { FieldValues } from 'react-hook-form';
import { useDrfQuery, UseDrfQuery } from './useDrfQuery';
import { ActionOptions, ModelOptions } from './types';

export type UseRetrieve<TFieldValues extends FieldValues = FieldValues> = Omit<UseDrfQuery<TFieldValues>, 'queryKey'> &
  ModelOptions &
  Partial<ActionOptions>;

export function useRetrieve<TFieldValues extends FieldValues = FieldValues>(args: UseRetrieve<TFieldValues>) {
  const { queryKey, action, endpoint, ...rest } = args;

  const ep = action ? `${endpoint}${action}/` : endpoint;

  return useDrfQuery<TFieldValues>({
    queryKey: queryKey ? [queryKey, 'list'] : undefined,
    endpoint: ep,
    ...rest,
  });
}
