import { api, type ApiItemResponse, type ApiListResponse, type ApiMessageResponse } from '../../config/api';

export interface ServiceTerm {
  id: string;
  description: string;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
}

interface RawServiceTerm {
  id: string;
  description: string;
  serviceId?: { id: string; name: string } | string;
  createdAt?: string;
  updatedAt?: string;
}

function mapServiceTerm(raw: RawServiceTerm): ServiceTerm {
  const serviceId = typeof raw.serviceId === 'object' && raw.serviceId !== null ? raw.serviceId.id : raw.serviceId ?? '';
  return {
    id: raw.id,
    description: raw.description ?? '',
    serviceId,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString()
  };
}

export async function listServiceTerms(serviceId: string): Promise<ApiListResponse<ServiceTerm>> {
  const res = await api.get<{success: boolean;payload: RawServiceTerm[];}>(
    `/terms-and-con/records?serviceId=${encodeURIComponent(serviceId)}&limit=200`
  );
  return { success: res.success, message: '', payload: res.payload.map(mapServiceTerm) };
}

export async function createServiceTerm(
serviceId: string,
description: string)
: Promise<ApiItemResponse<ServiceTerm>> {
  const res = await api.post<{success: boolean;payload: RawServiceTerm;}>('/terms-and-con/create', {
    serviceId,
    description
  });
  return { success: res.success, message: '', payload: mapServiceTerm(res.payload) };
}

export async function updateServiceTerm(
id: string,
description: string)
: Promise<ApiItemResponse<ServiceTerm>> {
  const res = await api.put<{success: boolean;payload: RawServiceTerm;}>(`/terms-and-con/${id}`, { description });
  return { success: res.success, message: '', payload: mapServiceTerm(res.payload) };
}

export function deleteServiceTerm(id: string): Promise<ApiMessageResponse> {
  return api.delete<ApiMessageResponse>(`/terms-and-con/${id}`);
}
