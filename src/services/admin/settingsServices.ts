import { api, type ApiMessageResponse } from '../../config/api';

/* ---------- event types & protein options ---------- */

export interface CatalogueItem {
  id: string;
  name: string;
  description: string;
  /** Protein options only. */
  proteinImage: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CatalogueInput {
  name: string;
  description: string;
  isActive: boolean;
  /** Protein options only: a new picture to upload. */
  proteinImage?: File | null;
}

export type CatalogueKind = 'event-types' | 'protein-options';

const mapItem = (raw: Partial<CatalogueItem> & {id: string;}): CatalogueItem => ({
  id: raw.id,
  name: raw.name ?? '',
  description: raw.description ?? '',
  proteinImage: raw.proteinImage || null,
  isActive: raw.isActive !== false,
  createdAt: raw.createdAt ?? ''
});

/** Newest first. */
export async function listCatalogue(kind: CatalogueKind): Promise<CatalogueItem[]> {
  const res = await api.get<{success: boolean;payload: CatalogueItem[];}>(`/settings/${kind}`);
  return res.payload.map(mapItem);
}

/** Protein options are sent as a form so a picture can go with them (compressed on upload). */
const toBody = (kind: CatalogueKind, input: CatalogueInput) => {
  if (kind !== 'protein-options') {
    const { proteinImage: _ignored, ...rest } = input;
    return rest;
  }
  const form = new FormData();
  form.append('name', input.name);
  form.append('description', input.description);
  form.append('isActive', String(input.isActive));
  if (input.proteinImage) form.append('proteinImage', input.proteinImage);
  return form;
};

export async function createCatalogueItem(kind: CatalogueKind, input: CatalogueInput): Promise<CatalogueItem> {
  const res = await api.post<{success: boolean;payload: CatalogueItem;}>(`/settings/${kind}`, toBody(kind, input));
  return mapItem(res.payload);
}

export async function updateCatalogueItem(kind: CatalogueKind, id: string, input: CatalogueInput): Promise<CatalogueItem> {
  const res = await api.put<{success: boolean;payload: CatalogueItem;}>(`/settings/${kind}/${id}`, toBody(kind, input));
  return mapItem(res.payload);
}

export function deleteCatalogueItem(kind: CatalogueKind, id: string): Promise<ApiMessageResponse> {
  return api.delete<ApiMessageResponse>(`/settings/${kind}/${id}`);
}

/* ---------- service rates ---------- */

export interface ServiceRate {
  id: string;
  serviceId: string;
  serviceName: string;
  minGuests: number;
  /** null = open-ended (e.g. 51+). */
  maxGuests: number | null;
  /** "quoted": no set price — the customer discusses it with the admin. */
  pricingType: 'fixed' | 'quoted';
  /** null when quoted. */
  ratePerStaff: number | null;
  isActive: boolean;
}

export interface ServiceRateInput {
  serviceId: string;
  minGuests: number;
  maxGuests: number | null;
  pricingType: 'fixed' | 'quoted';
  ratePerStaff: number | null;
  isActive: boolean;
}

interface RawServiceRate {
  id: string;
  serviceId: string | {id?: string;_id?: string;name?: string;} | null;
  minGuests: number;
  maxGuests?: number | null;
  pricingType?: 'fixed' | 'quoted';
  ratePerStaff?: number | null;
  isActive?: boolean;
}

const mapRate = (raw: RawServiceRate): ServiceRate => {
  const svc = raw.serviceId;
  return {
    id: raw.id,
    serviceId: typeof svc === 'string' ? svc : svc?.id ?? svc?._id ?? '',
    serviceName: typeof svc === 'object' && svc ? svc.name ?? '' : '',
    minGuests: Number(raw.minGuests),
    maxGuests: raw.maxGuests == null ? null : Number(raw.maxGuests),
    pricingType: raw.pricingType === 'quoted' ? 'quoted' : 'fixed',
    ratePerStaff: raw.pricingType === 'quoted' || raw.ratePerStaff == null ? null : Number(raw.ratePerStaff),
    isActive: raw.isActive !== false
  };
};

export const guestRangeLabel = (r: Pick<ServiceRate, 'minGuests' | 'maxGuests'>) =>
r.maxGuests == null ? `${r.minGuests}+ guests` : `${r.minGuests} – ${r.maxGuests} guests`;

export async function listServiceRates(): Promise<ServiceRate[]> {
  const res = await api.get<{success: boolean;payload: RawServiceRate[];}>('/settings/service-rates');
  return res.payload.map(mapRate);
}

export async function createServiceRate(input: ServiceRateInput): Promise<ServiceRate> {
  const res = await api.post<{success: boolean;payload: RawServiceRate;}>('/settings/service-rates', input);
  return mapRate(res.payload);
}

export async function updateServiceRate(id: string, input: ServiceRateInput): Promise<ServiceRate> {
  const res = await api.put<{success: boolean;payload: RawServiceRate;}>(`/settings/service-rates/${id}`, input);
  return mapRate(res.payload);
}

export function deleteServiceRate(id: string): Promise<ApiMessageResponse> {
  return api.delete<ApiMessageResponse>(`/settings/service-rates/${id}`);
}
