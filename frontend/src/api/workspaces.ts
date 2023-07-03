import {
  useDrfDelete,
  useDrfEntity,
  useDrfEntityForm,
  UseDrfEntityForm,
  useDrfPaginatedControlled,
} from '../drf-crud-client';

export interface WorkspaceEntity {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const WORKSPACE_ENDPOINT = {
  api: '/api/',
  resource: 'ws',
};

export function useWorkspaceForm(
  params: Omit<UseDrfEntityForm<WorkspaceEntity, number>, keyof typeof WORKSPACE_ENDPOINT>,
) {
  return useDrfEntityForm({
    ...WORKSPACE_ENDPOINT,
    ...params,
  });
}

export function useWorkspaceList(pageSize = 10, refetchInterval = 10000) {
  return useDrfPaginatedControlled<WorkspaceEntity>({
    ...WORKSPACE_ENDPOINT,
    refetchInterval,
    pageSize,
  });
}

export function useWorkspaceEntity(primaryKey: number, refetchInterval = 10000) {
  return useDrfEntity<WorkspaceEntity>({ ...WORKSPACE_ENDPOINT, primaryKey, refetchInterval });
}

export function useWorkspaceDelete(primaryKey: number) {
  return useDrfDelete({ ...WORKSPACE_ENDPOINT, primaryKey });
}
