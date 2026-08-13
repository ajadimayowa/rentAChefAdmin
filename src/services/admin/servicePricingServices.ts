import { api } from '../../config/api';

export type PricingType = 'daybased' | 'levelbased';

export interface ServicePricingOption {
  name: string;
  price: number;
  description?: string;
}

interface RawNamedRef {
  id: string;
  name?: string;
  title?: string;
  description?: string;
}

interface RawServicePricing {
  id: string;
  serviceId?: RawNamedRef;
  specialServiceId?: RawNamedRef;
  chefCategoryId: RawNamedRef;
  pricingType: PricingType;
  numberOfDays?: number;
  monthlySubFee?: number;
  description?: string;
  basePriceMinor: number;
  currency: 'NGN';
  servicePricingOptions: ServicePricingOption[];
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminServicePricing {
  id: string;
  target: {type: 'service' | 'specialService';id: string;name: string;};
  chefCategory: {id: string;name: string;};
  pricingType: PricingType;
  numberOfDays?: number;
  monthlySubFee?: number;
  description?: string;
  basePrice: number;
  servicePricingOptions: ServicePricingOption[];
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
}

function mapServicePricing(raw: RawServicePricing): AdminServicePricing {
  const target = raw.serviceId ?
  { type: 'service' as const, id: raw.serviceId.id, name: raw.serviceId.name || '—' } :
  {
    type: 'specialService' as const,
    id: raw.specialServiceId?.id || '',
    name: raw.specialServiceId?.title || '—'
  };

  return {
    id: raw.id,
    target,
    chefCategory: { id: raw.chefCategoryId?.id, name: raw.chefCategoryId?.name || '—' },
    pricingType: raw.pricingType,
    numberOfDays: raw.numberOfDays,
    monthlySubFee: raw.monthlySubFee,
    description: raw.description,
    basePrice: raw.basePriceMinor / 100,
    servicePricingOptions: raw.servicePricingOptions ?? [],
    effectiveFrom: raw.effectiveFrom,
    effectiveTo: raw.effectiveTo,
    isActive: raw.isActive,
    createdAt: raw.createdAt
  };
}

export async function listAdminServicePricing(): Promise<AdminServicePricing[]> {
  const res = await api.get<{success: boolean;data: RawServicePricing[];}>('/servicePricings');
  return res.data.map(mapServicePricing);
}

export interface ServicePricingInput {
  targetType: 'service' | 'specialService';
  serviceId?: string;
  specialServiceId?: string;
  chefCategoryId: string;
  pricingType: PricingType;
  numberOfDays?: number;
  monthlySubFee?: number;
  description?: string;
  basePrice: number;
  servicePricingOptions: ServicePricingOption[];
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

function toRequestBody(input: ServicePricingInput) {
  return {
    serviceId: input.targetType === 'service' ? input.serviceId : null,
    specialServiceId: input.targetType === 'specialService' ? input.specialServiceId : null,
    chefCategoryId: input.chefCategoryId,
    pricingType: input.pricingType,
    numberOfDays: input.pricingType === 'daybased' ? input.numberOfDays : undefined,
    monthlySubFee: input.pricingType === 'daybased' ? input.monthlySubFee : undefined,
    description: input.description || undefined,
    basePriceMinor: Math.round(input.basePrice * 100),
    currency: 'NGN',
    servicePricingOptions: input.servicePricingOptions,
    effectiveFrom: input.effectiveFrom,
    effectiveTo: input.effectiveTo || undefined,
    isActive: input.isActive
  };
}

export async function createAdminServicePricing(input: ServicePricingInput): Promise<AdminServicePricing> {
  const res = await api.post<{success: boolean;data: RawServicePricing;}>('/servicePricing/create', toRequestBody(input));
  return mapServicePricing(res.data);
}

export async function updateAdminServicePricing(
id: string,
input: ServicePricingInput)
: Promise<AdminServicePricing> {
  const res = await api.put<{success: boolean;data: RawServicePricing;}>(`/servicePricing/${id}`, toRequestBody(input));
  return mapServicePricing(res.data);
}

export function deleteAdminServicePricing(id: string): Promise<{success: boolean;}> {
  return api.delete<{success: boolean;}>(`/servicePricing/${id}`);
}

export interface ChefCategoryOption {
  id: string;
  name: string;
}

export async function listChefCategories(): Promise<ChefCategoryOption[]> {
  const res = await api.get<{success: boolean;payload: {id: string;name: string;}[];}>('/category/categories');
  return res.payload.map((c) => ({ id: c.id, name: c.name }));
}

export interface SpecialServiceOption {
  id: string;
  title: string;
}

export async function listSpecialServices(): Promise<SpecialServiceOption[]> {
  const res = await api.get<{success: boolean;payload: {id: string;title: string;}[];}>('/specialmenu/menus?limit=200');
  return res.payload.map((s) => ({ id: s.id, title: s.title }));
}
