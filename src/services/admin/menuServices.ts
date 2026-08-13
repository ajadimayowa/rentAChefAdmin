import { api } from '../../config/api';

export type MenuCreatorType = 'chef' | 'organization';
export type MenuTimeSlot = 'breakfast' | 'lunch' | 'dinner';
export type MenuClass = 'nigerian' | 'continental';
export type PricingModel = 'perhead' | 'plater';

export interface GroceryItem {
  id?: string;
  groceryName: string;
  description?: string;
  unitPrice: number;
}

// Raw shapes as returned by the backend (populated refs come back as full objects).
interface RawChefRef {
  id: string;
  fullName: string;
}

interface RawMenuTypeRef {
  id: string;
  title: string;
  description?: string;
  packageId?: string;
}

interface RawPackageRef {
  id: string;
  title: string;
  description?: string;
}

interface RawMenu {
  id: string;
  menuCreatorType: MenuCreatorType;
  title: string;
  description: string;
  samplePicture?: string;
  isSignatureMenu: boolean;
  menuType: MenuTimeSlot;
  menuClass?: MenuClass;
  pricingModel?: PricingModel;
  menuCategory: RawMenuTypeRef[];
  relatedServiceId?: string;
  pricePerHead: number;
  packages: RawPackageRef[];
  chefId?: RawChefRef;
  groceries: GroceryItem[];
  totalGroceryCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMenu {
  id: string;
  menuCreatorType: MenuCreatorType;
  title: string;
  description: string;
  samplePicture?: string;
  isSignatureMenu: boolean;
  menuType: MenuTimeSlot;
  menuClass?: MenuClass;
  pricingModel?: PricingModel;
  menuCategory: {id: string;title: string;}[];
  relatedServiceId?: string;
  pricePerHead: number;
  packages: {id: string;title: string;}[];
  chef: {id: string;fullName: string;} | null;
  groceries: GroceryItem[];
  totalGroceryCost: number;
  createdAt: string;
  updatedAt: string;
}

function mapMenu(raw: RawMenu): AdminMenu {
  return {
    id: raw.id,
    menuCreatorType: raw.menuCreatorType,
    title: raw.title,
    description: raw.description,
    samplePicture: raw.samplePicture,
    isSignatureMenu: Boolean(raw.isSignatureMenu),
    menuType: raw.menuType,
    menuClass: raw.menuClass,
    pricingModel: raw.pricingModel,
    menuCategory: (raw.menuCategory ?? []).map((c) => ({ id: c.id, title: c.title })),
    relatedServiceId: raw.relatedServiceId,
    pricePerHead: raw.pricePerHead,
    packages: (raw.packages ?? []).map((p) => ({ id: p.id, title: p.title })),
    chef: raw.chefId ? { id: raw.chefId.id, fullName: raw.chefId.fullName } : null,
    groceries: raw.groceries ?? [],
    totalGroceryCost: raw.totalGroceryCost ?? 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
}

export interface MenuListParams {
  search?: string;
  menuCreatorType?: MenuCreatorType | 'all';
  menuType?: MenuTimeSlot | 'all';
  chefId?: string;
  page?: number;
  limit?: number;
}

function toMenuQueryString(params?: MenuListParams): string {
  const entries = Object.entries(params ?? {}).filter(
    (entry): entry is [string, string | number] =>
    entry[1] !== undefined && entry[1] !== '' && entry[1] !== 'all'
  );
  return entries.length ?
  `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()}` :
  '';
}

export interface MenuListResponse {
  success: boolean;
  data: AdminMenu[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export async function listAdminMenus(params?: MenuListParams): Promise<MenuListResponse> {
  const res = await api.get<{success: boolean;data: RawMenu[];total: number;page: number;totalPages: number;limit: number;}>(
    `/menus${toMenuQueryString(params)}`
  );
  return { ...res, data: res.data.map(mapMenu) };
}

export async function getAdminMenu(id: string): Promise<AdminMenu> {
  const res = await api.get<{success: boolean;data: RawMenu;}>(`/menu/${id}`);
  return mapMenu(res.data);
}

export interface CreateMenuInput {
  menuCreatorType: MenuCreatorType;
  title: string;
  description: string;
  relatedServiceId: string;
  menuType: MenuTimeSlot;
  menuClass?: string;
  pricingModel?: string;
  menuCategory: string[];
  pricePerHead: number;
  chefId?: string;
  isSignatureMenu: boolean;
  samplePicture?: File | null;
}

/** Core menu create — the endpoint doesn't accept groceries/packages directly, those are attached afterward via their own endpoints (see addMenuGrocery / attachMenuToPackage). */
export async function createMenuCore(input: CreateMenuInput): Promise<AdminMenu> {
  const formData = new FormData();
  formData.append('menuCreatorType', input.menuCreatorType);
  formData.append('title', input.title);
  formData.append('description', input.description);
  formData.append('relatedServiceId', input.relatedServiceId);
  formData.append('menuType', input.menuType);
  if (input.menuClass) formData.append('menuClass', input.menuClass);
  if (input.pricingModel) formData.append('pricingModel', input.pricingModel);
  input.menuCategory.forEach((id) => formData.append('menuCategory', id));
  formData.append('pricePerHead', String(input.pricePerHead));
  if (input.menuCreatorType === 'chef') {
    formData.append('chefId', input.chefId || '');
    formData.append('isSignatureMenu', String(input.isSignatureMenu));
  }
  if (input.samplePicture) formData.append('samplePicture', input.samplePicture);

  const res = await api.post<{success: boolean;message: string;data: RawMenu;}>('/menu', formData);
  return mapMenu(res.data);
}

export async function addMenuGrocery(menuId: string, item: GroceryItem): Promise<AdminMenu> {
  const res = await api.post<{success: boolean;data: RawMenu;}>(`/menu/${menuId}/groceries`, item);
  return mapMenu(res.data);
}

export async function attachMenuToPackage(menuId: string, packageId: string): Promise<AdminMenu> {
  const res = await api.post<{success: boolean;message: string;data: RawMenu;}>(
    `/menu/${menuId}/packages/${packageId}`,
    {}
  );
  return mapMenu(res.data);
}

export interface MenuTypeOption {
  id: string;
  title: string;
  packageId?: string;
}

export async function listMenuTypeOptions(): Promise<MenuTypeOption[]> {
  const res = await api.get<{success: boolean;data: RawMenuTypeRef[];}>('/menu-types?limit=200');
  return res.data.map((m) => ({ id: m.id, title: m.title, packageId: m.packageId }));
}

export interface PackageOption {
  id: string;
  title: string;
}

export async function listPackageOptions(): Promise<PackageOption[]> {
  const res = await api.get<{success: boolean;data: RawPackageRef[];}>('/packages');
  return res.data.map((p) => ({ id: p.id, title: p.title }));
}
