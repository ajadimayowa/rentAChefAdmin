import { api, type ApiMessageResponse } from '../../config/api';

export type FeeType = 'fixed' | 'percentage';

export interface Fee {
  id: string;
  name: string;
  description: string;
  type: FeeType;
  /** Naira for a fixed fee; 0–100 for a percentage. */
  value: number;
  isActive: boolean;
  /** Services this fee is charged on. */
  services: {id: string;name: string;}[];
  createdAt: string;
  updatedAt: string;
}

export interface FeeInput {
  name: string;
  description: string;
  type: FeeType;
  value: number;
  isActive: boolean;
  serviceIds: string[];
}

type RawServiceRef = string | {id?: string;_id?: string;name?: string;} | null;

interface RawFee extends Partial<Omit<Fee, 'services'>> {
  id: string;
  serviceIds?: RawServiceRef[];
}

const mapServiceRef = (ref: RawServiceRef): {id: string;name: string;} | null => {
  if (!ref) return null; // the service was deleted
  if (typeof ref === 'string') return { id: ref, name: '' };
  const id = ref.id ?? ref._id;
  return id ? { id, name: ref.name ?? '' } : null;
};

const mapFee = (raw: RawFee): Fee => ({
  id: raw.id,
  name: raw.name ?? '',
  description: raw.description ?? '',
  type: raw.type === 'percentage' ? 'percentage' : 'fixed',
  value: Number(raw.value ?? 0),
  isActive: raw.isActive !== false,
  services: (raw.serviceIds ?? []).map(mapServiceRef).filter((s): s is {id: string;name: string;} => s !== null),
  createdAt: raw.createdAt ?? '',
  updatedAt: raw.updatedAt ?? ''
});

/** Newest first. */
export async function listFees(): Promise<Fee[]> {
  const res = await api.get<{success: boolean;payload: RawFee[];}>('/fees');
  return res.payload.map(mapFee);
}

export async function createFee(input: FeeInput): Promise<Fee> {
  const res = await api.post<{success: boolean;payload: RawFee;}>('/fees', input);
  return mapFee(res.payload);
}

export async function updateFee(id: string, input: Partial<FeeInput>): Promise<Fee> {
  const res = await api.put<{success: boolean;payload: RawFee;}>(`/fees/${id}`, input);
  return mapFee(res.payload);
}

export function deleteFee(id: string): Promise<ApiMessageResponse> {
  return api.delete<ApiMessageResponse>(`/fees/${id}`);
}
