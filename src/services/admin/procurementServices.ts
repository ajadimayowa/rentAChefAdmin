import { api, type ApiItemResponse, type ApiListResponse } from '../../config/api';
import { MAX_UPLOAD_BYTES } from '../../utils/compressImage';

export interface ProcurementItemInput {
  title: string;
  description?: string;
  amount: number;
}

export interface ProcurementRecord {
  id: string;
  bookingId: string;
  /** Only on older itemised procurements; new ones are a PDF + total. */
  items: ProcurementItemInput[];
  totalCost: number;
  documentUrl?: string;
  documentName?: string;
  isProcurementPaid?: boolean;
  paymentChannel?: 'paystack' | 'transfer';
  paymentReference?: string;
  createdAt: string;
}

export function listBookingProcurements(bookingId: string): Promise<ApiListResponse<ProcurementRecord>> {
  return api.get<ApiListResponse<ProcurementRecord>>(`/procurements?bookingId=${bookingId}`);
}

/** Max PDF size — matches the backend limit. */
export const PROCUREMENT_PDF_MAX_BYTES = MAX_UPLOAD_BYTES;

/** Uploads the procurement PDF with the total the client must pay (Naira). */
export function createBookingProcurement(
bookingId: string,
pdf: File,
totalAmount: string)
: Promise<ApiItemResponse<ProcurementRecord>> {
  const form = new FormData();
  form.append('bookingId', bookingId);
  form.append('totalAmount', totalAmount);
  form.append('procurementPdf', pdf);
  return api.post<ApiItemResponse<ProcurementRecord>>('/procurement/create', form);
}

/** Admin only, and only while the procurement is unpaid. */
export function deleteBookingProcurement(id: string): Promise<{success: boolean;message: string;}> {
  return api.delete<{success: boolean;message: string;}>(`/procurement/${id}`);
}

export interface ProcurementTotals {
  /** The booking's procurement price: the sum of every procurement added. */
  total: number;
  paid: number;
  outstanding: number;
  unpaid: ProcurementRecord[];
}

export function procurementTotals(records: ProcurementRecord[]): ProcurementTotals {
  const unpaid = records.filter((r) => !r.isProcurementPaid);
  const sum = (list: ProcurementRecord[]) => list.reduce((acc, r) => acc + (Number(r.totalCost) || 0), 0);
  const total = sum(records);
  const outstanding = sum(unpaid);
  return { total, paid: total - outstanding, outstanding, unpaid };
}
