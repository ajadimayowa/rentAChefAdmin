import { api, type ApiItemResponse, type ApiListResponse, type ApiMessageResponse } from '../../config/api';

export interface ServiceTerm {
  id: string;
  description: string;
  termsUrl?: string;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
}

interface RawServiceTerm {
  id: string;
  description: string;
  termsUrl?: string;
  serviceId?: { id: string; name: string } | string;
  createdAt?: string;
  updatedAt?: string;
}

function mapServiceTerm(raw: RawServiceTerm): ServiceTerm {
  const serviceId = typeof raw.serviceId === 'object' && raw.serviceId !== null ? raw.serviceId.id : raw.serviceId ?? '';
  return {
    id: raw.id,
    description: raw.description ?? '',
    termsUrl: raw.termsUrl || undefined,
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
description: string,
termsUrl?: string)
: Promise<ApiItemResponse<ServiceTerm>> {
  const res = await api.post<{success: boolean;payload: RawServiceTerm;}>('/terms-and-con/create', {
    serviceId,
    description,
    termsUrl: termsUrl || ''
  });
  return { success: res.success, message: '', payload: mapServiceTerm(res.payload) };
}

export async function updateServiceTerm(
id: string,
description: string,
termsUrl?: string)
: Promise<ApiItemResponse<ServiceTerm>> {
  const res = await api.put<{success: boolean;payload: RawServiceTerm;}>(`/terms-and-con/${id}`, {
    description,
    termsUrl: termsUrl || ''
  });
  return { success: res.success, message: '', payload: mapServiceTerm(res.payload) };
}

export function deleteServiceTerm(id: string): Promise<ApiMessageResponse> {
  return api.delete<ApiMessageResponse>(`/terms-and-con/${id}`);
}

/**
 * General-purpose terms & conditions — a clause attaches to a Service, a
 * ServiceCategory, or a SpecialMenu (never more than one in practice, though the
 * schema allows it). Unlike ServiceTerm above, this isn't scoped to one service.
 */
export type TermsTargetType = 'service' | 'category' | 'specialMenu';

interface RawTermsAndConTarget {
  id: string;
  name?: string;
  title?: string;
}

interface RawTermsAndCon {
  id: string;
  description: string;
  termsUrl?: string;
  serviceId?: RawTermsAndConTarget | string | null;
  categoryId?: RawTermsAndConTarget | string | null;
  specialMenuId?: RawTermsAndConTarget | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TermsAndConRecord {
  id: string;
  description: string;
  termsUrl?: string;
  targetType: TermsTargetType | null;
  targetId: string;
  targetName: string;
  createdAt: string;
  updatedAt: string;
}

function mapTermsAndCon(raw: RawTermsAndCon): TermsAndConRecord {
  const target = (
  ref: RawTermsAndConTarget | string | null | undefined,
  type: TermsTargetType,
  nameKey: 'name' | 'title')
  : TermsAndConRecord | null => {
    if (!ref) return null;
    return {
      id: raw.id,
      description: raw.description ?? '',
      termsUrl: raw.termsUrl || undefined,
      targetType: type,
      targetId: typeof ref === 'object' ? ref.id : ref,
      targetName: typeof ref === 'object' ? ref[nameKey] ?? '—' : '—',
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    };
  };

  return (
    target(raw.serviceId, 'service', 'name') ??
    target(raw.categoryId, 'category', 'name') ??
    target(raw.specialMenuId, 'specialMenu', 'title') ?? {
      id: raw.id,
      description: raw.description ?? '',
      termsUrl: raw.termsUrl || undefined,
      targetType: null,
      targetId: '',
      targetName: '—',
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    });

}

export interface TermsAndConListParams {
  serviceId?: string;
  categoryId?: string;
  specialMenuId?: string;
  page?: number;
  limit?: number;
}

function toTermsQueryString(params?: TermsAndConListParams): string {
  const entries = Object.entries(params ?? {}).filter(
    (entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== ''
  );
  return entries.length ?
  `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()}` :
  '';
}

export interface TermsAndConListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TermsAndConListResult {
  data: TermsAndConRecord[];
  meta: TermsAndConListMeta;
}

export async function listTermsAndCons(params?: TermsAndConListParams): Promise<TermsAndConListResult> {
  const res = await api.get<{success: boolean;payload: RawTermsAndCon[];meta: TermsAndConListMeta;}>(
    `/terms-and-con/records${toTermsQueryString(params)}`
  );
  return { data: res.payload.map(mapTermsAndCon), meta: res.meta };
}

export interface TermsAndConInput {
  description: string;
  termsUrl?: string;
  serviceId?: string | null;
  categoryId?: string | null;
  specialMenuId?: string | null;
}

/** Create/update responses come back unpopulated (bare ids) — reload the list to see target names. */
export async function createTermsAndCon(input: TermsAndConInput): Promise<TermsAndConRecord> {
  const res = await api.post<{success: boolean;payload: RawTermsAndCon;}>('/terms-and-con/create', input);
  return mapTermsAndCon(res.payload);
}

export async function updateTermsAndCon(id: string, input: TermsAndConInput): Promise<TermsAndConRecord> {
  const res = await api.put<{success: boolean;payload: RawTermsAndCon;}>(`/terms-and-con/${id}`, input);
  return mapTermsAndCon(res.payload);
}

export const deleteTermsAndCon = deleteServiceTerm;
