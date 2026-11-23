import { api, type ApiItemResponse, type ApiListResponse, type ApiMessageResponse } from '../../config/api';
import type { ApprovalStatus, Chef, ChefLevelRef } from '../../types';
import type { BookingComment, BookingPaymentDetails } from '../booking/bookingServices';

export interface ChefListParams {
  search?: string;
  chefLevel?: string;
  status?: ApprovalStatus;
  limit?: number;
}

export type ChefInput = Omit<Chef, 'id' | 'rating' | 'jobsCompleted' | 'joinedAt' | 'avatar'> & {
  avatar?: File | null;
};

// Shape actually returned by the backend (a serialized User document) — not the
// flat `Chef` shape the UI works with, hence `mapChef` below.
interface RawChef {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profilePic?: string;
  isActive: boolean;
  isEmailVerified?: boolean;
  gender?: string;
  dob?: string;
  createdAt?: string;
  address?: {
    stateId?: string;
    stateName?: string;
    city?: string;
  };
  kyc?: {
    idType?: string;
    idNumber?: string;
    idPicture?: string;
    isVerified?: boolean;
  };
  chefDetails?: {
    staffId?: string;
    rating?: number;
    yearsOfExperience?: number;
    specialties?: string[];
    bio?: string;
    chefLevel?: ChefLevelRef | null;
    servicesOffered?: string[];
    certifications?: string[];
    isPasswordUpdated?: boolean;
  };
}

// GET /chef/:id (used by the admin ViewChefPage) doesn't return a bare chef — it
// returns the chef plus booking counts, recent menus and resolved services.
interface RawChefMenu {
  _id: string;
  title: string;
  menuType?: string;
  menuClass?: string;
  pricePerHead: number;
  isSignatureMenu?: boolean;
  createdAt?: string;
}

interface RawChefDetailResponse {
  chef: RawChef;
  totalChefBooking: number;
  totalCompletedBooking: number;
  totalUpcoming: number;
  getTheChefMenu: RawChefMenu[];
  servicesOffered: { id: string; name: string }[];
}

export interface ChefDetailMenu {
  id: string;
  title: string;
  menuType?: string;
  menuClass?: string;
  pricePerHead: number;
  isSignatureMenu?: boolean;
  createdAt?: string;
}

export interface ChefDetail extends Chef {
  gender?: string;
  dob?: string;
  staffId?: string;
  isEmailVerified?: boolean;
  certifications?: string[];
  kyc?: {
    idType?: string;
    idNumber?: string;
    idPicture?: string;
    isVerified?: boolean;
  };
  totalBookings: number;
  completedBookings: number;
  upcomingBookings: number;
  recentMenus: ChefDetailMenu[];
  services: { id: string; name: string }[];
}

function mapChef(raw: RawChef): Chef {
  return {
    id: raw.id,
    name: raw.fullName ?? '',
    email: raw.email ?? '',
    phone: raw.phoneNumber ?? '',
    state: {
      stateId: raw.address?.stateId ?? '',
      stateName: raw.address?.stateName ?? ''
    },
    city: raw.address?.city ?? '',
    chefLevel: raw.chefDetails?.chefLevel ?? null,
    specialties: raw.chefDetails?.specialties ?? [],
    servicesOffered: raw.chefDetails?.servicesOffered ?? [],
    yearsOfExperience: raw.chefDetails?.yearsOfExperience ?? 0,
    rating: raw.chefDetails?.rating ?? 0,
    // Not returned by the backend yet — no completed-bookings count is computed for list/detail chef responses.
    jobsCompleted: 0,
    // The backend only tracks isActive (no pending/suspended/rejected states yet) — approximated here.
    status: raw.isActive ? 'approved' : 'pending',
    avatar: raw.profilePic ?? '',
    bio: raw.chefDetails?.bio ?? '',
    joinedAt: raw.createdAt ?? new Date().toISOString()
  };
}

