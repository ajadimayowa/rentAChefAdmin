import { api } from '../../config/api';

export interface PackageServiceRef {
  id: string;
  name: string;
}

export interface PackageMenuRef {
  id: string;
  title: string;
}

interface RawPackage {
  id: string;
  title: string;
  description: string;
  packageImage?: string;
  price: number;
  durationHours: number;
  guests: number;
  perks: string[];
  isActive: boolean;
  serviceIds: PackageServiceRef[];
  menus: PackageMenuRef[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminPackage {
  id: string;
  title: string;
  description: string;
  packageImage?: string;
  price: number;
  durationHours: number;
  guests: number;
  perks: string[];
  isActive: boolean;
  services: PackageServiceRef[];
  menus: PackageMenuRef[];
  createdAt: string;
  updatedAt: string;
}

function mapPackage(raw: RawPackage): AdminPackage {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    packageImage: raw.packageImage,
    price: raw.price,
    durationHours: raw.durationHours,
    guests: raw.guests,
    perks: raw.perks ?? [],
    isActive: raw.isActive,
    services: (raw.serviceIds ?? []).map((s) => ({ id: s.id, name: s.name })),
    menus: (raw.menus ?? []).map((m) => ({ id: m.id, title: m.title })),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
}

export async function listAdminPackages(): Promise<AdminPackage[]> {
  const res = await api.get<{success: boolean;data: RawPackage[];}>('/packages');
  return res.data.map(mapPackage);
}

export interface PackageInput {
  title: string;
  description: string;
  price: number;
  durationHours: number;
  guests: number;
  perks: string[];
  isActive: boolean;
  serviceIds: string[];
  menus: string[];
  packageImage?: File | null;
}

function toPackageFormData(input: PackageInput): FormData {
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('description', input.description);
  formData.append('price', String(input.price));
  formData.append('durationHours', String(input.durationHours));
  formData.append('guests', String(input.guests));
  formData.append('isActive', String(input.isActive));
  input.perks.forEach((perk) => formData.append('perks', perk));
  input.serviceIds.forEach((id) => formData.append('serviceIds', id));
  input.menus.forEach((id) => formData.append('menus', id));
  if (input.packageImage) formData.append('packageImage', input.packageImage);
  return formData;
}

export async function createAdminPackage(input: PackageInput): Promise<AdminPackage> {
  const res = await api.post<{success: boolean;data: RawPackage;}>('/package', toPackageFormData(input));
  return mapPackage(res.data);
}

export async function updateAdminPackage(id: string, input: PackageInput): Promise<AdminPackage> {
  const res = await api.put<{success: boolean;message: string;data: RawPackage;}>(
    `/package/${id}`,
    toPackageFormData(input)
  );
  return mapPackage(res.data);
}

export function deleteAdminPackage(id: string): Promise<{success: boolean;}> {
  return api.delete<{success: boolean;}>(`/package/${id}`);
}
