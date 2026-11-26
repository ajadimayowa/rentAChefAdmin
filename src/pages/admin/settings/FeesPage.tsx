import { useEffect, useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader } from '../../../components/ui/Card';
import { FilterSelect, Toolbar } from '../../../components/ui/Toolbar';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { RowActions } from '../../../components/ui/RowActions';
import {
  FormGrid,
  NumberField,
  SelectField,
  SwitchField,
  TextAreaField,
  TextField } from
'../../../components/form/Fields';
import { ApiError } from '../../../config/api';
import { formatCurrency } from '../../../utils/format';
import { listServices } from '../../../services/admin/adminServices';
import { createFee, deleteFee, listFees, updateFee, type Fee, type FeeType } from '../../../services/admin/feeServices';
import { SettingsBackLink } from './SettingsBackLink';
import { ServiceCheckboxes, type ServiceOption } from '../../../components/form/ServiceCheckboxes';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

interface FeeFormValues {
  id?: string;
  name: string;
  description: string;
  type: FeeType;
  value: number | '';
  /** SwitchField works with 'active' / 'inactive'. */
  status: 'active' | 'inactive';
  serviceIds: string[];
}

const emptyFee: FeeFormValues = {
  name: '',
  description: '',
  type: 'fixed',
  value: '',
  status: 'active',
  serviceIds: []
};

const toFormValues = (fee: Fee): FeeFormValues => ({
  id: fee.id,
  name: fee.name,
  description: fee.description,
  type: fee.type,
  value: fee.value,
  status: fee.isActive ? 'active' : 'inactive',
  serviceIds: fee.services.map((s) => s.id)
});

const schema = Yup.object({
  name: Yup.string().trim().required('Fee name is required').max(120, 'Keep it under 120 characters'),
  description: Yup.string().max(500, 'Keep it under 500 characters'),
  type: Yup.string().oneOf(['fixed', 'percentage']).required('Select a fee type'),
  value: Yup.number().
  typeError('Enter a number').
  required('Amount is required').
  min(0, 'Must be zero or more').
  when('type', {
    is: 'percentage',
    then: (s) => s.max(100, 'A percentage cannot be more than 100')
  }),
  serviceIds: Yup.array().of(Yup.string()).min(1, 'Select at least one service')
});

const formatFeeValue = (fee: Pick<Fee, 'type' | 'value'>) =>
fee.type === 'percentage' ? `${fee.value}%` : formatCurrency(fee.value);

