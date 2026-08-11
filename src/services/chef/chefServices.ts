import { api, type ApiItemResponse, type ApiListResponse } from '../../config/api';

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
  lifetimeEarnings: number;
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
