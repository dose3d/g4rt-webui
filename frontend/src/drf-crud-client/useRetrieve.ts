import { FieldValues } from 'react-hook-form';
import { useDrfQuery, UseDrfQuery } from './useDrfQuery';
import { ActionOptions, ModelOptions } from './types';

export type UseRetrieve<Entity extends FieldValues = FieldValues> = Omit<UseDrfQuery<Entity[]>, 'queryKey'> &
  ModelOptions &
  Partial<ActionOptions>;

export function useRetrieve<Entity extends FieldValues = FieldValues>(args: UseRetrieve<Entity>) {
  const { queryKey, action, endpoint, ...rest } = args;

  const ep = action ? `${endpoint}${action}/` : endpoint;

  return useDrfQuery<Entity[]>({
    queryKey: queryKey ? [queryKey, 'list'] : undefined,
    endpoint: ep,
    ...rest,
  });
}
