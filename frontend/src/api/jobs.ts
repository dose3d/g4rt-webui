import { useCreateUpdate, UseBackendParamsBase, useSelect, useEntity } from './common';

export interface JobEntityList {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: string;
  ret_code: number;
  is_error: boolean;
}

export interface JobRootFileEntity {
  id: number;
  file_name: string;
  size: number;
  href: string;
}

export interface JobEntity extends JobEntityList {
  toml: string;
  args: string;

  logs_href: string;
  root_files: JobRootFileEntity[];
}

export function useJobCreateUpdate(params: Omit<UseBackendParamsBase<JobEntity, JobEntity>, 'endpoint'>) {
  return useCreateUpdate({
    endpoint: '/api/jobs/',
    queryKey: 'jobs',
    ...params,
  });
}

export function useJobList(refetchInterval = 10000) {
  return useSelect<JobEntityList>({ queryKey: 'jobs', endpoint: '/api/jobs/', refetchInterval });
}

export function useJobEntity(primaryKey: number, refetchInterval = 10000) {
  return useEntity<JobEntity>({ queryKey: 'jobs', endpoint: '/api/jobs/', primaryKey, refetchInterval });
}
