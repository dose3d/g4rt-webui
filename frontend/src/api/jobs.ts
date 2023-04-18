import { useDelete, useAction } from './common';
import {
  usePaginated,
  useEntity,
  UseFormCreateUpdate,
  useFormCreateUpdate,
  useSimpleJwtAxios,
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

export function useJobCreateUpdate(
  params: Omit<UseFormCreateUpdate<JobEntity, number>, 'endpoint' | 'queryKey' | 'axiosInstance'>,
) {
  const axiosInstance = useSimpleJwtAxios();
  return useFormCreateUpdate({
    endpoint: '/api/jobs/',
    queryKey: 'jobs',
    axiosInstance,
    ...params,
  });
}

export function useJobList(pageSize = 10, refetchInterval = 10000) {
  const axiosInstance = useSimpleJwtAxios();

  return usePaginated<JobEntityList>({
    queryKey: 'jobs',
    endpoint: '/api/jobs/',
    refetchInterval,
    pageSize,
    axiosInstance,
  });
}

export function useJobEntity(primaryKey: number, refetchInterval = 10000) {
  const axiosInstance = useSimpleJwtAxios();
  return useEntity<JobEntity>({ queryKey: 'jobs', endpoint: '/api/jobs/', primaryKey, refetchInterval, axiosInstance });
}

export function useJobDelete(primaryKey: number) {
  return useDelete<JobEntity>({ queryKey: 'jobs', endpoint: '/api/jobs/', primaryKey });
}

export function useJobAction(primaryKey: number, action: string) {
  return useAction<JobEntity>({ queryKey: 'jobs', endpoint: '/api/jobs/', primaryKey, action });
}
