import { api } from '../../config/api';
import type { ProcurementRecord } from '../admin/procurementServices';

interface PaystackInitResponse {
  status: boolean;
  message?: string;
  data?: {authorization_url: string;reference: string;};
}

/**
 * Starts a Paystack checkout for a procurement. Paystack sends the client back to
 * `callbackUrl` with `?reference=` appended, where the page confirms the payment.
 */
export async function startProcurementPayment(email: string, amount: number, callbackUrl: string): Promise<string> {
  const res = await api.post<PaystackInitResponse>('/payment/initialize-payment', {
    email,
    amount,
    callback_url: callbackUrl
  });
  const url = res.data?.authorization_url;
  if (!url) throw new Error(res.message || 'Could not start the payment.');
  return url;
}

/**
 * Backend verifies the reference with Paystack and marks every listed unpaid
 * procurement paid — the client pays the outstanding total in one payment.
 */
export async function confirmOutstandingProcurementPayment(
bookingId: string,
procurementIds: string[],
reference: string)
: Promise<ProcurementRecord[]> {
  const res = await api.post<{success: boolean;payload: ProcurementRecord[];}>('/procurements/pay', {
    bookingId,
    procurementIds,
    paymentReference: reference
  });
  return res.payload;
}
