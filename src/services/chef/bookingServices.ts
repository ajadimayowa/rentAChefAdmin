import { api } from '../../config/api';

export interface ChefBookingListItem {
  id: string;
  bookingNumber: string;
  customerName: string;
  serviceName: string;
  workflow?: string;
  /** Whether the chef has accepted the assignment yet. */
  chefResponseStatus?: 'pending' | 'accepted' | 'declined';
  status: string;
  paymentStatus: string;
  date: string;
  guests: number | null;
  amount: number;
  createdAt: string;
}

export interface ChefBookingListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChefBookingListParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface ChefBookingListResponse {
  success: boolean;
  meta: ChefBookingListMeta;
  payload: ChefBookingListItem[];
}

function toChefBookingQueryString(params?: ChefBookingListParams): string {
  const entries = Object.entries(params ?? {}).filter(
    (entry): entry is [string, string | number] =>
    entry[1] !== undefined && entry[1] !== '' && entry[1] !== 'all'
  );
  return entries.length ?
  `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()}` :
  '';
}

export function listChefBookings(params?: ChefBookingListParams): Promise<ChefBookingListResponse> {
  return api.get<ChefBookingListResponse>(`/chef/bookings${toChefBookingQueryString(params)}`);
}

/** The assigned chef accepts the booking, or declines it with a reason (admins are notified). */
export function respondToBooking(
id: string,
action: 'accept' | 'decline',
reason?: string)
: Promise<{success: boolean;message: string;payload: {id: string;status: string;chefResponse: {status: string;};};}> {
  return api.post(`/chef/bookings/${id}/respond`, { action, reason });
}
