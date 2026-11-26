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
import { FormGrid, NumberField, SelectField, SwitchField } from '../../../components/form/Fields';
import { ApiError } from '../../../config/api';
import { formatCurrency } from '../../../utils/format';
import { listServices } from '../../../services/admin/adminServices';
import {
  createServiceRate,
  deleteServiceRate,
  guestRangeLabel,
  listServiceRates,
  updateServiceRate,
  type ServiceRate } from
'../../../services/admin/settingsServices';
import { SettingsBackLink } from './SettingsBackLink';

const errorMessage = (err: unknown, fallback: string): string => err instanceof ApiError ? err.message : fallback;

interface FormValues {
  id?: string;
  serviceId: string;
  minGuests: number | '';
  maxGuests: number | '';
  pricingType: 'fixed' | 'quoted';
  ratePerStaff: number | '';
  status: 'active' | 'inactive';
}

const empty: FormValues = { serviceId: '', minGuests: '', maxGuests: '', pricingType: 'fixed', ratePerStaff: '', status: 'active' };

const schema = Yup.object({
  serviceId: Yup.string().required('Select a service'),
  minGuests: Yup.number().typeError('Enter a number').required('Minimum guests is required').integer('Whole numbers only').min(1, 'At least 1'),
  maxGuests: Yup.number().
  transform((v, orig) => orig === '' ? undefined : v).
  typeError('Enter a number').
  integer('Whole numbers only').
  min(1, 'At least 1').
  test('max-gte-min', "Can't be less than minimum guests", function (value) {
    return value == null || this.parent.minGuests === '' || value >= Number(this.parent.minGuests);
  }),
  pricingType: Yup.string().oneOf(['fixed', 'quoted']).required(),
  ratePerStaff: Yup.mixed().when('pricingType', {
    is: 'fixed',
    then: () => Yup.number().typeError('Enter an amount').required('Rate per staff is required').min(0, 'Must be zero or more'),
    otherwise: () => Yup.mixed().notRequired()
  })
});

/** "₦10,000 per staff" or "Quoted". */
const rateText = (r: Pick<ServiceRate, 'pricingType' | 'ratePerStaff'>) =>
r.pricingType === 'quoted' || r.ratePerStaff == null ? 'Quoted' : `${formatCurrency(r.ratePerStaff)} per staff`;

