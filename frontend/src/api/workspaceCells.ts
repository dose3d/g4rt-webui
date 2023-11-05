import {
  useDrfCUD,
  useDrfDelete,
  useDrfEntity,
  useDrfEntityForm,
  useDrfList,
  useQueryWrapper,
} from '../drf-crud-client';

export interface Dose3DCellInfo {
  [key: string]: {
    file: string;
    control_point_ids: number[];
    control_point_angles: number[];
    detector_layout: {
      DLayer: number[];
      DRow: number[];
      DCol: number[];
      MLayer: number[];
      CLayer: number[];
    };
  };
}

export interface Dose3DCellPLots {
  [index: string]: {
    file: string;
    plots: string[];
  };
}

export type CellType = 'm' | 'r' | 'd';

export interface WorkspaceCellEntity {
  id: number;
  workspace: number;
  pos: number;
  type: CellType;
  content: string;

  json_info?: Dose3DCellInfo;
  json_plots?: Dose3DCellPLots;
}

const WORKSPACE_CELL_ENDPOINT = {
  api: '/api/',
  resource: 'wsc',
};

export let LatestWorkspaceCreated: number | null = null;
export function useWorkspaceCellCreate(workspace: number, type: CellType, pos = 0, content = '') {
  return useDrfCUD<WorkspaceCellEntity>({
    ...WORKSPACE_CELL_ENDPOINT,
    config: {
      data: { workspace, type, pos, content },
      method: 'POST',
    },
    onSuccess: (ret) => {
      LatestWorkspaceCreated = ret.id;
    },
  });
}

export function useWorkspaceRootCellClone({ id: _id, pos, ...rest }: WorkspaceCellEntity) {
  return useDrfCUD<Partial<WorkspaceCellEntity>>({
    ...WORKSPACE_CELL_ENDPOINT,
    config: {
      method: 'POST',
      data: { pos: pos + 1, ...rest },
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

export function useWorkspaceCellMovePos(primaryKey: number, pos: number) {
  return useDrfCUD<Partial<WorkspaceCellEntity>>({
    ...WORKSPACE_CELL_ENDPOINT,
    primaryKey: primaryKey,
    config: {
      method: 'PATCH',
      data: { pos },
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

export function useWorkspaceCellRootFileDownload(primaryKey: number, CLayer: number, MLayer: number) {
  return useQueryWrapper<ArrayBuffer>({
    endpoint: `/api/wsc/${primaryKey}/download/`,
    queryKey: ['wsc', primaryKey, 'download', CLayer, MLayer],
    config: { responseType: 'arraybuffer', params: { CLayer, MLayer } },
    cacheTime: 24 * 3600000,
    staleTime: 24 * 3600000,
  });
}
