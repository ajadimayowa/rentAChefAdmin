import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  HeartPulse,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldBan,
  ShieldCheck,
  UserRound } from
'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  getCustomer,
  getCustomerDashboard,
  updateCustomerActiveStatus,
  type CustomerDashboard,
  type CustomerDetail } from
'../../services/admin/customerServices';
import { bookingStatusTone } from '../../utils/bookingStatus';
import { convertToThousand, formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

function StatCard({ label, value }: {label: string;value: React.ReactNode;}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-2 font-heading text-2xl font-semibold text-ink-950">{value}</p>
    </Card>);

}

function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export function ViewCustomerPage() {
  const { id } = useParams<{id: string;}>();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [dashboard, setDashboard] = useState<CustomerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getCustomer(id), getCustomerDashboard(id)]).
    then(([customerRes, dashboardRes]) => {
      setCustomer(customerRes);
      setDashboard(dashboardRes);
    }).
    catch((err) => toast.error(errorMessage(err, 'Could not load this customer.'))).
    finally(() => setLoading(false));
  }, [id]);

  const handleToggleActive = async () => {
    if (!customer) return;
    setUpdating(true);
    try {
      const updated = await updateCustomerActiveStatus(customer.id, !customer.isActive);
      setCustomer((prev) => prev ? { ...prev, isActive: updated.isActive } : prev);
      toast.success(`${customer.fullName} ${updated.isActive ? 'reinstated' : 'suspended'}.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update this account.'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        <p className="mt-3 text-sm text-ink-500">Loading customer…</p>
      </div>);

  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-heading text-lg font-semibold text-ink-900">Customer not found</p>
        <p className="mt-1 text-sm text-ink-500">This account may have been removed.</p>
        <Link to="/admin/users" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-buttons">
          <ArrowLeft className="h-4 w-4" /> Back to customers
        </Link>
      </div>);

  }

  const allergies = customer.healthInformation?.allergies ?? [];

  return (
    <div>
      <Link
        to="/admin/users"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">

        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Link>

      <PageHeader
        title={customer.fullName}
        description={`Joined ${formatDate(customer.createdAt)}`}
        action={
        customer.isActive ?
        <Button
          variant="secondary"
          icon={<ShieldBan className="h-4 w-4" />}
          disabled={updating}
          onClick={handleToggleActive}>

              Suspend
            </Button> :

        <Button icon={<ShieldCheck className="h-4 w-4" />} disabled={updating} onClick={handleToggleActive}>
              Reinstate
            </Button>

        } />


      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total bookings" value={dashboard?.metrics.totalBookings ?? 0} />
        <StatCard label="Upcoming" value={dashboard?.metrics.upcomingBookings ?? 0} />
        <StatCard label="Lifetime spend" value={convertToThousand(dashboard?.metrics.lifetimeSpend ?? 0)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Profile" />
            <div className="flex flex-col gap-5 p-5 sm:flex-row">
              {customer.profilePic ?
              <img
                src={customer.profilePic}
                alt=""
                className="h-24 w-24 shrink-0 rounded-xl border border-ink-200 object-cover" /> :


              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-ink-100 font-heading text-2xl font-semibold text-ink-500">
                  {initials(customer.fullName)}
                </span>
              }
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={customer.isActive ? 'success' : 'danger'}>{customer.isActive ? 'Active' : 'Suspended'}</Badge>
                  {customer.isEmailVerified ?
                  <Badge tone="success">
                      <BadgeCheck className="mr-1 h-3 w-3" /> Email verified
                    </Badge> :

                  <Badge tone="warning">Email not verified</Badge>
                  }
                  {customer.maritalStatus && <Badge tone="neutral">{customer.maritalStatus}</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-700">
                  <UserRound className="h-4 w-4 shrink-0 text-ink-400" />
                  <span>{customer.gender || 'Gender not specified'}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Upcoming bookings" description="Next 5 bookings not yet completed or cancelled" />
            {dashboard && dashboard.upcomingBookings.length > 0 ?
            <ul className="divide-y divide-ink-100">
                {dashboard.upcomingBookings.map((b) =>
              <li key={b.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div>
                      <p className="font-medium text-ink-900">{b.bookingNumber}</p>
                      <p className="text-xs text-ink-500">
                        {b.serviceName} · Chef {b.chefName}
                        {b.guests != null ? ` · ${b.guests} guests` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge tone={bookingStatusTone(b.status)}>{b.status}</Badge>
                      <p className="mt-1 text-xs text-ink-400">{formatDate(b.date)}</p>
                    </div>
                  </li>
              )}
              </ul> :

            <p className="px-5 py-6 text-sm text-ink-500">No upcoming bookings.</p>
            }
          </Card>

          {allergies.length > 0 || customer.healthInformation?.healthDetails ?
          <Card>
              <CardHeader title="Health information" action={<HeartPulse className="h-4 w-4 text-ink-300" />} />
              <div className="space-y-3 p-5 text-sm">
                {allergies.length > 0 &&
              <div>
                    <p className="text-xs text-ink-400">Allergies</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {allergies.map((a) => <Badge key={a} tone="warning">{a}</Badge>)}
                    </div>
                  </div>
              }
                {customer.healthInformation?.healthDetails &&
              <div>
                    <p className="text-xs text-ink-400">Details</p>
                    <p className="mt-0.5 text-ink-800">{customer.healthInformation.healthDetails}</p>
                  </div>
              }
              </div>
            </Card> :
          null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Contact" />
            <div className="space-y-3 p-5 text-sm">
              <div className="flex items-center gap-2 text-ink-700">
                <Mail className="h-4 w-4 shrink-0 text-ink-400" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <Phone className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{customer.phoneNumber || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <MapPin className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{[customer.address?.city, customer.address?.stateName].filter(Boolean).join(', ') || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <Calendar className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{customer.dob ? formatDate(customer.dob) : 'Date of birth not specified'}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Identity verification" />
            <div className="space-y-2 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">ID type</span>
                <span className="font-medium text-ink-900">{customer.kyc?.idType || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">ID number</span>
                <span className="font-medium text-ink-900">{customer.kyc?.idNumber || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500">Status</span>
                <Badge tone={customer.kyc?.isVerified ? 'success' : 'warning'}>
                  {customer.kyc?.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Next of kin" />
            {customer.nok?.fullName ?
            <div className="space-y-2 p-5 text-sm">
                <p className="font-medium text-ink-900">{customer.nok.fullName}</p>
                {customer.nok.relationship && <p className="text-ink-600">{customer.nok.relationship}</p>}
                {customer.nok.phone &&
              <div className="flex items-center gap-2 text-ink-600">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-ink-400" /> {customer.nok.phone}
                  </div>
              }
              </div> :

            <p className="px-5 py-6 text-sm text-ink-500">No next of kin on file.</p>
            }
          </Card>
        </div>
      </div>
    </div>);

}
