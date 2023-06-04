import { useEntity, useQueryWrapper } from '../drf-crud-client';
import { JobEntityListItem, JobRootFileEntity } from './jobs';

export interface JobRootFileDetail extends JobRootFileEntity {
  id: number;
  file_name: string;
  size: number;
  href: string;
  job: JobEntityListItem;
}

const JOB_ROOT_SETTINGS = {
  endpoint: '/api/jrf/',
  queryKey: 'jrf',
};

export function useJobRootFileEntity(primaryKey: number, refetchInterval = 0) {
  return useEntity<JobRootFileDetail>({ ...JOB_ROOT_SETTINGS, primaryKey, refetchInterval });
}

export function useJobRootFileDownload(primaryKey: number) {
  return useQueryWrapper<string>({
    endpoint: `/api/jrf/${primaryKey}/download/`,
    queryKey: ['jrf', primaryKey, 'download'],
    config: { responseType: 'arraybuffer' },
    cacheTime: 24 * 3600000,
    staleTime: 24 * 3600000,
  });
}
