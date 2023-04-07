import { PaginatedResponse, useBackend, UseBackendParams } from './common';
import { useQuery } from '@tanstack/react-query';
import useAxios from '../utils/useAxios';

export interface JobEntity {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: string;
  is_error: boolean;

  toml: string;
  args: string;
}

export function useJobApi(params: Omit<UseBackendParams<JobEntity, JobEntity>, 'endpoint'>) {
  return useBackend({
    endpoint: '/api/jobs/',
    mutationKey: ['jobs'],
    ...params,
  });
}

export function useJobList() {
  const axiosInstance = useAxios();

  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => axiosInstance.get<PaginatedResponse<JobEntity>>('/api/jobs/').then((res) => res.data),
  });
}
