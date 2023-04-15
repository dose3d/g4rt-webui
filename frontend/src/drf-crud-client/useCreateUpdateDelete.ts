import { FieldValues } from 'react-hook-form';
import { ActionOptions, EntityOptions, ModelOptions } from './types';
import { useDrfChange, UseDrfChange } from './useDrfChange';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export type UseCreateUpdateDelete<
  TFieldValues extends FieldValues = FieldValues,
  Request extends FieldValues = TFieldValues,
  PK extends number | string = number | string,
  TContext = undefined,
> = Omit<UseDrfChange<TFieldValues, Request, TContext>, 'mutationKey'> &
  ModelOptions &
  Partial<EntityOptions<PK>> &
  Partial<ActionOptions>;

export function useCreateUpdateDelete<
  TFieldValues extends FieldValues = FieldValues,
  Request extends FieldValues = TFieldValues,
  PK extends number | string = number | string,
  TContext = undefined,
>(params: UseCreateUpdateDelete<TFieldValues, Request, PK, TContext>) {
  const { endpoint, queryKey, primaryKey, action, onSuccess, ...rest } = params;

  const ep = primaryKey ? `${endpoint}${primaryKey}/` : endpoint;
  const ep2 = action ? `${ep}${action}/` : ep;
  const queryClient = useQueryClient();

  const hookOnSuccess = useCallback(
    (data: TFieldValues, values: Request, context?: TContext) => {
      if (queryKey) {
        if (data) {
          queryClient.setQueryData([queryKey, 'entity', primaryKey || data.id], data);
        } else if (primaryKey) {
          queryClient.invalidateQueries({ queryKey: [queryKey, 'entity', primaryKey] }).then();
        } else {
          queryClient.invalidateQueries({ queryKey: [queryKey] }).then();
        }
      }
      if (onSuccess) {
        onSuccess(data, values, context);
      }
    },
    [onSuccess, primaryKey, queryClient, queryKey],
  );

  return useDrfChange<TFieldValues, Request, TContext>({
    mutationKey: queryKey ? [queryKey, primaryKey || 'create'] : undefined,
    endpoint: ep2,
    onSuccess: hookOnSuccess,
    ...rest,
  });
}
