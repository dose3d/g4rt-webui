import {
  useQueryWrapper,
  useDrfEntity,
  useDrfPaginatedControlled,
  useDrfDelete,
  useDrfEntityForm,
  UseDrfEntityForm,
  useDrfCUD,
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
  display: string;
  size: number;
  href: string;
  is_output: boolean;
}

export interface JobRootFileEntity {
  id: number;
  file_name: string;
  display: string;
  size: number;
  href: string;
}

export interface JobEntity extends JobEntityListItem {
  toml: string;
  args: string;

  logs_files: JobLogFileEntity[];
  root_files: JobRootFileEntity[];
}

const JOB_ENDPOINT = {
  api: '/api/',
  resource: 'jobs',
};

export function useJobForm(params: Omit<UseDrfEntityForm<JobEntity, number>, keyof typeof JOB_ENDPOINT>) {
  return useDrfEntityForm({
    ...JOB_ENDPOINT,
    ...params,
  });
}

export function useJobList(pageSize = 10, refetchInterval = 10000) {
  return useDrfPaginatedControlled<JobEntityListItem>({
    ...JOB_ENDPOINT,
    refetchInterval,
    pageSize,
  });
}

export function useJobEntity(primaryKey: number, refetchInterval = 10000) {
  return useDrfEntity<JobEntity>({ ...JOB_ENDPOINT, primaryKey, refetchInterval });
}

export function useJobDelete(primaryKey: number) {
  return useDrfDelete({ ...JOB_ENDPOINT, primaryKey });
}

export function useJobKill(primaryKey: number) {
  return useDrfCUD<JobEntity>({ ...JOB_ENDPOINT, primaryKey, action: 'kill' });
}

export function useJobRun(primaryKey: number) {
  return useDrfCUD<JobEntity>({ ...JOB_ENDPOINT, primaryKey, action: 'run' });
}

export function useJobRemoveFromQueue(primaryKey: number) {
  return useDrfCUD<JobEntity>({ ...JOB_ENDPOINT, primaryKey, action: 'remove_from_queue' });
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
