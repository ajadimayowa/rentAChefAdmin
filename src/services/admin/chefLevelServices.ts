import { api } from '../../config/api';

export interface ChefLevelSummary {
  id: string;
  name: string;
  image?: string;
}

export async function listChefLevels(): Promise<ChefLevelSummary[]> {
  const res = await api.get<{success: boolean;message: string;payload: ChefLevelSummary[];}>('/chef/levels');
  return res.payload;
}

interface CategoryServiceRow {
  label: string;
  price: number;
}

interface RawCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  services: CategoryServiceRow[];
  tasks: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChefLevelDetail {
  id: string;
  name: string;
  description: string;
  slug: string;
  image?: string;
  services: CategoryServiceRow[];
  tasks: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapChefLevelDetail(raw: RawCategory): ChefLevelDetail {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? '',
    slug: raw.slug,
    image: raw.image,
    services: raw.services ?? [],
    tasks: raw.tasks ?? [],
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
}

/**
 * There is no dedicated get-by-id endpoint for chef levels — a "chef level" is a
 * Category document (see Category.ts), so this reuses the generic category lookup
 * to surface the fuller record (description, image, tasks, services) that the
 * /chef/levels list endpoint intentionally strips down to {id, name}.
 */
export async function getChefLevel(id: string): Promise<ChefLevelDetail> {
  const res = await api.get<{success: boolean;payload: RawCategory;}>(`/category/${id}`);
  return mapChefLevelDetail(res.payload);
}

export interface ChefLevelInput {
  name: string;
  description?: string;
  isActive: boolean;
  /** New icon to upload; leave empty to keep the current one. */
  icon?: File | null;
}

function toChefLevelFormData(input: ChefLevelInput): FormData {
  const form = new FormData();
  form.append('name', input.name);
  if (input.description !== undefined) form.append('description', input.description);
  form.append('isActive', String(input.isActive));
  if (input.icon) form.append('catPic', input.icon);
  return form;
}

/**
 * Same reasoning as getChefLevel — there's no chef-level-specific update/delete
 * endpoint, so this goes through the generic category routes. PUT /category/:id
 * runs multer (`catPic`), so this sends multipart FormData carrying the optional icon.
 */
export async function updateChefLevel(id: string, input: ChefLevelInput): Promise<ChefLevelDetail> {
  const res = await api.put<{success: boolean;payload: RawCategory;}>(`/category/${id}`, toChefLevelFormData(input));
  return mapChefLevelDetail(res.payload);
}

export function deleteChefLevel(id: string): Promise<{success: boolean;message: string;}> {
  return api.delete<{success: boolean;message: string;}>(`/category/${id}`);
}

/**
 * A chef level is a Category document, so creation goes through POST /category/create.
 * That route runs multer (`catPic`), so the body is sent as multipart FormData.
 * The create controller has no isActive field (new categories default to active),
 * so an inactive level is created then immediately updated.
 */
export async function createChefLevel(input: ChefLevelInput): Promise<ChefLevelDetail> {
  const form = toChefLevelFormData({ ...input, description: input.description ?? '' });
  const res = await api.post<{success: boolean;payload: RawCategory & {_id?: string;};}>('/category/create', form);
  const raw = { ...res.payload, id: res.payload.id ?? res.payload._id ?? '' };
  if (!input.isActive) {
    return updateChefLevel(raw.id, { ...input, icon: null });
  }
  return mapChefLevelDetail(raw);
}
