import {
  useDrfDelete,
  useDrfEntityForm,
  UseDrfEntityForm,
  useDrfList,
  useDrfPaginatedControlled, useQueryWrapper
} from "../drf-crud-client";

export interface RootFileEntity {
  id: number;
  title: string;
  description: string;
  href: string;
  uploaded_file: number;
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

export function useRootFileListForSelect() {
  return useDrfList<RootFileEntity>({
    ...ROOT_ENDPOINT,
    action: 'list'
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

export function useRootFileDownload(primaryKey: string)   {
  let endpoint;
  let queryKey;
  let pk;

  if (primaryKey.startsWith('r')) {
    pk = primaryKey.substring(1);
    endpoint = `/api/rf/${pk}/download/`;
    queryKey = ['rf', pk, 'download'];
  } else {
    pk = primaryKey;
    endpoint = `/api/jrf/${pk}/download/`;
    queryKey = ['jrf', pk, 'download'];
  }

  return useQueryWrapper<ArrayBuffer>({
    endpoint: endpoint,
    queryKey: queryKey,
    config: { responseType: 'arraybuffer' },
    cacheTime: 24 * 3600000,
    staleTime: 24 * 3600000,
  });
}
