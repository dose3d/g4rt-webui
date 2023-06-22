import { FieldValues } from 'react-hook-form';
import { useDrfQuery, UseDrfQuery } from './useDrfQuery';
import { EntityOptions, ModelOptions } from './types';
import { getEntityQueryKey } from './utils';

export type UseEntity<Entity extends FieldValues = FieldValues, PK extends number | string = number | string> = Omit<
  UseDrfQuery<Entity>,
  'queryKey'
> &
  ModelOptions &
  EntityOptions<PK>;

/**
 * Hook for retrieve entity from DRF backend and store in cache.
 * @param args
 */
export function useEntity<Entity extends FieldValues = FieldValues, PK extends number | string = number | string>(
  args: UseEntity<Entity, PK>,
) {
  const { queryKey, primaryKey, endpoint, ...rest } = args;

  return useDrfQuery<Entity>({
    queryKey: queryKey ? getEntityQueryKey(queryKey, primaryKey) : undefined,
    endpoint: `${endpoint}${primaryKey}/`,
    ...rest,
  });
}
