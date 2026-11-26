import { api, type ApiMessageResponse } from '../../config/api';
import { PROCUREMENT_PDF_MAX_BYTES } from './procurementServices';

/** Same 2 MB cap as every other upload. */
export const INVOICE_PDF_MAX_BYTES = PROCUREMENT_PDF_MAX_BYTES;

export interface InvoiceRecord {
  id: string;
  bookingId: string;
  /** Naira the client must pay. */
  amount: number;
  documentUrl: string;
  documentName?: string;
  isPaid: boolean;
  paidAt?: string;
  paymentReference?: string;
  createdAt: string;
}

export const mapInvoice = (raw: any): InvoiceRecord => ({
  id: String(raw.id ?? raw._id),
  bookingId: String(raw.bookingId ?? ''),
  amount: Number(raw.amount ?? 0),
  documentUrl: String(raw.documentUrl ?? ''),
  documentName: raw.documentName || undefined,
  isPaid: Boolean(raw.isPaid),
  paidAt: raw.paidAt || undefined,
  paymentReference: raw.paymentReference || undefined,
  createdAt: String(raw.createdAt ?? '')
});

/** Uploads the invoice PDF with its amount; the client is notified. */
export async function createBookingInvoice(bookingId: string, pdf: File, amount: string): Promise<InvoiceRecord> {
  const form = new FormData();
  form.append('bookingId', bookingId);
  form.append('amount', amount);
  form.append('invoicePdf', pdf);
  const res = await api.post<{success: boolean;payload: unknown;}>('/invoice/create', form);
  return mapInvoice(res.payload);
}

/** Only unpaid invoices can be deleted. */
export function deleteBookingInvoice(id: string): Promise<ApiMessageResponse> {
  return api.delete<ApiMessageResponse>(`/invoice/${id}`);
}
