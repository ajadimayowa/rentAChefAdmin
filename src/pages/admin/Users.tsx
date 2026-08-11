import React, { useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Check, Plus, ShieldBan, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge, statusTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RowActions } from '../../components/ui/RowActions';
import { FormGrid, SelectField, TextField } from '../../components/form/Fields';
import { useAdminData } from '../../contexts/AdminDataContext';
import { formatCurrency, formatDate, titleCase, uid } from '../../utils/format';
import type { AppUser } from '../../types';

const schema = Yup.object({
  name: Yup.string().required('Full name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required').min(7, 'Too short'),
  city: Yup.string().required('City is required'),
  status: Yup.string().required('Select a status')
});

const emptyUser: AppUser = {
  id: '',
  name: '',
  email: '',
  phone: '',
  city: '',
  status: 'pending',
  bookings: 0,
  lifetimeValue: 0,
  joinedAt: new Date().toISOString().slice(0, 10)
};

export function UsersPage() {
  const { users, saveUser, removeUser, setUserStatus } = useAdminData();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState<AppUser | null>(null);

  const rows = useMemo(
    () =>
    users.filter(
      (u) =>
      (status === 'all' || u.status === status) && (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.city.toLowerCase().includes(search.toLowerCase()))
    ),
    [users, search, status]
  );

  const columns: Column<AppUser>[] = [
  {
    key: 'user',
    header: 'User',
    render: (u) =>
    <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-600">
            {u.name.
        split(' ').
        map((n) => n[0]).
        join('')}
          </span>
          <div>
            <p className="font-medium text-ink-950">{u.name}</p>
            <p className="text-xs text-ink-500">{u.email}</p>
          </div>
        </div>

  },
  {
    key: 'location',
    header: 'Location',
    render: (u) =>
    <div>
          <p>{u.city}</p>
          <p className="text-xs text-ink-500">{u.phone}</p>
        </div>

  },
  { key: 'joined', header: 'Joined', render: (u) => formatDate(u.joinedAt) },
  { key: 'bookings', header: 'Bookings', align: 'center', render: (u) => u.bookings },
  {
    key: 'ltv',
    header: 'Lifetime value',
    align: 'right',
    render: (u) => <span className="font-medium">{formatCurrency(u.lifetimeValue)}</span>
  },
  {
    key: 'status',
    header: 'Status',
    render: (u) => <Badge tone={statusTone(u.status)}>{titleCase(u.status)}</Badge>
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '190px',
    render: (u) =>
    <RowActions
      onEdit={() => setEditing(u)}
      onDelete={() => setDeleting(u)}
      extra={
      u.status === 'pending' ?
      <Button
        size="sm"
        icon={<Check className="h-3.5 w-3.5" />}
        onClick={() => setUserStatus(u.id, 'approved')}>
        
                Approve
              </Button> :
      u.status === 'approved' ?
      <Button
        size="sm"
        variant="ghost"
        icon={<ShieldBan className="h-3.5 w-3.5" />}
        onClick={() => setUserStatus(u.id, 'suspended')}>
        
                Suspend
              </Button> :

      <Button
        size="sm"
        variant="ghost"
        icon={<ShieldCheck className="h-3.5 w-3.5" />}
        onClick={() => setUserStatus(u.id, 'approved')}>
        
                Reinstate
              </Button>

      } />


  }];


  const pending = users.filter((u) => u.status === 'pending');

  return (
    <div>
      <PageHeader
        title="Users"
        description="Review registrations, approve accounts and manage customer records."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyUser)}>
            Add user
          </Button>
        } />
      

      {pending.length > 0 ?
      <Card className="mb-6 border-buttons/40 bg-buttons/5">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-heading text-sm font-semibold text-ink-950">
                {pending.length} account{pending.length === 1 ? '' : 's'} awaiting approval
              </p>
              <p className="mt-0.5 text-sm text-ink-600">
                Approve to let them book chefs, or suspend to block access.
              </p>
            </div>
            <Button
            onClick={() => pending.forEach((u) => setUserStatus(u.id, 'approved'))}
            icon={<Check className="h-4 w-4" />}>
            
              Approve all
            </Button>
          </div>
        </Card> :
      null}

      <Card>
        <CardHeader title="All users" description={`${users.length} registered accounts`} />
        <Toolbar search={search} onSearch={setSearch} placeholder="Search name, email or city…">
          <FilterSelect
            label="Status filter"
            value={status}
            onChange={setStatus}
            options={[
            { value: 'all', label: 'All statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'suspended', label: 'Suspended' }]
            } />
          
        </Toolbar>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(u) => u.id}
          emptyTitle="No users found"
          emptyDescription="Adjust your filters or add a customer account manually." />
        
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit user' : 'Add user'}
        description="Customer accounts can book services once approved."
        size="md">
        
        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={(values) => {
            saveUser({ ...values, id: values.id || uid('usr') });
            setEditing(null);
          }}>
          
            <Form>
              <div className="space-y-4 px-6 py-5">
                <TextField name="name" label="Full name" placeholder="Amara Whitfield" />
                <FormGrid>
                  <TextField name="email" label="Email" type="email" placeholder="name@email.com" />
                  <TextField name="phone" label="Phone" placeholder="+1 415 000 0000" />
                </FormGrid>
                <FormGrid>
                  <TextField name="city" label="City" placeholder="San Francisco, CA" />
                  <SelectField
                  name="status"
                  label="Account status"
                  options={[
                  { value: 'pending', label: 'Pending approval' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'rejected', label: 'Rejected' }]
                  } />
                
                </FormGrid>
              </div>
              <ModalFooter>
                <Button variant="secondary" type="button" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">{editing.id ? 'Save changes' : 'Add user'}</Button>
              </ModalFooter>
            </Form>
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove user"
        message={`Remove ${deleting?.name}? Their booking history will remain, but the account will be deleted.`}
        confirmLabel="Remove"
        onConfirm={() => deleting && removeUser(deleting.id)}
        onClose={() => setDeleting(null)} />
      
    </div>);

}