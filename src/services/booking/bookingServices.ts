import { api, type ApiItemResponse } from '../../config/api';

export interface BookingPartyRef {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  profilePic?: string;
}

export interface BookingServiceRef {
  id: string;
  name: string;
  description?: string;
}

export interface BookingTimelineEntry {
  status: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface BookingPricingSnapshot {
  baseChefFeeMinor: number;
  estimatedTotalMinor: number;
  currency: string;
  baseChefFee: number;
  estimatedTotal: number;
}

export interface BookingProcurement {
  option?: 'customer' | 'chef';
  estimatedIngredientCostMinor?: number;
  finalIngredientCostMinor?: number;
  procurementFeeMinor?: number;
}

export interface BookingMenuSelection {
  source?: 'chef' | 'customer';
  chefMenuId?: string;
  uploadedMenuUrl?: string;
  uploadedMenuType?: string;
}

export interface BookingComment {
  text: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
}

export interface BookingPaymentDetails {
  mode: 'Cash' | 'Transfer';
  transactionRef: string;
  bankName?: string;
  accountNumber?: string;
  amount: number;
  date: string;
  recordedBy: string;
  recordedAt: string;
}

// Shared detail shape rendered by the admin/chef/customer "view booking" pages —
// each page presents this differently, but it's the same underlying booking.
export interface BookingDetail {
  id: string;
  bookingNumber: string;
  workflow?: string;
  bookingType?: string;
  modeOfPayment?: string;
  status: string;
  paymentStatus: string;
  customer: BookingPartyRef | null;
  chef: BookingPartyRef | null;
  service: BookingServiceRef | null;
  bookingData: Record<string, any>;
  pricingSnapshot?: BookingPricingSnapshot;
  procurement?: BookingProcurement;
  menuSelection?: BookingMenuSelection;
  menuSelectionType?: string;
  timeline?: BookingTimelineEntry[];
  comments?: BookingComment[];
  paymentDetails?: BookingPaymentDetails;
  transactnRef?: string;
  quotationId?: string;
  date: string;
  guests: number | null;
  createdAt: string;
  updatedAt: string;
}

export function getBookingDetail(id: string): Promise<ApiItemResponse<BookingDetail>> {
  return api.get<ApiItemResponse<BookingDetail>>(`/bookings/${id}`);
}