/** Settings → Service rates: per-staff rates by guest range, per service. */
export function ServiceRatesPage() {
  const [rates, setRates] = useState<ServiceRate[]>([]);
  const [services, setServices] = useState<{id: string;name: string;}[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [deleting, setDeleting] = useState<ServiceRate | null>(null);

  useEffect(() => {
    listServices().
    then((res) => setServices(res.payload.map((s) => ({ id: s.id, name: s.name })).sort((a, b) => a.name.localeCompare(b.name)))).
    catch(() => toast.error('Could not load services.'));
    listServiceRates().
    then(setRates).
    catch((err) => toast.error(errorMessage(err, 'Could not load rates.'))).
    finally(() => setLoading(false));
  }, []);

  const serviceName = (r: ServiceRate) => r.serviceName || services.find((s) => s.id === r.serviceId)?.name || 'Unknown service';

  // Grouped by service, then smallest range first.
  const rows = useMemo(
    () =>
    rates.
    filter((r) => serviceFilter === 'all' || r.serviceId === serviceFilter).
    filter((r) => !search.trim() || serviceName(r).toLowerCase().includes(search.trim().toLowerCase())).
    sort((a, b) => serviceName(a).localeCompare(serviceName(b)) || a.minGuests - b.minGuests),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rates, serviceFilter, services, search]
  );

  const edit = (r: ServiceRate) =>
  setEditing({
    id: r.id,
    serviceId: r.serviceId,
    minGuests: r.minGuests,
    maxGuests: r.maxGuests ?? '',
    pricingType: r.pricingType,
    ratePerStaff: r.ratePerStaff ?? '',
    status: r.isActive ? 'active' : 'inactive'
  });

  const handleDelete = async (rate: ServiceRate) => {
    try {
      await deleteServiceRate(rate.id);
      setRates((prev) => prev.filter((r) => r.id !== rate.id));
      toast.success('Rate deleted.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete this rate.'));
    }
  };

  const columns: Column<ServiceRate>[] = [
  { key: 'service', header: 'Service', render: (r) => <span className="font-medium text-ink-950">{serviceName(r)}</span> },
  { key: 'range', header: 'Guests', render: (r) => guestRangeLabel(r) },
  {
    key: 'rate',
    header: 'Rate',
    align: 'right',
    render: (r) =>
    r.pricingType === 'quoted' || r.ratePerStaff == null ?
    <Badge tone="warning">Quoted</Badge> :

    <span className="font-medium">
            {formatCurrency(r.ratePerStaff)}
            <span className="ml-1 text-xs font-normal text-ink-500">per staff</span>
          </span>

  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <Badge tone={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '110px',
    render: (r) => <RowActions onEdit={() => edit(r)} onDelete={() => setDeleting(r)} />
  }];


  return (
    <div>
      <SettingsBackLink />
      <PageHeader
        title="Service rates"
        description="Staffing rates by number of guests, e.g. 1 – 10 guests: ₦10,000 per staff. Mark a range as Quoted when its price is agreed with the admin. Leave the maximum empty for an open-ended top range (51+)."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing({ ...empty, serviceId: serviceFilter === 'all' ? '' : serviceFilter })}>
            Add rate
          </Button>
        } />


      <Card>
        <CardHeader title="All rates" description={loading ? 'Loading…' : `${rates.length} rate${rates.length === 1 ? '' : 's'}`} />
        <Toolbar search={search} onSearch={setSearch} placeholder="Search services…">
          <FilterSelect
            label="Service filter"
            value={serviceFilter}
            onChange={setServiceFilter}
            options={[{ value: 'all', label: 'All services' }, ...services.map((s) => ({ value: s.id, label: s.name }))]} />

        </Toolbar>
        {loading ?
        <p className="px-5 py-12 text-center text-sm text-ink-500">Loading rates…</p> :

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={edit}
          emptyTitle="No rates yet"
          emptyDescription="Add a rate, e.g. 1 – 10 guests at ₦10,000 per staff." />

        }
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        closeOnOverlayClick={false}
        title={editing?.id ? 'Edit rate' : 'Add rate'}
        description="Ranges for the same service can't overlap."
        size="md">

        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            const input = {
              serviceId: values.serviceId,
              minGuests: Number(values.minGuests),
              maxGuests: values.maxGuests === '' ? null : Number(values.maxGuests),
              pricingType: values.pricingType,
              ratePerStaff: values.pricingType === 'quoted' ? null : Number(values.ratePerStaff),
              isActive: values.status === 'active'
            };
            try {
              if (values.id) {
                const updated = await updateServiceRate(values.id, input);
                setRates((prev) => prev.map((r) => r.id === updated.id ? updated : r));
                toast.success('Rate updated.');
              } else {
                const created = await createServiceRate(input);
                setRates((prev) => [created, ...prev]);
                toast.success('Rate added.');
              }
              setEditing(null);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save this rate.'));
            } finally {
              setSubmitting(false);
            }
          }}>

            {({ values, isSubmitting }) =>
          <Form>
                <div className="space-y-4 px-6 py-5">
                  <SelectField name="serviceId" label="Service" options={services.map((s) => ({ value: s.id, label: s.name }))} />
                  <FormGrid>
                    <NumberField name="minGuests" label="Minimum guests" placeholder="1" step="1" />
                    <NumberField name="maxGuests" label="Maximum guests (optional)" placeholder="10" step="1" />
                  </FormGrid>
                  <SelectField
                name="pricingType"
                label="Pricing"
                options={[
                { value: 'fixed', label: 'Fixed rate per staff' },
                { value: 'quoted', label: 'Quoted — discussed with the admin' }]
                } />

                  {values.pricingType === 'fixed' ?
              <NumberField name="ratePerStaff" label="Rate per staff" prefix="₦" placeholder="10000" step="1" /> :

              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      No set price for this range. Customers in it are told the price will be agreed with the admin.
                    </p>
              }
                  {values.minGuests !== '' && (values.pricingType === 'quoted' || values.ratePerStaff !== '') ?
              <p className="rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700">
                      {guestRangeLabel({ minGuests: Number(values.minGuests), maxGuests: values.maxGuests === '' ? null : Number(values.maxGuests) })}
                      {': '}
                      <span className="font-semibold">
                        {rateText({ pricingType: values.pricingType, ratePerStaff: values.ratePerStaff === '' ? null : Number(values.ratePerStaff) })}
                      </span>
                    </p> :
              null}
                  <SwitchField name="status" label="Rate is active" hint="Inactive rates are kept but not used." />
                </div>
                <ModalFooter>
                  <Button variant="secondary" type="button" disabled={isSubmitting} onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : editing.id ? 'Save changes' : 'Add rate'}
                  </Button>
                </ModalFooter>
              </Form>
          }
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete rate"
        message={`Delete the ${deleting ? guestRangeLabel(deleting) : ''} rate for ${deleting ? serviceName(deleting) : ''}?`}
        onConfirm={() => deleting && handleDelete(deleting)}
        onClose={() => setDeleting(null)} />

    </div>);

}
