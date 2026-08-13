import { api, type ApiItemResponse, type ApiListResponse } from '../../config/api';

export interface ProcurementItemInput {
  title: string;
  description?: string;
  amount: number;
}

export interface ProcurementRecord {
  id: string;
  bookingId: string;
  items: ProcurementItemInput[];
  totalCost: number;
  isProcurementPaid?: boolean;
  paymentChannel?: 'paystack' | 'transfer';
  paymentReference?: string;
  createdAt: string;
}

export function listBookingProcurements(bookingId: string): Promise<ApiListResponse<ProcurementRecord>> {
  return api.get<ApiListResponse<ProcurementRecord>>(`/procurements?bookingId=${bookingId}`);
}

export function createBookingProcurement(
bookingId: string,
items: ProcurementItemInput[])
: Promise<ApiItemResponse<ProcurementRecord>> {
  return api.post<ApiItemResponse<ProcurementRecord>>('/procurement/create', { bookingId, items });
}
