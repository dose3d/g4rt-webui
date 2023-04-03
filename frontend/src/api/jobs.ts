import { PaginatedResponse, useBackend, UseBackendParams } from './common';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAxios from '../utils/useAxios';
import { AxiosInstance } from "axios";

export interface JobEntity {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: string;
  is_error: boolean;
}

export function useJobApi(params: Omit<UseBackendParams<JobEntity, JobEntity>, 'endpoint'>) {
  return useBackend({
    endpoint: '/api/jobs/',
    ...params,
  });
}

export function useJobList() {
  const axiosInstance = useAxios();

  const query = useQuery({
    queryKey: ['todos'],
    queryFn: () => (
      axiosInstance.get<PaginatedResponse<JobEntity>>('/api/jobs/').then((res) => res.data)
    ),
  });

  return query;
}