function mapChefDetail(raw: RawChefDetailResponse): ChefDetail {
  return {
    ...mapChef(raw.chef),
    gender: raw.chef.gender,
    dob: raw.chef.dob,
    staffId: raw.chef.chefDetails?.staffId,
    isEmailVerified: raw.chef.isEmailVerified,
    certifications: raw.chef.chefDetails?.certifications ?? [],
    kyc: raw.chef.kyc,
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
    services: raw.servicesOffered ?? []
  };
}

function toQueryString(params?: ChefListParams): string {
  const entries = Object.entries(params ?? {}).filter(
    (entry): entry is [string, string | number] =>
    entry[1] !== undefined && entry[1] !== '' && entry[1] !== 'all'
  );
  return entries.length ?
  `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()}` :
  '';
}

function toChefFormData(input: ChefInput): FormData {
  const formData = new FormData();
  formData.append('name', input.name);
  formData.append('email', input.email);
  formData.append('phone', input.phone);
  formData.append('stateId', input.state.stateId);
  formData.append('stateName', input.state.stateName);
  formData.append('city', input.city);
  formData.append('chefLevel', input.chefLevel?.id ?? '');
  formData.append('yearsOfExperience', String(input.yearsOfExperience));
  formData.append('bio', input.bio);
  if (input.status) formData.append('status', input.status);
  input.specialties.forEach((specialty) => formData.append('specialties[]', specialty));
  input.servicesOffered.forEach((serviceId) => formData.append('serviceIds[]', serviceId));
  // multer expects the file field to be named "chefPic", not "avatar"
  if (input.avatar) formData.append('chefPic', input.avatar);
  return formData;
}

export async function listChefs(params?: ChefListParams): Promise<ApiListResponse<Chef>> {
  const res = await api.get<ApiListResponse<RawChef>>(`/admin/chefs${toQueryString(params)}`);
  return { ...res, payload: res.payload.map(mapChef) };
}

export async function getChef(id: string): Promise<ApiItemResponse<ChefDetail>> {
  const res = await api.get<ApiItemResponse<RawChefDetailResponse>>(`/chef/${id}`);
  return { ...res, payload: mapChefDetail(res.payload) };
}

export async function createChef(input: ChefInput): Promise<ApiItemResponse<Chef>> {
  const res = await api.post<ApiItemResponse<RawChef>>('/admin/chef', toChefFormData(input));
  return { ...res, payload: mapChef(res.payload) };
}

export async function updateChef(id: string, input: ChefInput): Promise<ApiItemResponse<Chef>> {
  const res = await api.put<ApiItemResponse<RawChef>>(`/chef/${id}`, toChefFormData(input));
  return { ...res, payload: mapChef(res.payload) };
}

export async function updateChefStatus(id: string, status: ApprovalStatus): Promise<ApiItemResponse<Chef>> {
  const res = await api.patch<ApiItemResponse<RawChef>>(`/admin/chefs/${id}/status`, { status });
  return { ...res, payload: mapChef(res.payload) };
}

export function deleteChef(id: string): Promise<ApiMessageResponse> {
  return api.delete<ApiMessageResponse>(`/chef/${id}`);
}

/**
 * ============================================================
 * DASHBOARD
 * ============================================================
 */

export interface AdminDashboardMetrics {
  grossRevenue: number;
  revenueThisMonth: number;
  revenueDeltaPct: number | null;
  activeBookings: number;
  activeBookingsDeltaPct: number | null;
  approvedChefs: number;
  pendingChefs: number;
  customers: number;
  newCustomersDeltaPct: number | null;
}

export interface AdminDashboardRevenuePoint {
  month: string;
  revenue: number;
}

export interface AdminDashboardApprovalItem {
  id: string;
  name: string;
  avatar: string;
  joinedAt: string;
}

export interface AdminDashboardBookingRow {
  id: string;
  bookingNumber: string;
  customerName: string;
  chefName: string;
  serviceName: string;
  date: string;
  guests: number | null;
  amount: number;
  status: string;
}

