import { useDrfDelete, useDrfEntityForm, UseDrfEntityForm, useDrfPaginatedControlled } from '../drf-crud-client';

export interface RootFileEntity {
  id: number;
  title: string;
  description: string;
  href: string;
}

const ROOT_ENDPOINT = {
  api: '/api/',
  resource: 'rf',
};

export function useRootFileList(pageSize = 10, refetchInterval = 10000) {
  return useDrfPaginatedControlled<RootFileEntity>({
    ...ROOT_ENDPOINT,
    refetchInterval,
    pageSize,
  });
}

export function useRootFileForm(params: Omit<UseDrfEntityForm<RootFileEntity, number>, keyof typeof ROOT_ENDPOINT>) {
  return useDrfEntityForm({
    ...ROOT_ENDPOINT,
    ...params,
  });
}

export function useRootFileDelete(primaryKey: number) {
  return useDrfDelete({ ...ROOT_ENDPOINT, primaryKey });
}
