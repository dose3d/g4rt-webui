import { useBackend, UseBackendParams } from "./common";

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
