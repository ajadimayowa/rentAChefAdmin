import { api } from '../../config/api';

interface RawSpecialMenu {
  id: string;
  title: string;
  description?: string;
  minimumGuests: number;
  numberOfDishes: number;
  image?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSpecialMenu {
  id: string;
  title: string;
  description: string;
  minimumGuests: number;
  numberOfDishes: number;
  image?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

function mapSpecialMenu(raw: RawSpecialMenu): AdminSpecialMenu {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? '',
    minimumGuests: raw.minimumGuests,
    numberOfDishes: raw.numberOfDishes,
    image: raw.image,
    price: raw.price,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
}

export interface SpecialMenuListParams {
  search?: string;
  page?: number;
  limit?: number;
}

function toQueryString(params?: SpecialMenuListParams): string {
  const entries = Object.entries(params ?? {}).filter(
    (entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== ''
  );
  return entries.length ?
  `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()}` :
  '';
}

export interface SpecialMenuListMeta {
  total: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface SpecialMenuListResult {
  data: AdminSpecialMenu[];
  meta: SpecialMenuListMeta;
}

export async function listSpecialMenus(params?: SpecialMenuListParams): Promise<SpecialMenuListResult> {
  const res = await api.get<{success: boolean;data: RawSpecialMenu[];meta: SpecialMenuListMeta;}>(
    `/specialmenu/menus${toQueryString(params)}`
  );
  return { data: res.data.map(mapSpecialMenu), meta: res.meta };
}

export async function getSpecialMenu(id: string): Promise<AdminSpecialMenu> {
  const res = await api.get<{success: boolean;data: RawSpecialMenu;}>(`/specialmenu/${id}`);
  return mapSpecialMenu(res.data);
}

export interface SpecialMenuInput {
  title: string;
  description?: string;
  minimumGuests: number;
  numberOfDishes: number;
  price: number;
  menuPic?: File | null;
}

function toSpecialMenuFormData(input: SpecialMenuInput): FormData {
  const formData = new FormData();
  formData.append('title', input.title);
  if (input.description) formData.append('description', input.description);
  formData.append('minimumGuests', String(input.minimumGuests));
  formData.append('numberOfDishes', String(input.numberOfDishes));
  formData.append('price', String(input.price));
  if (input.menuPic) formData.append('menuPic', input.menuPic);
  return formData;
}

export async function createSpecialMenu(input: SpecialMenuInput): Promise<AdminSpecialMenu> {
  const res = await api.post<{success: boolean;data: RawSpecialMenu;}>(
    '/specialmenu/create',
    toSpecialMenuFormData(input)
  );
  return mapSpecialMenu(res.data);
}

export async function updateSpecialMenu(id: string, input: SpecialMenuInput): Promise<AdminSpecialMenu> {
  const res = await api.put<{success: boolean;data: RawSpecialMenu;}>(
    `/specialmenu/${id}`,
    toSpecialMenuFormData(input)
  );
  return mapSpecialMenu(res.data);
}

export function deleteSpecialMenu(id: string): Promise<{success: boolean;message: string;}> {
  return api.delete<{success: boolean;message: string;}>(`/specialmenu/${id}`);
}
