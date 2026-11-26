import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, ChefHat, Clock, CreditCard, FileText, Loader2, Mail, Phone, ShoppingCart, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ProcurementDocumentActions } from '../../components/procurement/ProcurementDocumentActions';
import { useAuthStore } from '../../store/authStore';
import {
  confirmInvoicePayment,
  confirmOutstandingProcurementPayment,
  startProcurementPayment } from
'../../services/client/procurementPaymentServices';
import { procurementTotals } from '../../services/admin/procurementServices';
import { ProcurementTotalsSummary } from '../../components/procurement/ProcurementTotalsSummary';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getBookingDetail, type BookingDetail } from '../../services/booking/bookingServices';
import { bookingStatusTone } from '../../utils/bookingStatus';
import { convertToThousand, formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';
import { mapInvoice } from '../../services/admin/invoiceServices';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const humanizeKey = (key: string): string =>
key.
replace(/([a-z0-9])([A-Z])/g, '$1 $2').
replace(/^./, (c) => c.toUpperCase());

const renderValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export function ViewBookingPage() {
  const { id } = useParams<{id: string;}>();
  const [searchParams, setSearchParams] = useSearchParams();
  const email = useAuthStore((s) => s.user?.email);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const confirmedRef = useRef<string | null>(null);

  const load = useCallback(() => {
    if (!id) return Promise.resolve();
    return getBookingDetail(id).
    then((res) => setBooking(res.payload)).
    catch((err) => toast.error(errorMessage(err, 'Could not load this booking.')));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  // Back from Paystack for an invoice: ?invoice=<id>&reference=<ref> — confirm it once, then tidy the URL.
  useEffect(() => {
    const invoiceId = searchParams.get('invoice');
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!id || !invoiceId || !reference || confirmedRef.current === reference) return;
    confirmedRef.current = reference;
    confirmInvoicePayment(invoiceId, reference).
    then(() => {
      toast.success('Invoice paid. Thank you!');
      load();
    }).
    catch((err) => toast.error(err instanceof ApiError ? err.message : 'Could not confirm your invoice payment.')).
    finally(() => setSearchParams({}, { replace: true }));
  }, [id, searchParams, setSearchParams, load]);

  const payInvoice = async (invoice: {id: string;amount: number;}) => {
    if (!id) return;
    if (!email) {
      toast.error('Your account has no email address for the payment receipt.');
      return;
    }
    setPayingInvoiceId(invoice.id);
    try {
      const callback = `${window.location.origin}/client/bookings/${id}?invoice=${invoice.id}`;
      window.location.assign(await startProcurementPayment(email, invoice.amount, callback));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not start the payment.');
      setPayingInvoiceId(null);
    }
  };

  // Back from Paystack: ?procurements=<id,id>&reference=<ref> — confirm it once, then tidy the URL.
  useEffect(() => {
    const procurementIds = (searchParams.get('procurements') || '').split(',').filter(Boolean);
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!id || !procurementIds.length || !reference || confirmedRef.current === reference) return;
    confirmedRef.current = reference;
    setPaying(true);
    confirmOutstandingProcurementPayment(id, procurementIds, reference).
    then(() => {
      toast.success('Procurement payment successful.');
      return load();
    }).
    catch((err) => toast.error(errorMessage(err, 'We could not confirm this payment. Contact support if you were charged.'))).
    finally(() => {
      setPaying(false);
      setSearchParams({}, { replace: true });
    });
  }, [id, searchParams, setSearchParams, load]);

  /** One Paystack payment for the outstanding procurement total (every unpaid procurement). */
  const payOutstanding = async () => {
    if (!booking || !email) {
      if (!email) toast.error('Your account has no email address for the payment receipt.');
      return;
    }
    const { unpaid, outstanding } = procurementTotals(booking.procurements ?? []);
    if (!unpaid.length || outstanding <= 0) return;
    setPaying(true);
    try {
      const ids = unpaid.map((r) => r.id).join(',');
      const callback = `${window.location.origin}/client/bookings/${id}?procurements=${ids}`;
      window.location.assign(await startProcurementPayment(email, outstanding, callback));
    } catch (err) {
      toast.error(errorMessage(err, err instanceof Error ? err.message : 'Could not start the payment.'));
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        <p className="mt-3 text-sm text-ink-500">Loading booking…</p>
      </div>);

  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-heading text-lg font-semibold text-ink-900">Booking not found</p>
        <Link to="/client" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-buttons">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      </div>);

  }

  const bookingDataEntries = Object.entries(booking.bookingData || {});
  const procurements = booking.procurements ?? [];
  const { outstanding } = procurementTotals(procurements);
  const invoices = (booking.invoices ?? []).map(mapInvoice);

  return (
    <div>
      <Link
        to="/client"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">

        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <PageHeader
        title={booking.bookingNumber}
        description={`${booking.workflow || 'Booking'} · Created ${formatDate(booking.createdAt)}`}
        action={<Badge tone={bookingStatusTone(booking.status)}>{booking.status}</Badge>} />


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {invoices.length > 0 &&
          <Card>
              <CardHeader
              title="Invoices"
              description="Invoices from our team for this booking. View or download them anytime."
              action={<FileText className="h-4 w-4 text-ink-300" />} />

              <ul className="divide-y divide-ink-100">
                {invoices.map((invoice) =>
              <li key={invoice.id} className="space-y-3 px-5 py-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Badge tone={invoice.isPaid ? 'success' : 'warning'}>{invoice.isPaid ? 'Paid' : 'Awaiting payment'}</Badge>
                        <p className="mt-1 text-xs text-ink-400">Added {formatDate(invoice.createdAt)}</p>
                      </div>
                      <span className="font-heading text-base font-semibold text-ink-950">{convertToThousand(invoice.amount)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {invoice.documentUrl ? <ProcurementDocumentActions url={invoice.documentUrl} name={invoice.documentName} /> : null}
                      {invoice.isPaid ? null :
                  <Button size="sm" disabled={Boolean(payingInvoiceId)} onClick={() => payInvoice(invoice)}>
                          {payingInvoiceId === invoice.id ? 'Processing…' : `Pay ${convertToThousand(invoice.amount)}`}
                        </Button>
                  }
                    </div>
                  </li>
              )}
              </ul>
            </Card>
          }

          {procurements.length > 0 &&
          <Card>
              <CardHeader
              title="Procurement"
              description="Ingredients and supplies for your booking. The procurement price is the total of everything added below."
              action={<ShoppingCart className="h-4 w-4 text-ink-300" />} />

              <ProcurementTotalsSummary records={procurements} />
              {outstanding > 0 ?
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-amber-50/60 px-5 py-3 text-sm">
                  <p className="text-ink-700">View the documents below, then pay the outstanding amount.</p>
                  <Button
                icon={paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                disabled={paying}
                onClick={payOutstanding}>

                    {paying ? 'Processing…' : `Pay ${convertToThousand(outstanding)}`}
                  </Button>
                </div> :
            null}

              <ul className="divide-y divide-ink-100">
                {procurements.map((record) =>
              <li key={record.id} className="space-y-3 p-5 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-ink-400">Added {formatDate(record.createdAt)}</p>
                        <p className="font-heading text-base font-semibold text-ink-950">{convertToThousand(record.totalCost)}</p>
                      </div>
                      <Badge tone={record.isProcurementPaid ? 'success' : 'warning'}>
                        {record.isProcurementPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </div>
                    {record.documentUrl ?
                <ProcurementDocumentActions url={record.documentUrl} name={record.documentName} /> :
                record.items?.length ?
                <ul className="space-y-1">
                        {record.items.map((item, i) =>
                  <li key={i} className="flex justify-between gap-3 text-ink-700">
                            <span>{item.title}</span>
                            <span className="font-medium text-ink-900">{convertToThousand(item.amount)}</span>
                          </li>
                  )}
                      </ul> :
                null}
                  </li>
              )}
              </ul>
            </Card>
          }

          <Card>
            <CardHeader title="Booking details" />
            <div className="grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-ink-700">
                <Calendar className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{formatDate(booking.date)}</span>
              </div>
              {booking.guests != null &&
              <div className="flex items-center gap-2 text-ink-700">
                  <Users className="h-4 w-4 shrink-0 text-ink-400" />
                  <span>{booking.guests} guests</span>
                </div>
              }
              {booking.bookingType &&
              <div className="flex items-center gap-2 text-ink-700">
                  <Clock className="h-4 w-4 shrink-0 text-ink-400" />
                  <span>{booking.bookingType}</span>
                </div>
              }
            </div>
          </Card>

          {bookingDataEntries.length > 0 &&
          <Card>
              <CardHeader title="Your request" />
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-2">
                {bookingDataEntries.map(([key, value]) =>
              <div key={key}>
                    <dt className="text-xs text-ink-400">{humanizeKey(key)}</dt>
                    <dd className="mt-0.5 break-words text-ink-800">{renderValue(value)}</dd>
                  </div>
              )}
              </dl>
            </Card>
          }
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Your chef" />
            {booking.chef ?
            <div className="space-y-2 p-5 text-sm">
                <p className="inline-flex items-center gap-1.5 font-medium text-ink-900">
                  <ChefHat className="h-3.5 w-3.5" /> {booking.chef.fullName}
                </p>
                {booking.chef.email &&
              <div className="flex items-center gap-2 text-ink-600">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-ink-400" /> {booking.chef.email}
                  </div>
              }
                {booking.chef.phoneNumber &&
              <div className="flex items-center gap-2 text-ink-600">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-ink-400" /> {booking.chef.phoneNumber}
                  </div>
              }
              </div> :

            <p className="px-5 py-6 text-sm text-ink-500">A chef hasn't been assigned yet.</p>
            }
          </Card>

          <Card>
            <CardHeader title="Service" />
            <div className="space-y-1 p-5 text-sm">
              <p className="font-medium text-ink-900">{booking.service?.name || '—'}</p>
              {booking.service?.description &&
              <p className="text-ink-500">{booking.service.description}</p>
              }
            </div>
          </Card>

          <Card>
            <CardHeader title="Payment" />
            <div className="space-y-2 p-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-500">Status</span>
                <Badge tone={booking.paymentStatus === 'Paid' ? 'success' : 'neutral'}>
                  {booking.paymentStatus}
                </Badge>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-2">
                <span className="font-medium text-ink-900">Total</span>
                <span className="font-heading text-base font-semibold text-ink-950">
                  {convertToThousand(booking.pricingSnapshot?.estimatedTotal ?? 0)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>);

}
