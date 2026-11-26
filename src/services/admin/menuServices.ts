import { api } from '../../config/api';

export type MenuCreatorType = 'chef' | 'organization';
export type MenuTimeSlot = 'breakfast' | 'lunch' | 'dinner';
export type MenuClass = 'nigerian' | 'continental' | 'intercontinental';
export type PricingModel = 'perhead' | 'plater';
/** Tier a menu is sold under (date night "Choose your menu"). */
export type MenuKind = 'classic' | 'premium' | 'signature';
export const MENU_KIND_OPTIONS: {value: MenuKind;label: string;}[] = [
{ value: 'classic', label: 'Classic' },
{ value: 'premium', label: 'Premium' },
{ value: 'signature', label: 'Signature' }];

/** Common attribute suggestions for the menu form. */
export const MENU_ATTRIBUTE_SUGGESTIONS = ['Amuse-bouche', 'Starter', 'Main', 'Dessert', 'Breakfast'];

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
  menuKind?: MenuKind;
  attributes?: string[];
  menuCategory: RawMenuTypeRef[];
  relatedServiceId?: string;
  serviceIds?: (string | {id?: string;_id?: string;})[];
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
  menuKind?: MenuKind;
  attributes: string[];
  menuCategory: {id: string;title: string;}[];
  relatedServiceId?: string;
  /** Every service this menu is offered on. */
  serviceIds: string[];
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
    menuKind: raw.menuKind,
    attributes: raw.attributes ?? [],
    menuCategory: (raw.menuCategory ?? []).map((c) => ({ id: c.id, title: c.title })),
    relatedServiceId: raw.relatedServiceId,
    serviceIds: (raw.serviceIds?.length ? raw.serviceIds : raw.relatedServiceId ? [raw.relatedServiceId] : []).
    map((s) => typeof s === 'string' ? s : s?.id ?? s?._id ?? '').
    filter(Boolean),
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
  menuKind?: MenuKind | 'all';
  serviceId?: string;
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
  /** At least one service. */
  serviceIds: string[];
  menuType: MenuTimeSlot;
  menuClass?: string;
  pricingModel?: string;
  menuKind?: MenuKind | '';
  attributes?: string[];
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
  formData.append('serviceIds', JSON.stringify(input.serviceIds));
  formData.append('menuType', input.menuType);
  if (input.menuClass) formData.append('menuClass', input.menuClass);
  if (input.pricingModel) formData.append('pricingModel', input.pricingModel);
  if (input.menuKind) formData.append('menuKind', input.menuKind);
  // Sent as one JSON field so a single attribute still arrives as a list.
  if (input.attributes?.length) formData.append('attributes', JSON.stringify(input.attributes));
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

export interface UpdateMenuInput extends CreateMenuInput {
  groceries: GroceryItem[];
  packages: string[];
}

/**
 * Saves every editable field of a menu in one request. Lists (categories,
 * packages, groceries, attributes) replace what's saved, so removed items go away;
 * empty optional selects clear the field. The picture only changes if a new file is chosen.
 */
export async function updateMenuCore(id: string, input: UpdateMenuInput): Promise<AdminMenu> {
  const formData = new FormData();
  formData.append('menuCreatorType', input.menuCreatorType);
  formData.append('title', input.title);
  formData.append('description', input.description);
  formData.append('serviceIds', JSON.stringify(input.serviceIds));
  formData.append('menuType', input.menuType);
  formData.append('menuClass', input.menuClass ?? '');
  formData.append('pricingModel', input.pricingModel ?? '');
  formData.append('menuKind', input.menuKind ?? '');
  formData.append('attributes', JSON.stringify(input.attributes ?? []));
  if (input.menuCategory.length) input.menuCategory.forEach((cid) => formData.append('menuCategory', cid));else
  formData.append('menuCategory', '');
  formData.append('pricePerHead', String(input.pricePerHead));
  if (input.menuCreatorType === 'chef') {
    formData.append('chefId', input.chefId || '');
    formData.append('isSignatureMenu', String(input.isSignatureMenu));
  }
  formData.append('packageTypes', JSON.stringify(input.packages));
  formData.append('groceries', JSON.stringify(input.groceries));
  if (input.samplePicture) formData.append('samplePicture', input.samplePicture);

  await api.put<{success: boolean;data: RawMenu;}>(`/menu/${id}`, formData);
  // The update response isn't populated (categories/packages come back as ids) — reload it.
  return getAdminMenu(id);
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

export interface CreateMenuTypeInput {
  title: string;
  description: string;
  packageId: string;
}

/** Creates a menu category (a "menu type" on the backend); it belongs to one package. */
export async function createMenuTypeOption(input: CreateMenuTypeInput): Promise<MenuTypeOption> {
  const res = await api.post<{success: boolean;data: Omit<RawMenuTypeRef, 'packageId'> & {packageId?: string | {id?: string;} | null;};}>(
    '/menu-type',
    input
  );
  const pkg = res.data.packageId;
  return {
    id: res.data.id,
    title: res.data.title,
    packageId: (typeof pkg === 'object' && pkg !== null ? pkg.id : pkg) ?? undefined
  };
}

export interface PackageOption {
  id: string;
  title: string;
}

export async function listPackageOptions(): Promise<PackageOption[]> {
  const res = await api.get<{success: boolean;data: RawPackageRef[];}>('/packages');
  return res.data.map((p) => ({ id: p.id, title: p.title }));
}
