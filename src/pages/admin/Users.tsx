import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShieldBan, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  listAdminCustomers,
  updateCustomerActiveStatus,
  type AdminCustomer } from
'../../services/admin/customerServices';
import { formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const PAGE_SIZE = 10;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export function UsersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'true' | 'false'>('all');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      listAdminCustomers({ search, isActive: status, page, limit: PAGE_SIZE }).
      then((res) => {
        setCustomers(res.data);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages);
      }).
      catch((err) => toast.error(errorMessage(err, 'Could not load customers.'))).
      finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, status, page]);

  const handleToggleActive = async (customer: AdminCustomer) => {
    setUpdatingId(customer.id);
    try {
      const updated = await updateCustomerActiveStatus(customer.id, !customer.isActive);
      setCustomers((prev) => prev.map((c) => c.id === updated.id ? updated : c));
      toast.success(`${customer.fullName} ${updated.isActive ? 'reinstated' : 'suspended'}.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update this account.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: Column<AdminCustomer>[] = [
  {
    key: 'user',
    header: 'User',
    render: (u) =>
    <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-600">
            {initials(u.fullName)}
          </span>
          <div>
            <p className="font-medium text-ink-950">{u.fullName}</p>
            <p className="text-xs text-ink-500">{u.email}</p>
          </div>
        </div>

  },
  {
    key: 'contact',
    header: 'Contact',
    render: (u) =>
    <div>
          <p>{u.city || '—'}</p>
          <p className="text-xs text-ink-500">{u.phoneNumber || '—'}</p>
        </div>

  },
  { key: 'joined', header: 'Joined', render: (u) => formatDate(u.createdAt) },
  {
    key: 'verified',
    header: 'Email',
    render: (u) => <Badge tone={u.isEmailVerified ? 'success' : 'warning'}>{u.isEmailVerified ? 'Verified' : 'Unverified'}</Badge>
  },
  {
    key: 'status',
    header: 'Status',
    render: (u) => <Badge tone={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Suspended'}</Badge>
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '140px',
    render: (u) =>
    <div onClick={(e) => e.stopPropagation()}>
          {u.isActive ?
      <Button
        size="sm"
        variant="ghost"
        disabled={updatingId === u.id}
        icon={<ShieldBan className="h-3.5 w-3.5" />}
        onClick={() => handleToggleActive(u)}>

              Suspend
            </Button> :

      <Button
        size="sm"
        variant="ghost"
        disabled={updatingId === u.id}
        icon={<ShieldCheck className="h-3.5 w-3.5" />}
        onClick={() => handleToggleActive(u)}>

              Reinstate
            </Button>
      }
        </div>

  }];


  return (
    <div>
      <PageHeader
        title="Customers"
        description="Review customer accounts and manage access." />


      <Card>
        <CardHeader title="All customers" description={`${total} registered customer${total === 1 ? '' : 's'}`} />
        <Toolbar
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search name, email, phone or city…">

          <FilterSelect
            label="Status filter"
            value={status}
            onChange={(v) => {
              setStatus(v as 'all' | 'true' | 'false');
              setPage(1);
            }}
            options={[
            { value: 'all', label: 'All statuses' },
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Suspended' }]
            } />

        </Toolbar>
        <DataTable
          columns={columns}
          rows={customers}
          rowKey={(u) => u.id}
          onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
          emptyTitle={loading ? 'Loading customers…' : 'No customers found'}
          emptyDescription={loading ? 'Fetching customer accounts.' : 'Adjust your filters to find what you\'re looking for.'} />

        {totalPages > 1 &&
        <div className="flex items-center justify-between border-t border-ink-200 px-5 py-3">
            <p className="text-xs text-ink-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft className="h-4 w-4" />}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}>

                Prev
              </Button>
              <Button
              variant="secondary"
              size="sm"
              icon={<ChevronRight className="h-4 w-4" />}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>

                Next
              </Button>
            </div>
          </div>
        }
      </Card>
    </div>);

}
