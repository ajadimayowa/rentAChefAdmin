import { api } from '../../config/api';

export interface ChefLevelSummary {
  id: string;
  name: string;
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
}

/**
 * Same reasoning as getChefLevel — there's no chef-level-specific update/delete
 * endpoint, so this goes through the generic category routes. Note PUT /category/:id
 * has no multer middleware wired up, so this sends a JSON body (no image upload).
 */
export async function updateChefLevel(id: string, input: ChefLevelInput): Promise<ChefLevelDetail> {
  const res = await api.put<{success: boolean;payload: RawCategory;}>(`/category/${id}`, input);
  return mapChefLevelDetail(res.payload);
}

export function deleteChefLevel(id: string): Promise<{success: boolean;message: string;}> {
  return api.delete<{success: boolean;message: string;}>(`/category/${id}`);
}
