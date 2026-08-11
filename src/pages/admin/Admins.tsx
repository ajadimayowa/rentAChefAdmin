import React, { useEffect, useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Plus, ShieldBan, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge, statusTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RowActions } from '../../components/ui/RowActions';
import { SelectField, SwitchField, TextField } from '../../components/form/Fields';
import type { Admin, AdminRole, Status } from '../../types';
import { ApiError } from '../../config/api';
import {
  createAdmin,
  deleteAdmin,
  listAdmins,
  updateAdmin,
  type AdminCreateInput,
  type AdminUpdateInput
} from '../../services/admin/adminUserServices';

const roles: AdminRole[] = ['admin', 'super_admin'];
const roleLabels: Record<AdminRole, string> = {
  admin: 'Admin',
  super_admin: 'Super Admin'
};

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof ApiError ? err.message : fallback;

interface AdminFormValues {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  password: string;
  isActive: Status;
}

const emptyAdmin: AdminFormValues = {
  id: '',
  fullName: '',
  email: '',
  role: 'admin',
  password: '',
  isActive: 'active'
};

const schema = Yup.object({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  role: Yup.string().oneOf(roles).required('Select a user type'),
  password: Yup.string().when('id', {
    is: (id: string) => !id,
    then: (s) => s.min(8, 'At least 8 characters').required('Password is required'),
    otherwise: (s) => s.notRequired()
  })
});

export function Admins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [editing, setEditing] = useState<AdminFormValues | null>(null);
  const [deleting, setDeleting] = useState<Admin | null>(null);

  useEffect(() => {
    listAdmins().
      then((res) => setAdmins(res.payload)).
      catch((err) => toast.error(errorMessage(err, 'Could not load admins.'))).
      finally(() => setLoading(false));
  }, []);

  const upsert = (admin: Admin) => {
    setAdmins((prev) => {
      const exists = prev.some((a) => a.id === admin.id);
      return exists ? prev.map((a) => a.id === admin.id ? admin : a) : [admin, ...prev];
    });
  };

  const handleDelete = async (admin: Admin) => {
    try {
      await deleteAdmin(admin.id);
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove admin.'));
    }
  };

  const rows = useMemo(
    () =>
      admins.filter(
        (a) =>
          (role === 'all' || a.role === role) && (
            a.fullName.toLowerCase().includes(search.toLowerCase()) ||
            a.email.toLowerCase().includes(search.toLowerCase()))
      ),
    [admins, search, role]
  );

  const columns: Column<Admin>[] = [
    {
      key: 'admin',
      header: 'Admin',
      render: (a) =>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-600">
            {a.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="font-medium text-ink-950">{a.fullName}</p>
            <p className="text-xs text-ink-500">{a.email}</p>
          </div>
        </div>
    },
    {
      key: 'role',
      header: 'User type',
      render: (a) => <Badge tone={a.role === 'super_admin' ? 'brand' : 'neutral'}>{roleLabels[a.role]}</Badge>
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => <Badge tone={statusTone(a.isActive ? 'active' : 'suspended')}>{a.isActive ? 'Active' : 'Disabled'}</Badge>
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '140px',
      render: (a) =>
        <RowActions
          onEdit={() => setEditing({ id: a.id, fullName: a.fullName, email: a.email, role: a.role, password: '', isActive: a.isActive ? 'active' : 'inactive' })}
          onDelete={() => setDeleting(a)}
          extra={
            <Button
              size="sm"
              variant="ghost"
              icon={a.isActive ? <ShieldBan className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              onClick={async () => {
                try {
                  const input: AdminUpdateInput = { fullName: a.fullName, email: a.email, role: a.role, isActive: !a.isActive };
                  const res = await updateAdmin(a.id, input);
                  upsert(res.payload);
                } catch (err) {
                  toast.error(errorMessage(err, 'Could not update admin status.'));
                }
              }}>
              {a.isActive ? 'Disable' : 'Enable'}
            </Button>
          } />
    }];

  return (
    <div>
      <PageHeader
        title="Admins"
        description="Create and manage Admin and Super Admin accounts for the RentAChef dashboard."
        action={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyAdmin)}>
            Add admin
          </Button>
        } />

      <Card>
        <CardHeader title="Admin accounts" description={`${admins.length} accounts with dashboard access`} />
        <Toolbar search={search} onSearch={setSearch} placeholder="Search name or email…">
          <FilterSelect
            label="User type filter"
            value={role}
            onChange={setRole}
            options={[
              { value: 'all', label: 'All user types' },
              ...roles.map((r) => ({ value: r, label: roleLabels[r] }))]
            } />
        </Toolbar>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(a) => a.id}
          emptyTitle={loading ? 'Loading admins…' : 'No admins found'}
          emptyDescription={loading ? 'Fetching admin accounts.' : 'Adjust the filters or add a new admin account.'} />
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit admin' : 'Add admin'}
        description="Super Admins can create, edit and remove other admin accounts."
        size="md">

        {editing ?
          <Formik
            initialValues={editing}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                if (values.id) {
                  const input: AdminUpdateInput = {
                    fullName: values.fullName,
                    email: values.email,
                    role: values.role,
                    isActive: values.isActive === 'active'
                  };
                  const res = await updateAdmin(values.id, input);
                  upsert(res.payload);
                } else {
                  const input: AdminCreateInput = {
                    fullName: values.fullName,
                    email: values.email,
                    password: values.password,
                    role: values.role
                  };
                  const res = await createAdmin(input);
                  upsert(res.payload);
                }
                setEditing(null);
              } catch (err) {
                toast.error(errorMessage(err, 'Could not save admin.'));
              } finally {
                setSubmitting(false);
              }
            }}>

            {({ isSubmitting }) =>
              <Form>
                <div className="space-y-4 px-6 py-5">
                  <SelectField
                    name="role"
                    label="User type"
                    options={roles.map((r) => ({ value: r, label: roleLabels[r] }))} />

                  <TextField name="fullName" label="Full name" placeholder="Amara Whitfield" />
                  <TextField name="email" label="Email" type="email" placeholder="admin@rentachef.com" />

                  {!editing.id ?
                    <TextField
                      name="password"
                      label="Password"
                      type="password"
                      placeholder="Temporary password"
                      hint="Shared with the admin by email — they can change it after signing in." /> :
                    null}

                  {editing.id ?
                    <SwitchField
                      name="isActive"
                      label="Account active"
                      hint="Disabled admins can't sign in to the dashboard." /> :
                    null}
                </div>
                <ModalFooter>
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : editing.id ? 'Save changes' : 'Add admin'}
                  </Button>
                </ModalFooter>
              </Form>
            }
          </Formik> :
          null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove admin"
        message={`Remove ${deleting?.fullName}? They will immediately lose access to the admin dashboard.`}
        confirmLabel="Remove"
        onConfirm={() => deleting && handleDelete(deleting)}
        onClose={() => setDeleting(null)} />

    </div>);
}