export interface AdminDashboardData {
  metrics: AdminDashboardMetrics;
  revenueTrend: AdminDashboardRevenuePoint[];
  approvalQueue: AdminDashboardApprovalItem[];
  upcomingBookings: AdminDashboardBookingRow[];
}

export function getAdminDashboard(): Promise<ApiItemResponse<AdminDashboardData>> {
  return api.get<ApiItemResponse<AdminDashboardData>>('/admin/dashboard');
}

/**
 * ============================================================
 * BOOKINGS
 * ============================================================
 */

export interface AdminBookingListItem {
  id: string;
  bookingNumber: string;
  customerName: string;
  chefName: string;
  serviceName: string;
  workflow?: string;
  status: string;
  paymentStatus: string;
  date: string;
  guests: number | null;
  amount: number;
  createdAt: string;
}

export interface AdminBookingListParams {
  status?: string;
  paymentStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminBookingListResponse {
  success: boolean;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    statusCounts: Record<string, number>;
  };
  payload: AdminBookingListItem[];
}

function toBookingQueryString(params?: AdminBookingListParams): string {
  const entries = Object.entries(params ?? {}).filter(
    (entry): entry is [string, string | number] =>
    entry[1] !== undefined && entry[1] !== '' && entry[1] !== 'all'
  );
  return entries.length ?
  `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()}` :
  '';
}

export function listAdminBookings(params?: AdminBookingListParams): Promise<AdminBookingListResponse> {
  return api.get<AdminBookingListResponse>(`/admin/bookings${toBookingQueryString(params)}`);
}

export function updateBookingStatus(
id: string,
status: string)
: Promise<ApiItemResponse<{id: string;status: string;}>> {
  return api.patch<ApiItemResponse<{id: string;status: string;}>>(`/admin/bookings/${id}/status`, { status });
}

export interface AssignedChef {
  id: string;
  fullName: string;
}

export function assignBookingChef(
bookingId: string,
chefId: string)
: Promise<ApiItemResponse<{id: string;status: string;chef: AssignedChef;}>> {
  return api.post<ApiItemResponse<{id: string;status: string;chef: AssignedChef;}>>(
    `/admin/bookings/${bookingId}/assign-chef`,
    { chefId }
  );
}

export function addBookingComment(
bookingId: string,
text: string)
: Promise<ApiItemResponse<BookingComment[]>> {
  return api.post<ApiItemResponse<BookingComment[]>>(`/admin/bookings/${bookingId}/comments`, { text });
}

export interface AddBookingPaymentInput {
  transactionRef: string;
  mode: 'Cash' | 'Transfer';
  bankName?: string;
  accountNumber?: string;
  amount: number;
  date: string;
}

export interface AddBookingPaymentResult {
  id: string;
  paymentStatus: string;
  modeOfPayment: string;
  transactnRef: string;
  paymentDetails: BookingPaymentDetails;
}

export function addBookingPayment(
bookingId: string,
input: AddBookingPaymentInput)
: Promise<ApiItemResponse<AddBookingPaymentResult>> {
  return api.post<ApiItemResponse<AddBookingPaymentResult>>(`/admin/bookings/${bookingId}/payment`, input);
}

/**
 * ============================================================
 * SERVICES
 * ============================================================
 */

export type ServiceBookingType = 'instant' | 'quotation';

/** Fields shared by a saved service and the create/update payload. */
export interface ServiceFields {
  name: string;
  categoryId: string;
  description: string;
  workflow: string;
  bookingType: ServiceBookingType | '';
  /** Chef level (Category) ids allowed to deliver this service; empty = any level. */
  allowedChefLevels: string[];
  supportsChefMenu: boolean;
  supportsCustomerMenuUpload: boolean;
  supportsProcurement: boolean;
  isActive: boolean;
}

export interface ServiceInput extends ServiceFields {
  /** New picture to upload; leave empty to keep the current one. */
  image?: File | null;
}

