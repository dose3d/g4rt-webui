import { useCreateUpdate, UseBackendParamsBase, useDelete, useAction } from './common';
import { usePaginated, useEntity } from '../drf-crud-client';
import useAxios from '../utils/useAxios';

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

export function useJobCreateUpdate(params: UseBackendParamsBase<JobEntity, JobEntity>) {
  return useCreateUpdate({
    endpoint: '/api/jobs/',
    queryKey: 'jobs',
    ...params,
  });
}

export function useJobList(pageSize = 10, refetchInterval = 10000) {
  const axiosInstance = useAxios();

  return usePaginated<JobEntityList>({
    queryKey: 'jobs',
    endpoint: '/api/jobs/',
    refetchInterval,
    pageSize,
    axiosInstance,
  });
}

export function useJobEntity(primaryKey: number, refetchInterval = 10000) {
  const axiosInstance = useAxios();
  return useEntity<JobEntity>({ queryKey: 'jobs', endpoint: '/api/jobs/', primaryKey, refetchInterval, axiosInstance });
}

export function useJobDelete(primaryKey: number) {
  return useDelete<JobEntity>({ queryKey: 'jobs', endpoint: '/api/jobs/', primaryKey });
}

export function useJobAction(primaryKey: number, action: string) {
  return useAction<JobEntity>({ queryKey: 'jobs', endpoint: '/api/jobs/', primaryKey, action });
}
