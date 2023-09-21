import { useDrfCUD, useDrfDelete, useDrfEntity, useDrfEntityForm, useDrfList } from '../drf-crud-client';

export type CellType = 'm' | 'r' | 'd';

export interface WorkspaceCellEntity {
  id: number;
  workspace: number;
  pos: number;
  type: CellType;
  content: string;
}

const WORKSPACE_CELL_ENDPOINT = {
  api: '/api/',
  resource: 'wsc',
};

export function useWorkspaceCellCAddNew(workspace: number, type: CellType) {
  return useDrfCUD({
    ...WORKSPACE_CELL_ENDPOINT,
    config: {
      data: { workspace, type, content: JSON.stringify({ fileId: 0, path: '', height: 400 }) },
      method: 'POST',
    },
  });
}

export function useWorkspaceRootCellUpdate(data: WorkspaceCellEntity) {
  return useDrfCUD<Partial<WorkspaceCellEntity>>({
    ...WORKSPACE_CELL_ENDPOINT,
    primaryKey: data.id,
    config: {
      method: 'PUT',
      data,
    },
  });
}

export function useWorkspaceCellForm(cell: WorkspaceCellEntity) {
  return useDrfEntityForm({
    ...WORKSPACE_CELL_ENDPOINT,
    primaryKey: cell.id,
    config: { data: { workspace: cell.workspace } },
    formProps: { defaultValues: cell, mode: 'onBlur' },
  });
}

export function useWorkspaceCellList(workspace: number) {
  return useDrfList<WorkspaceCellEntity>({
    ...WORKSPACE_CELL_ENDPOINT,
    config: { params: { workspace } },
  });
}

export function useWorkspaceCellEntity(primaryKey: number) {
  return useDrfEntity<WorkspaceCellEntity>({ ...WORKSPACE_CELL_ENDPOINT, primaryKey });
}

export function useWorkspaceCellDelete(primaryKey: number) {
  return useDrfDelete({ ...WORKSPACE_CELL_ENDPOINT, primaryKey });
}
