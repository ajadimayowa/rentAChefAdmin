import { api } from '../../config/api';

export interface ClientDashboardMetrics {
  upcomingBookings: number;
  totalBookings: number;
  lifetimeSpend: number;
}

export interface ClientDashboardBookingRow {
  id: string;
  bookingNumber: string;
  chefName: string;
  serviceName: string;
  date: string;
  guests: number | null;
  amount: number;
  status: string;
}

export interface ClientDashboardData {
  user: { id: string; fullName: string; firstName: string; email: string };
  metrics: ClientDashboardMetrics;
  upcomingBookings: ClientDashboardBookingRow[];
}

// GET /user/dashboard/:id replies with `{message, payload}` — no `success` key,
// unlike most other endpoints — so it gets its own response shape here.
interface UserDashboardResponse {
  message: string;
  payload: ClientDashboardData;
}

export function getClientDashboard(userId: string): Promise<UserDashboardResponse> {
  return api.get<UserDashboardResponse>(`/user/dashboard/${userId}`);
}
