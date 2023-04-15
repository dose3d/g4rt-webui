import { FieldValues } from 'react-hook-form';
import { useDrfQuery, UseDrfQuery } from './useDrfQuery';
import { ActionOptions, EntityOptions, ModelOptions } from './types';

export type UseEntity<
  TFieldValues extends FieldValues = FieldValues,
  PK extends number | string = number | string,
> = Omit<UseDrfQuery<TFieldValues>, 'queryKey'> & ModelOptions & EntityOptions<PK> & Partial<ActionOptions>;

export function useEntity<TFieldValues extends FieldValues = FieldValues, PK extends number | string = number | string>(
  args: UseEntity<TFieldValues, PK>,
) {
  const { queryKey, primaryKey, endpoint, action, ...rest } = args;

  const ep = `${endpoint}${primaryKey}/`;
  const ep2 = action ? `${endpoint}${primaryKey}/${action}/` : ep;

  return useDrfQuery<TFieldValues>({
    queryKey: queryKey ? [queryKey, 'entity', `${primaryKey}`, action] : undefined,
    endpoint: ep2,
    ...rest,
  });
}