export function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<FeeFormValues | null>(null);
  const [deleting, setDeleting] = useState<Fee | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [serviceFilter, setServiceFilter] = useState('all');

  useEffect(() => {
    listServices().
    then((res) =>
    setServices(
      res.payload.
      map((s) => ({ id: s.id, name: s.name })).
      sort((a, b) => a.name.localeCompare(b.name))
    )
    ).
    catch(() => toast.error('Could not load services.'));
    listFees().
    then(setFees).
    catch((err) => toast.error(errorMessage(err, 'Could not load fees.'))).
    finally(() => setLoading(false));
  }, []);

  const serviceNames = useMemo(() => new Map(services.map((s) => [s.id, s.name])), [services]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fees.filter(
      (f) =>
      (serviceFilter === 'all' || f.services.some((s) => s.id === serviceFilter)) && (
      !q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q))
    );
  }, [fees, search, serviceFilter]);

  const handleDelete = async (fee: Fee) => {
    try {
      await deleteFee(fee.id);
      setFees((prev) => prev.filter((f) => f.id !== fee.id));
      toast.success('Fee deleted.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete this fee.'));
    }
  };

  const columns: Column<Fee>[] = [
  {
    key: 'name',
    header: 'Fee',
    render: (f) =>
    <div className="max-w-md">
          <p className="font-medium text-ink-950">{f.name}</p>
          {f.description ? <p className="mt-0.5 text-xs text-ink-500">{f.description}</p> : null}
        </div>

  },
  {
    key: 'services',
    header: 'Services',
    render: (f) => {
      if (f.services.length === 0) return <span className="text-xs font-medium text-amber-600">None — edit to choose</span>;
      const names = f.services.map((s) => serviceNames.get(s.id) || s.name || 'Unknown service');
      const shown = names.slice(0, 2);
      return (
        <div className="flex max-w-xs flex-wrap gap-1" title={names.join(', ')}>
            {shown.map((n, i) => <Badge key={i} tone="info">{n}</Badge>)}
            {names.length > shown.length ? <Badge tone="neutral">+{names.length - shown.length} more</Badge> : null}
          </div>);

    }
  },
  {
    key: 'type',
    header: 'Type',
    render: (f) => <Badge tone="neutral">{f.type === 'percentage' ? 'Percentage' : 'Fixed amount'}</Badge>
  },
  {
    key: 'value',
    header: 'Amount',
    align: 'right',
    render: (f) => <span className="font-medium">{formatFeeValue(f)}</span>
  },
  {
    key: 'status',
    header: 'Status',
    render: (f) => <Badge tone={f.isActive ? 'success' : 'neutral'}>{f.isActive ? 'Active' : 'Inactive'}</Badge>
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '110px',
    render: (f) => <RowActions onEdit={() => setEditing(toFormValues(f))} onDelete={() => setDeleting(f)} />
  }];


  return (
    <div>
      <SettingsBackLink />
      <PageHeader
        title="Fees"
        description="Platform fees charged on bookings. Fixed fees are in naira; percentage fees are a share of the booking total."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyFee)}>
            Add fee
          </Button>
        } />


      <Card>
        <CardHeader
          title="All fees"
          description={loading ? 'Loading…' : `${fees.length} fee${fees.length === 1 ? '' : 's'} · ${fees.filter((f) => f.isActive).length} active`} />

        <Toolbar search={search} onSearch={setSearch} placeholder="Search fees…">
          <FilterSelect
            label="Service filter"
            value={serviceFilter}
            onChange={setServiceFilter}
            options={[{ value: 'all', label: 'All services' }, ...services.map((s) => ({ value: s.id, label: s.name }))]} />

        </Toolbar>
        {loading ?
        <p className="px-5 py-12 text-center text-sm text-ink-500">Loading fees…</p> :

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(f) => f.id}
          onRowClick={(f) => setEditing(toFormValues(f))}
          emptyTitle={search ? 'No fees match your search' : 'No fees yet'}
          emptyDescription={search ? 'Try a different name.' : 'Add your first fee, e.g. a service fee or a booking fee.'} />

        }
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        closeOnOverlayClick={false}
        title={editing?.id ? 'Edit fee' : 'Add fee'}
        description="Only active fees apply to new bookings."
        size="md">

        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            const input = {
              name: values.name.trim(),
              description: values.description.trim(),
              type: values.type,
              value: Number(values.value),
              isActive: values.status === 'active',
              serviceIds: values.serviceIds
            };
            try {
              if (values.id) {
                const updated = await updateFee(values.id, input);
                setFees((prev) => prev.map((f) => f.id === updated.id ? updated : f));
                toast.success('Fee updated.');
              } else {
                const created = await createFee(input);
                setFees((prev) => [created, ...prev]);
                toast.success('Fee added.');
              }
              setEditing(null);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save this fee.'));
            } finally {
              setSubmitting(false);
            }
          }}>

            {({ values, errors, touched, submitCount, setFieldValue, isSubmitting }) =>
          <Form>
                <div className="space-y-4 px-6 py-5">
                  <TextField name="name" label="Fee name" placeholder="e.g. Service fee" />
                  <TextAreaField
                name="description"
                label="Description (optional)"
                rows={2}
                placeholder="What this fee covers" />

                  <FormGrid>
                    <SelectField
                  name="type"
                  label="Type"
                  options={[
                  { value: 'fixed', label: 'Fixed amount (₦)' },
                  { value: 'percentage', label: 'Percentage (%)' }]
                  } />

                    <NumberField
                  name="value"
                  label={values.type === 'percentage' ? 'Percentage' : 'Amount'}
                  prefix={values.type === 'percentage' ? undefined : '₦'}
                  placeholder={values.type === 'percentage' ? '5' : '2000'}
                  step={values.type === 'percentage' ? '0.01' : '1'} />

                  </FormGrid>
                  <ServiceCheckboxes
                services={services}
                selected={values.serviceIds}
                onChange={(ids) => setFieldValue('serviceIds', ids)}
                error={(touched.serviceIds || submitCount > 0) && typeof errors.serviceIds === 'string' ? errors.serviceIds : undefined} />

                  <SwitchField name="status" label="Fee is active" hint="Inactive fees are kept but not charged." />
                </div>
                <ModalFooter>
                  <Button variant="secondary" type="button" disabled={isSubmitting} onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : editing.id ? 'Save changes' : 'Add fee'}
                  </Button>
                </ModalFooter>
              </Form>
          }
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete fee"
        message={`Delete “${deleting?.name}”? It will no longer be charged on new bookings.`}
        onConfirm={() => deleting && handleDelete(deleting)}
        onClose={() => setDeleting(null)} />

    </div>);

}
