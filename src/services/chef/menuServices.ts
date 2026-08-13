import { api } from '../../config/api';

export type ChefMenuType = 'breakfast' | 'lunch' | 'dinner';
export type ChefMenuClass = 'nigerian' | 'continental';
export type ChefMenuPricingModel = 'perhead' | 'plater';

export interface ChefMenuGroceryInput {
  groceryName: string;
  description?: string;
  unitPrice: number;
}

export interface ChefMenuGrocery extends ChefMenuGroceryInput {
  id: string;
}

export interface ChefMenuInput {
  title: string;
  description: string;
  menuType: ChefMenuType;
  menuClass?: ChefMenuClass;
  pricingModel?: ChefMenuPricingModel;
  relatedServiceId: string;
  pricePerHead: number;
  isSignatureMenu: boolean;
  samplePicture?: File | null;
  groceries: ChefMenuGroceryInput[];
}

export interface ChefMenu {
  id: string;
  title: string;
  description: string;
  menuType: ChefMenuType;
  menuClass?: ChefMenuClass;
  pricingModel?: ChefMenuPricingModel;
  relatedServiceId: string;
  pricePerHead: number;
  isSignatureMenu: boolean;
  samplePicture?: string;
  groceries: ChefMenuGrocery[];
  totalGroceryCost: number;
  createdAt: string;
  updatedAt: string;
}

// The backend replies with `data`, not the `payload` envelope most other
// endpoints use — kept local to this file rather than widening the shared types.
interface MenuApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

function toMenuFormData(input: ChefMenuInput, chefId: string): FormData {
  const formData = new FormData();
  formData.append('menuCreatorType', 'chef');
  formData.append('chefId', chefId);
  formData.append('title', input.title);
  formData.append('description', input.description);
  formData.append('menuType', input.menuType);
  if (input.menuClass) formData.append('menuClass', input.menuClass);
  if (input.pricingModel) formData.append('pricingModel', input.pricingModel);
  formData.append('relatedServiceId', input.relatedServiceId);
  formData.append('pricePerHead', String(input.pricePerHead));
  formData.append('isSignatureMenu', String(input.isSignatureMenu));
  if (input.samplePicture) formData.append('samplePicture', input.samplePicture);
  return formData;
}

/**
 * Creates a chef menu, then adds each grocery line item one request at a time —
 * POST /menu has no groceries param, they're only accepted via the dedicated
 * /menu/:menuId/groceries endpoint.
 */
export async function createChefMenu(input: ChefMenuInput, chefId: string): Promise<ChefMenu> {
  const res = await api.post<MenuApiResponse<ChefMenu>>('/menu', toMenuFormData(input, chefId));
  const menu = res.data;

  for (const grocery of input.groceries) {
    await api.post<MenuApiResponse<ChefMenu>>(`/menu/${menu.id}/groceries`, grocery);
  }

  return menu;
}

export interface ChefMenuListParams {
  chefId: string;
  search?: string;
  menuType?: ChefMenuType | 'all';
  page?: number;
  limit?: number;
}

export interface ChefMenuListResponse {
  success: boolean;
  data: ChefMenu[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

function toChefMenuQueryString(params: ChefMenuListParams): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number] =>
    entry[1] !== undefined && entry[1] !== '' && entry[1] !== 'all'
  );
  return `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()}`;
}

export function listChefMenus(params: ChefMenuListParams): Promise<ChefMenuListResponse> {
  return api.get<ChefMenuListResponse>(`/menus${toChefMenuQueryString(params)}`);
}

export async function getChefMenuById(id: string): Promise<ChefMenu> {
  const res = await api.get<MenuApiResponse<ChefMenu>>(`/menu/${id}`);
  return res.data;
}

export interface ChefMenuUpdateInput {
  title: string;
  description: string;
  menuType: ChefMenuType;
  menuClass?: ChefMenuClass;
  pricingModel?: ChefMenuPricingModel;
  pricePerHead: number;
  isSignatureMenu: boolean;
  samplePicture?: File | null;
}

export async function updateChefMenu(id: string, input: ChefMenuUpdateInput): Promise<ChefMenu> {
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('description', input.description);
  formData.append('menuType', input.menuType);
  formData.append('menuClass', input.menuClass ?? '');
  formData.append('pricingModel', input.pricingModel ?? '');
  formData.append('pricePerHead', String(input.pricePerHead));
  formData.append('isSignatureMenu', String(input.isSignatureMenu));
  if (input.samplePicture) formData.append('samplePicture', input.samplePicture);

  const res = await api.put<MenuApiResponse<ChefMenu>>(`/menu/${id}`, formData);
  return res.data;
}

export async function deleteChefMenu(id: string): Promise<void> {
  await api.delete<{success: boolean;message: string;}>(`/menu/${id}`);
}

export async function addChefMenuGrocery(menuId: string, item: ChefMenuGroceryInput): Promise<ChefMenu> {
  const res = await api.post<MenuApiResponse<ChefMenu>>(`/menu/${menuId}/groceries`, item);
  return res.data;
}

export async function deleteChefMenuGrocery(menuId: string, groceryId: string): Promise<ChefMenu> {
  const res = await api.delete<MenuApiResponse<ChefMenu>>(`/menu/${menuId}/groceries/${groceryId}`);
  return res.data;
}
