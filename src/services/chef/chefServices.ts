import { api, type ApiItemResponse, type ApiListResponse } from '../../config/api';
import type { ChefLevelRef } from '../../types';

export interface ChefCategoryOption {
  label: string;
  value: string;
}

export interface ChefLevelOption {
  id: string;
  name: string;
}

export function getChefCategories(): Promise<ApiListResponse<ChefCategoryOption>> {
  return api.get<ApiListResponse<ChefCategoryOption>>('/chef/categories');
}

export function getChefLevels(): Promise<ApiListResponse<ChefLevelOption>> {
  return api.get<ApiListResponse<ChefLevelOption>>('/chef/levels');
}

/**
 * ============================================================
 * DASHBOARD
 * ============================================================
 */

export interface ChefDashboardMetrics {
  upcomingBookings: number;
  jobsCompleted: number;
  rating: number;
  menusCreated: number;
}

export interface ChefDashboardBookingRow {
  id: string;
  bookingNumber: string;
  customerName: string;
  serviceName: string;
  date: string;
  guests: number | null;
  amount: number;
  status: string;
}

export interface ChefDashboardData {
  metrics: ChefDashboardMetrics;
  upcomingBookings: ChefDashboardBookingRow[];
}

export function getChefDashboard(): Promise<ApiItemResponse<ChefDashboardData>> {
  return api.get<ApiItemResponse<ChefDashboardData>>('/chef/dashboard');
}

/**
 * ============================================================
 * PROFILE
 * ============================================================
 */

export interface ChefProfileMenu {
  id: string;
  title: string;
  menuType?: string;
  menuClass?: string;
  pricePerHead: number;
  isSignatureMenu?: boolean;
  createdAt?: string;
}

export interface ChefProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  dob?: string;
  avatar: string;
  bio: string;
  specialties: string[];
  yearsOfExperience: number;
  rating: number;
  chefLevel: ChefLevelRef | null;
  staffId?: string;
  isEmailVerified?: boolean;
  state: {stateId: string;stateName: string;};
  city: string;
  services: {id: string;name: string;}[];
  totalBookings: number;
  completedBookings: number;
  upcomingBookings: number;
  recentMenus: ChefProfileMenu[];
  joinedAt: string;
}

// GET /chef/:id returns the chef doc plus booking counts, recent menus and
// resolved services — not a bare chef record, hence the raw shape below.
interface RawChefProfileResponse {
  chef: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    profilePic?: string;
    isEmailVerified?: boolean;
    gender?: string;
    dob?: string;
    createdAt?: string;
    address?: {stateId?: string;stateName?: string;city?: string;};
    chefDetails?: {
      staffId?: string;
      rating?: number;
      yearsOfExperience?: number;
      specialties?: string[];
      bio?: string;
      chefLevel?: ChefLevelRef | null;
    };
  };
  totalChefBooking: number;
  totalCompletedBooking: number;
  totalUpcoming: number;
  getTheChefMenu: {
    _id: string;
    title: string;
    menuType?: string;
    menuClass?: string;
    pricePerHead: number;
    isSignatureMenu?: boolean;
    createdAt?: string;
  }[];
  servicesOffered: {id: string;name: string;}[];
}

function mapChefProfile(raw: RawChefProfileResponse): ChefProfile {
  return {
    id: raw.chef.id,
    name: raw.chef.fullName ?? '',
    email: raw.chef.email ?? '',
    phone: raw.chef.phoneNumber ?? '',
    gender: raw.chef.gender,
    dob: raw.chef.dob,
    avatar: raw.chef.profilePic ?? '',
    bio: raw.chef.chefDetails?.bio ?? '',
    specialties: raw.chef.chefDetails?.specialties ?? [],
    yearsOfExperience: raw.chef.chefDetails?.yearsOfExperience ?? 0,
    rating: raw.chef.chefDetails?.rating ?? 0,
    chefLevel: raw.chef.chefDetails?.chefLevel ?? null,
    staffId: raw.chef.chefDetails?.staffId,
    isEmailVerified: raw.chef.isEmailVerified,
    state: {
      stateId: raw.chef.address?.stateId ?? '',
      stateName: raw.chef.address?.stateName ?? ''
    },
    city: raw.chef.address?.city ?? '',
    services: raw.servicesOffered ?? [],
    totalBookings: raw.totalChefBooking ?? 0,
    completedBookings: raw.totalCompletedBooking ?? 0,
    upcomingBookings: raw.totalUpcoming ?? 0,
    recentMenus: (raw.getTheChefMenu ?? []).map((m) => ({
      id: m._id,
      title: m.title,
      menuType: m.menuType,
      menuClass: m.menuClass,
      pricePerHead: m.pricePerHead,
      isSignatureMenu: m.isSignatureMenu,
      createdAt: m.createdAt
    })),
    joinedAt: raw.chef.createdAt ?? new Date().toISOString()
  };
}

export async function getChefProfile(id: string): Promise<ChefProfile> {
  const res = await api.get<ApiItemResponse<RawChefProfileResponse>>(`/chef/${id}`);
  return mapChefProfile(res.payload);
}

// Only the fields a chef is allowed to self-edit — email, chef level, rating and
// staff ID stay admin-managed (see PUT /chef/:id on the backend).
export interface ChefProfileUpdateInput {
  name: string;
  phone: string;
  gender?: string;
  dob?: string;
  bio: string;
  specialties: string[];
  yearsOfExperience: number;
  state: {stateId: string;stateName: string;};
  city: string;
  servicesOffered: string[];
  avatar?: File | null;
}

function toChefProfileFormData(input: ChefProfileUpdateInput): FormData {
  const formData = new FormData();
  formData.append('name', input.name);
  formData.append('phone', input.phone);
  if (input.gender) formData.append('gender', input.gender);
  if (input.dob) formData.append('dob', input.dob);
  formData.append('bio', input.bio);
  input.specialties.forEach((s) => formData.append('specialties[]', s));
  formData.append('yearsOfExperience', String(input.yearsOfExperience));
  formData.append('stateId', input.state.stateId);
  formData.append('stateName', input.state.stateName);
  formData.append('city', input.city);
  input.servicesOffered.forEach((serviceId) => formData.append('serviceIds[]', serviceId));
  if (input.avatar) formData.append('chefPic', input.avatar);
  return formData;
}

export async function updateChefProfile(id: string, input: ChefProfileUpdateInput): Promise<ChefProfile> {
  await api.put<ApiItemResponse<unknown>>(`/chef/${id}`, toChefProfileFormData(input));
  return getChefProfile(id);
}