export interface AdminService extends ServiceFields {
  id: string;
  /** Uploaded service picture URL. */
  image: string;
  /** Legacy icon-font name, no longer editable from the admin. */
  icon: string;
  categoryName: string;
  createdAt: string;
}

const OBJECT_ID = /^[a-f0-9]{24}$/i;

// Sent as multipart so the picture can ride along (backend field: `image`). The chef
// level list is JSON-encoded because an empty array can't be sent as repeated fields.
function toServiceFormData(input: ServiceInput): FormData {
  const form = new FormData();
  form.append('name', input.name);
  form.append('categoryId', input.categoryId);
  form.append('description', input.description);
  form.append('workflow', input.workflow);
  form.append('bookingType', input.bookingType);
  form.append('allowedChefLevels', JSON.stringify(input.allowedChefLevels));
  form.append('supportsChefMenu', String(input.supportsChefMenu));
  form.append('supportsCustomerMenuUpload', String(input.supportsCustomerMenuUpload));
  form.append('supportsProcurement', String(input.supportsProcurement));
  form.append('isActive', String(input.isActive));
  if (input.image) form.append('image', input.image);
  return form;
}

interface RawServiceCategoryRef {
  id: string;
  name: string;
}

interface RawService {
  id?: string;
  /** GET /service/:id returns a lean doc, so it carries _id instead of id. */
  _id?: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  workflow?: string;
  bookingType?: string;
  allowedChefLevels?: string[];
  supportsChefMenu?: boolean;
  supportsCustomerMenuUpload?: boolean;
  supportsProcurement?: boolean;
  isActive: boolean;
  categoryId: RawServiceCategoryRef | string;
  createdAt?: string;
}

// createService/updateService reply with an unpopulated doc (categoryId is a bare
// id string) while getServices/getServiceById populate it — this resolves both,
// falling back to a locally-known category list for the unpopulated case.
function mapService(raw: RawService, categoryNamesById?: Map<string, string>): AdminService {
  const isPopulated = typeof raw.categoryId === 'object' && raw.categoryId !== null;
  const categoryId = isPopulated ? (raw.categoryId as RawServiceCategoryRef).id : String(raw.categoryId ?? '');
  const categoryName = isPopulated ?
  (raw.categoryId as RawServiceCategoryRef).name :
  categoryNamesById?.get(categoryId) ?? '—';

  return {
    id: raw.id ?? raw._id ?? '',
    name: raw.name ?? '',
    description: raw.description ?? '',
    icon: raw.icon ?? '',
    image: raw.image ?? '',
    workflow: raw.workflow ?? '',
    bookingType: raw.bookingType === 'instant' || raw.bookingType === 'quotation' ? raw.bookingType : '',
    // Older services stored level names ("senior"); only real chef-level ids are kept.
    allowedChefLevels: (raw.allowedChefLevels ?? []).map(String).filter((l) => OBJECT_ID.test(l)),
    supportsChefMenu: raw.supportsChefMenu ?? false,
    supportsCustomerMenuUpload: raw.supportsCustomerMenuUpload ?? false,
    supportsProcurement: raw.supportsProcurement ?? true,
    isActive: raw.isActive ?? true,
    categoryId,
    categoryName,
    createdAt: raw.createdAt ?? new Date().toISOString()
  };
}

export interface ServiceListParams {
  search?: string;
  categoryId?: string;
  status?: 'active' | 'inactive';
}

function toServiceQueryString(params?: ServiceListParams): string {
  const entries = Object.entries(params ?? {}).filter(
    (entry): entry is [string, string] =>
    entry[1] !== undefined && entry[1] !== '' && entry[1] !== 'all'
  );
  return entries.length ? `?${new URLSearchParams(entries).toString()}&limit=200` : '?limit=200';
}

export async function listServices(
params?: ServiceListParams,
categoryNamesById?: Map<string, string>)
: Promise<ApiListResponse<AdminService>> {
  const res = await api.get<{success: boolean;payload: RawService[];}>(
    `/service/services${toServiceQueryString(params)}`
  );
  return {
    success: res.success,
    message: '',
    payload: res.payload.map((s) => mapService(s, categoryNamesById))
  };
}

