import { FieldValues } from 'react-hook-form';
import { ActionOptions, EntityOptions, ModelOptions } from './types';
import { useDrfMutation, UseDrfMutation } from './useDrfMutation';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export type UseCreateUpdateDelete<
  Request extends FieldValues = FieldValues,
  PK extends number | string = number | string,
  Response extends FieldValues = Request,
  TContext = undefined,
> = Omit<UseDrfMutation<Request, Response, TContext>, 'mutationKey'> &
  ModelOptions &
  Partial<EntityOptions<PK>> &
  Partial<ActionOptions>;

export function useCreateUpdateDelete<
  Request extends FieldValues = FieldValues,
  PK extends number | string = number | string,
  Response extends FieldValues = Request,
  TContext = undefined,
>(params: UseCreateUpdateDelete<Request, PK, Response, TContext>) {
  const { endpoint, queryKey, primaryKey, action, onSuccess, ...rest } = params;

  const ep = primaryKey ? `${endpoint}${primaryKey}/` : endpoint;
  const ep2 = action ? `${ep}${action}/` : ep;
  const queryClient = useQueryClient();

  const hookOnSuccess = useCallback(
    (data: Response, values: Request, context?: TContext) => {
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

  return useDrfMutation<Request, Response, TContext>({
    mutationKey: queryKey ? [queryKey, primaryKey || 'create'] : undefined,
    endpoint: ep2,
    onSuccess: hookOnSuccess,
    ...rest,
  });
}
