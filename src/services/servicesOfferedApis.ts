import { api, type ApiListResponse } from '../config/api';

export interface ServiceOfferedOption {
  id: string;
  name: string;
}

export function getServicesOffered(): Promise<ApiListResponse<ServiceOfferedOption>> {
  return api.get<ApiListResponse<ServiceOfferedOption>>('/service/services');
}
