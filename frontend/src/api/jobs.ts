import {
  usePaginated,
  UseFormCreateUpdate,
  useFormCreateUpdate,
  useEntity,
  useCreateUpdateDelete,
} from '../drf-crud-client';

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

const JOB_SETTINGS = {
  endpoint: '/api/jobs/',
  queryKey: 'jobs',
};

export function useJobCreateUpdate(
  params: Omit<UseFormCreateUpdate<JobEntity, number>, 'endpoint' | 'queryKey' | 'axiosInstance'>,
) {
  return useFormCreateUpdate({
    ...JOB_SETTINGS,
    ...params,
  });
}

export function useJobList(pageSize = 10, refetchInterval = 10000) {
  return usePaginated<JobEntityList>({
    ...JOB_SETTINGS,
    refetchInterval,
    pageSize,
  });
}

export function useJobEntity(primaryKey: number, refetchInterval = 0) {
  return useEntity<JobEntity>({ ...JOB_SETTINGS, primaryKey, refetchInterval });
}

export function useJobDelete(primaryKey: number) {
  return useCreateUpdateDelete<JobEntity>({ ...JOB_SETTINGS, primaryKey, method: 'DELETE' });
}

export function useJobKill(primaryKey: number) {
  return useCreateUpdateDelete<JobEntity>({ ...JOB_SETTINGS, primaryKey, action: 'kill', method: 'PUT' });
}
