import { useDrfCUD, useDrfEntity, useDrfList, useQueryWrapper } from '../drf-crud-client';
import { JobEntity, JobEntityListItem, JobRootFileEntity } from './jobs';

export interface JobRootFileDetail extends JobRootFileEntity {
  id: number;
  file_name: string;
  size: number;
  href: string;
  job: JobEntityListItem;
}

const JOB_ROOT_ENDPOINT = {
  api: '/api/',
  resource: 'jrf',
};

export function useJobRootFileList() {
  return useDrfList<JobRootFileDetail>({
    ...JOB_ROOT_ENDPOINT,
  });
}

export function useJobRootFileEntity(primaryKey: number, refetchInterval = 0) {
  return useDrfEntity<JobRootFileDetail>({ ...JOB_ROOT_ENDPOINT, primaryKey, refetchInterval });
}

export function useJobRootFileDownload(primaryKey: number) {
  return useQueryWrapper<ArrayBuffer>({
    endpoint: `/api/jrf/${primaryKey}/download/`,
    queryKey: ['jrf', primaryKey, 'download'],
    config: { responseType: 'arraybuffer' },
    cacheTime: 24 * 3600000,
    staleTime: 24 * 3600000,
  });
}

export function useJobRootFileRender(primaryKey: number) {
  return useDrfCUD<JobEntity>({ ...JOB_ROOT_ENDPOINT, primaryKey, action: 'render' });
}
