import { FieldValues } from 'react-hook-form';
import { useDrfQuery, UseDrfQuery } from './useDrfQuery';
import { ActionOptions, EntityOptions, ModelOptions } from './types';

export type UseEntity<Entity extends FieldValues = FieldValues, PK extends number | string = number | string> = Omit<
  UseDrfQuery<Entity>,
  'queryKey'
> &
  ModelOptions &
  EntityOptions<PK> &
  Partial<ActionOptions>;

export function getEntityQueryKey<PK extends number | string = number | string>(
  queryKey: string,
  primaryKey: PK,
  action?: string,
) {
  return [queryKey, 'entity', `${primaryKey}`, action];
}

export function useEntity<Entity extends FieldValues = FieldValues, PK extends number | string = number | string>(
  args: UseEntity<Entity, PK>,
) {
  const { queryKey, primaryKey, endpoint, action, ...rest } = args;

  const ep = `${endpoint}${primaryKey}/`;
  const ep2 = action ? `${endpoint}${primaryKey}/${action}/` : ep;

  return useDrfQuery<Entity>({
    queryKey: queryKey ? getEntityQueryKey(queryKey, primaryKey, action) : undefined,
    endpoint: ep2,
    ...rest,
  });
}
