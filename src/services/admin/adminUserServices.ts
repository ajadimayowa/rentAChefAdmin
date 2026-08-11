import { api, type ApiItemResponse, type ApiListResponse, type ApiMessageResponse } from '../../config/api';
import type { Admin, AdminRole } from '../../types';

export interface AdminCreateInput {
  fullName: string;
  email: string;
  password: string;
  role: AdminRole;
}

export interface AdminUpdateInput {
  fullName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
}

export function listAdmins(): Promise<ApiListResponse<Admin>> {
  return api.get<ApiListResponse<Admin>>('/admin/admins?limit=100');
}

export function getAdmin(id: string): Promise<ApiItemResponse<Admin>> {
  return api.get<ApiItemResponse<Admin>>(`/admin/${id}`);
}

export function createAdmin(input: AdminCreateInput): Promise<ApiItemResponse<Admin>> {
  return api.post<ApiItemResponse<Admin>>('/admin/create', input);
}

export function updateAdmin(id: string, input: AdminUpdateInput): Promise<ApiItemResponse<Admin>> {
  return api.put<ApiItemResponse<Admin>>(`/admin/${id}`, input);
}

export function deleteAdmin(id: string): Promise<ApiMessageResponse> {
  return api.delete<ApiMessageResponse>(`/admin/${id}`);
}
