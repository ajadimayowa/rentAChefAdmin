import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  ChefHat,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldBan,
  ShieldCheck,
  Star,
  Trash2,
  UtensilsCrossed } from
'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge, statusTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatDate, titleCase } from '../../utils/format';
import type { ApprovalStatus } from '../../types';
import { ApiError } from '../../config/api';
import { deleteChef, getChef, updateChefStatus, type ChefDetail } from '../../services/admin/adminServices';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

function StatCard({ label, value }: {label: string;value: React.ReactNode;}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-2 font-heading text-2xl font-semibold text-ink-950">{value}</p>
    </Card>);

}

export function ViewChefPage() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const [chef, setChef] = useState<ChefDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getChef(id).
    then((res) => setChef(res.payload)).
    catch((err) => toast.error(errorMessage(err, 'Could not load this chef.'))).
    finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (next: ApprovalStatus) => {
    if (!chef) return;
    setStatusUpdating(true);
    try {
      const res = await updateChefStatus(chef.id, next);
      setChef((prev) => prev ? { ...prev, ...res.payload } : prev);
      if (next === 'approved') {
        toast.success(`${chef.name} has been approved. A verification email has been sent to ${chef.email}.`);
      } else {
        toast.success(`${chef.name} has been ${next}.`);
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update chef status.'));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!chef) return;
    setDeleting(true);
    try {
      await deleteChef(chef.id);
      toast.success(`${chef.name} was removed from the roster.`);
      navigate('/admin/chefs');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove chef.'));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        <p className="mt-3 text-sm text-ink-500">Loading chef…</p>
      </div>);

  }

  if (!chef) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-heading text-lg font-semibold text-ink-900">Chef not found</p>
        <p className="mt-1 text-sm text-ink-500">This chef may have been removed.</p>
        <Link to="/admin/chefs" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-buttons">
          <ArrowLeft className="h-4 w-4" /> Back to chefs
        </Link>
      </div>);

  }

  return (
    <div>
      <Link
        to="/admin/chefs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">

        <ArrowLeft className="h-4 w-4" /> Back to chefs
      </Link>

      <PageHeader
        title={chef.name}
        description={`Staff ID ${chef.staffId || '—'} · Joined ${formatDate(chef.joinedAt)}`}
        action={
        <div className="flex flex-wrap items-center gap-2">
            {chef.status === 'pending' &&
          <Button
            icon={<Check className="h-4 w-4" />}
            disabled={statusUpdating}
            onClick={() => handleStatusChange('approved')}>

                Approve
              </Button>
          }
            {chef.status === 'approved' &&
          <Button
            variant="secondary"
            icon={<ShieldBan className="h-4 w-4" />}
            disabled={statusUpdating}
            onClick={() => handleStatusChange('suspended')}>

                Suspend
              </Button>
          }
            {(chef.status === 'suspended' || chef.status === 'rejected') &&
          <Button
            variant="secondary"
            icon={<ShieldCheck className="h-4 w-4" />}
            disabled={statusUpdating}
            onClick={() => handleStatusChange('approved')}>

                Reinstate
              </Button>
          }
            <Button
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => setConfirmDelete(true)}>

              Remove
            </Button>
          </div>
        } />


      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total bookings" value={chef.totalBookings} />
        <StatCard label="Completed" value={chef.completedBookings} />
        <StatCard label="Upcoming" value={chef.upcomingBookings} />
        <StatCard
          label="Rating"
          value={
          <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-buttons text-buttons" />
              {chef.rating || '—'}
            </span>
          } />

      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Profile" />
            <div className="flex flex-col gap-5 p-5 sm:flex-row">
              <img
                src={chef.avatar}
                alt=""
                className="h-24 w-24 shrink-0 rounded-xl border border-ink-200 object-cover" />

              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(chef.status)}>{titleCase(chef.status)}</Badge>
                  <Badge tone="brand">{chef.chefLevel?.name || 'No chef level'}</Badge>
                  {chef.isEmailVerified ?
                  <Badge tone="success">
                      <BadgeCheck className="mr-1 h-3 w-3" /> Email verified
                    </Badge> :

                  <Badge tone="warning">Email not verified</Badge>
                  }
                </div>
                <p className="text-sm leading-relaxed text-ink-600">{chef.bio || 'No bio added yet.'}</p>
                {chef.specialties.length > 0 &&
                <div className="flex flex-wrap gap-1.5">
                    {chef.specialties.map((s) =>
                  <Badge key={s} tone="neutral">{s}</Badge>
                  )}
                  </div>
                }
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Services offered" />
            <div className="flex flex-wrap gap-1.5 p-5">
              {chef.services.length > 0 ?
              chef.services.map((s) =>
              <Badge key={s.id} tone="info">
                    <UtensilsCrossed className="mr-1 h-3 w-3" /> {s.name}
                  </Badge>
              ) :

              <p className="text-sm text-ink-500">No services assigned yet.</p>
              }
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent menus" description="Last 3 menus created by this chef" />
            {chef.recentMenus.length > 0 ?
            <ul className="divide-y divide-ink-100">
                {chef.recentMenus.map((m) =>
              <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div>
                      <p className="font-medium text-ink-900">{m.title}</p>
                      <p className="text-xs text-ink-500">
                        {[m.menuType, m.menuClass].filter((v): v is string => Boolean(v)).map(titleCase).join(' · ') || '—'}
                        {m.isSignatureMenu ? ' · Signature' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-ink-900">₦{m.pricePerHead.toLocaleString()}/head</p>
                      <p className="text-xs text-ink-400">{m.createdAt ? formatDate(m.createdAt) : '—'}</p>
                    </div>
                  </li>
              )}
              </ul> :

            <p className="px-5 py-6 text-sm text-ink-500">No menus created yet.</p>
            }
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Contact" />
            <div className="space-y-3 p-5 text-sm">
              <div className="flex items-center gap-2 text-ink-700">
                <Mail className="h-4 w-4 shrink-0 text-ink-400" />
                <span className="truncate">{chef.email}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <Phone className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{chef.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <MapPin className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{[chef.city, chef.state.stateName].filter(Boolean).join(', ') || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <ChefHat className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{chef.gender || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <Calendar className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{chef.dob ? formatDate(chef.dob) : '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <Clock className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{chef.yearsOfExperience} years experience</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Identity verification" />
            <div className="space-y-2 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">ID type</span>
                <span className="font-medium text-ink-900">{chef.kyc?.idType || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">ID number</span>
                <span className="font-medium text-ink-900">{chef.kyc?.idNumber || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500">Status</span>
                <Badge tone={chef.kyc?.isVerified ? 'success' : 'warning'}>
                  {chef.kyc?.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </Card>

          {chef.certifications && chef.certifications.length > 0 &&
          <Card>
              <CardHeader title="Certifications" />
              <div className="flex flex-wrap gap-1.5 p-5">
                {chef.certifications.map((c) =>
              <Badge key={c} tone="neutral">{c}</Badge>
              )}
              </div>
            </Card>
          }
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Remove chef"
        message={`Remove ${chef.name} from the roster? Any upcoming bookings will need reassignment.`}
        confirmLabel={deleting ? 'Removing…' : 'Remove'}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)} />

    </div>);

}
