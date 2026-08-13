import { api } from '../../config/api';

export interface AdminCustomer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

interface RawUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: {city?: string;};
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

function mapCustomer(raw: RawUser): AdminCustomer {
  return {
    id: raw.id,
    fullName: raw.fullName,
    email: raw.email,
    phoneNumber: raw.phoneNumber,
    city: raw.address?.city,
    isActive: raw.isActive,
    isEmailVerified: raw.isEmailVerified,
    createdAt: raw.createdAt
  };
}

export interface CustomerListParams {
  search?: string;
  isActive?: 'all' | 'true' | 'false';
  page?: number;
  limit?: number;
}

export interface CustomerListResponse {
  success: boolean;
  data: AdminCustomer[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

function toQueryString(params?: CustomerListParams): string {
  const entries: [string, string][] = [['userType', 'Customer']];
  if (params?.search) entries.push(['search', params.search]);
  if (params?.isActive && params.isActive !== 'all') entries.push(['isActive', params.isActive]);
  if (params?.page) entries.push(['page', String(params.page)]);
  if (params?.limit) entries.push(['limit', String(params.limit)]);
  return `?${new URLSearchParams(entries).toString()}`;
}

export async function listAdminCustomers(params?: CustomerListParams): Promise<CustomerListResponse> {
  const res = await api.get<{success: boolean;data: RawUser[];meta: CustomerListResponse['meta'];}>(
    `/admin/users${toQueryString(params)}`
  );
  return { success: res.success, meta: res.meta, data: res.data.map(mapCustomer) };
}

export async function updateCustomerActiveStatus(id: string, isActive: boolean): Promise<AdminCustomer> {
  const res = await api.patch<{success: boolean;data: RawUser;}>(`/admin/users/${id}/status`, { isActive });
  return mapCustomer(res.data);
}

export interface CustomerDetail {
  id: string;
  fullName: string;
  firstName: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  dob?: string;
  profilePic?: string;
  maritalStatus?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  address?: {
    homeAddress?: string;
    officeAddress?: string;
    stateName?: string;
    city?: string;
  };
  kyc?: {
    idType?: string;
    idNumber?: string;
    idPicture?: string;
    isVerified?: boolean;
  };
  nok?: {
    fullName?: string;
    phone?: string;
    relationship?: string;
  };
  healthInformation?: {
    allergies?: string[];
    healthDetails?: string;
  };
  createdAt: string;
}

interface RawCustomerDetail extends RawUser {
  firstName: string;
  gender?: string;
  dob?: string;
  profilePic?: string;
  maritalStatus?: string;
  address?: CustomerDetail['address'];
  kyc?: CustomerDetail['kyc'];
  nok?: CustomerDetail['nok'];
  customerDetails?: {healthInformation?: CustomerDetail['healthInformation'];};
}

export async function getCustomer(id: string): Promise<CustomerDetail> {
  const res = await api.get<{success: boolean;payload: RawCustomerDetail;}>(`/user/${id}`);
  const raw = res.payload;
  return {
    id: raw.id,
    fullName: raw.fullName,
    firstName: raw.firstName,
    email: raw.email,
    phoneNumber: raw.phoneNumber,
    gender: raw.gender,
    dob: raw.dob,
    profilePic: raw.profilePic,
    maritalStatus: raw.maritalStatus,
    isActive: raw.isActive,
    isEmailVerified: raw.isEmailVerified,
    address: raw.address,
    kyc: raw.kyc,
    nok: raw.nok,
    healthInformation: raw.customerDetails?.healthInformation,
    createdAt: raw.createdAt
  };
}

export interface CustomerDashboardBooking {
  id: string;
  bookingNumber: string;
  chefName: string;
  serviceName: string;
  date: string;
  guests: number | null;
  amount: number;
  status: string;
}

export interface CustomerDashboard {
  metrics: {
    totalBookings: number;
    upcomingBookings: number;
    lifetimeSpend: number;
  };
  upcomingBookings: CustomerDashboardBooking[];
}

export async function getCustomerDashboard(id: string): Promise<CustomerDashboard> {
  const res = await api.get<{message: string;payload: CustomerDashboard;}>(`/user/dashboard/${id}`);
  return res.payload;
}
