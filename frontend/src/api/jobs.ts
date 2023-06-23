import {
  usePaginated,
  UseFormCreateUpdate,
  useFormCreateUpdate,
  useCreateUpdateDelete,
  useQueryWrapper,
  useDrfEntity,
} from '../drf-crud-client';

export type JobStatus = 'init' | 'queue' | 'running' | 'done';

export interface JobEntityListItem {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: JobStatus;
  ret_code: number;
  is_error: boolean;
}

export interface JobLogFileEntity {
  id: number;
  file_name: string;
  size: number;
  href: string;
  is_output: boolean;
}

export interface JobRootFileEntity {
  id: number;
  file_name: string;
  size: number;
  href: string;
}

export interface JobEntity extends JobEntityListItem {
  toml: string;
  args: string;

  logs_files: JobLogFileEntity[];
  root_files: JobRootFileEntity[];
}

const JOB_SETTINGS = {
  endpoint: '/api/jobs/',
  queryKey: 'jobs',
};

const JOB_ENDPOINT = {
  api: '/api/',
  resource: 'jobs',
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
  return usePaginated<JobEntityListItem>({
    ...JOB_SETTINGS,
    refetchInterval,
    pageSize,
  });
}

export function useJobEntity(primaryKey: number, refetchInterval = 10000) {
  return useDrfEntity<JobEntity>({ ...JOB_ENDPOINT, primaryKey, refetchInterval });
}

export function useJobDelete(primaryKey: number) {
  return useCreateUpdateDelete<JobEntity>({ ...JOB_SETTINGS, primaryKey, method: 'DELETE' });
}

export function useJobKill(primaryKey: number) {
  return useCreateUpdateDelete<JobEntity>({ ...JOB_SETTINGS, primaryKey, action: 'kill', method: 'PUT' });
}

export function useJobRun(primaryKey: number) {
  return useCreateUpdateDelete<JobEntity>({ ...JOB_SETTINGS, primaryKey, action: 'run', method: 'PUT' });
}

export function useJobRemoveFromQueue(primaryKey: number) {
  return useCreateUpdateDelete<JobEntity>({ ...JOB_SETTINGS, primaryKey, action: 'remove_from_queue', method: 'PUT' });
}

export function useJobOutputLogs(primaryKey: number, refetchInterval = 1000) {
  return useQueryWrapper<string>({
    endpoint: `/api/jobs/${primaryKey}/output/`,
    queryKey: ['jobs', primaryKey, 'output'],
    refetchInterval,
    cacheTime: 24 * 3600000,
    staleTime: 24 * 3600000,
  });
}

export const JOB_STATUS_NAME: { [key in JobStatus]: string } = {
  init: 'new',
  queue: 'queue',
  running: 'running',
  done: 'done',
};