export async function createService(
input: ServiceInput,
categoryNamesById?: Map<string, string>)
: Promise<ApiItemResponse<AdminService>> {
  const res = await api.post<{success: boolean;payload: RawService;}>('/service/create', toServiceFormData(input));
  return { success: res.success, message: '', payload: mapService(res.payload, categoryNamesById) };
}

export async function updateService(
id: string,
input: ServiceInput,
categoryNamesById?: Map<string, string>)
: Promise<ApiItemResponse<AdminService>> {
  const res = await api.put<{success: boolean;payload: RawService;}>(`/service/${id}`, toServiceFormData(input));
  return { success: res.success, message: '', payload: mapService(res.payload, categoryNamesById) };
}

export function deleteService(id: string): Promise<ApiMessageResponse> {
  return api.delete<ApiMessageResponse>(`/service/${id}`);
}

export interface ServiceCategoryOption {
  id: string;
  name: string;
}

export async function listServiceCategories(): Promise<ApiListResponse<ServiceCategoryOption>> {
  const res = await api.get<{success: boolean;payload: {id: string;name: string;}[];}>(
    '/service-category/categories?limit=200'
  );
  return { success: res.success, message: '', payload: res.payload.map((c) => ({ id: c.id, name: c.name })) };
}

interface RawServiceCategory {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AdminServiceCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  isActive: boolean;
  createdAt: string;
}

export interface ServiceCategoryInput {
  name: string;
  description: string;
  isActive: boolean;
  /** New picture to upload; leave empty to keep the current one. */
  image?: File | null;
}

// Sent as multipart so the picture can ride along (backend field: `image`).
function toServiceCategoryFormData(input: ServiceCategoryInput): FormData {
  const form = new FormData();
  form.append('name', input.name);
  form.append('description', input.description);
  form.append('isActive', String(input.isActive));
  if (input.image) form.append('image', input.image);
  return form;
}

function mapServiceCategory(raw: RawServiceCategory): AdminServiceCategory {
  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description ?? '',
    slug: raw.slug ?? '',
    image: raw.image ?? '',
    isActive: raw.isActive ?? true,
    createdAt: raw.createdAt ?? ''
  };
}

/** Full category records for the Service Categories page (the backend pages at 20 by default). */
export async function listServiceCategoriesFull(): Promise<AdminServiceCategory[]> {
  const res = await api.get<{success: boolean;payload: RawServiceCategory[];}>(
    '/service-category/categories?limit=200'
  );
  return res.payload.map(mapServiceCategory);
}

export async function createServiceCategory(input: ServiceCategoryInput): Promise<AdminServiceCategory> {
  const res = await api.post<{success: boolean;payload: RawServiceCategory;}>('/service-category/create', toServiceCategoryFormData(input));
  return mapServiceCategory(res.payload);
}

export async function updateServiceCategory(
id: string,
input: ServiceCategoryInput)
: Promise<AdminServiceCategory> {
  const res = await api.put<{success: boolean;payload: RawServiceCategory;}>(`/service-category/${id}`, toServiceCategoryFormData(input));
  return mapServiceCategory(res.payload);
}

export function deleteServiceCategory(id: string): Promise<ApiMessageResponse> {
  return api.delete<ApiMessageResponse>(`/service-category/${id}`);
}

export interface WorkflowOption {
  code: string;
  displayName: string;
}

export async function listWorkflows(): Promise<ApiListResponse<WorkflowOption>> {
  const res = await api.get<{success: boolean;data: {code: string;displayName: string;}[];}>('/workflows');
  return { success: res.success, message: '', payload: res.data };
}

export async function getService(
id: string,
categoryNamesById?: Map<string, string>)
: Promise<ApiItemResponse<AdminService>> {
  const res = await api.get<{success: boolean;payload: RawService;}>(`/service/${id}`);
  return { success: res.success, message: '', payload: mapService(res.payload, categoryNamesById) };
}
