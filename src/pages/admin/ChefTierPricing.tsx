import React, { useEffect, useState } from 'react';
import { FieldArray, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RowActions } from '../../components/ui/RowActions';
import {
  CheckboxField,
  FieldSectionTitle,
  FormGrid,
  NumberField,
  SelectField,
  TextAreaField,
  TextField } from
'../../components/form/Fields';
import {
  createAdminServicePricing,
  deleteAdminServicePricing,
  listAdminServicePricing,
  listChefCategories,
  listSpecialServices,
  updateAdminServicePricing,
  type AdminServicePricing,
  type ChefCategoryOption,
  type PricingType,
  type SpecialServiceOption } from
'../../services/admin/servicePricingServices';
import { listServices, type AdminService } from '../../services/admin/adminServices';
import { convertToThousand, formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

interface OptionRow {
  name: string;
  price: number | '';
  description: string;
}

interface PricingFormValues {
  id?: string;
  targetType: 'service' | 'specialService';
  serviceId: string;
  specialServiceId: string;
  chefCategoryId: string;
  pricingType: PricingType;
  numberOfDays: number | '';
  monthlySubFee: number | '';
  description: string;
  basePrice: number | '';
  servicePricingOptions: OptionRow[];
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const emptyForm: PricingFormValues = {
  targetType: 'service',
  serviceId: '',
  specialServiceId: '',
  chefCategoryId: '',
  pricingType: 'levelbased',
  numberOfDays: '',
  monthlySubFee: '',
  description: '',
  basePrice: '',
  servicePricingOptions: [],
  effectiveFrom: todayIso(),
  effectiveTo: '',
  isActive: true
};

const toFormValues = (p: AdminServicePricing): PricingFormValues => ({
  id: p.id,
  targetType: p.target.type,
  serviceId: p.target.type === 'service' ? p.target.id : '',
  specialServiceId: p.target.type === 'specialService' ? p.target.id : '',
  chefCategoryId: p.chefCategory.id,
  pricingType: p.pricingType,
  numberOfDays: p.numberOfDays ?? '',
  monthlySubFee: p.monthlySubFee ?? '',
  description: p.description ?? '',
  basePrice: p.basePrice,
  servicePricingOptions: p.servicePricingOptions.map((o) => ({
    name: o.name,
    price: o.price,
    description: o.description ?? ''
  })),
  effectiveFrom: p.effectiveFrom.slice(0, 10),
  effectiveTo: p.effectiveTo ? p.effectiveTo.slice(0, 10) : '',
  isActive: p.isActive
});

const schema = Yup.object({
  targetType: Yup.string().oneOf(['service', 'specialService']).required(),
  serviceId: Yup.string().when('targetType', {
    is: 'service',
    then: (s) => s.required('Select a service'),
    otherwise: (s) => s.notRequired()
  }),
  specialServiceId: Yup.string().when('targetType', {
    is: 'specialService',
    then: (s) => s.required('Select a special service'),
    otherwise: (s) => s.notRequired()
  }),
  chefCategoryId: Yup.string().required('Select a chef category'),
  pricingType: Yup.string().oneOf(['daybased', 'levelbased']).required(),
  numberOfDays: Yup.number().when('pricingType', {
    is: 'daybased',
    then: (s) => s.typeError('Enter a number').required('Number of days is required').min(1),
    otherwise: (s) => s.notRequired()
  }),
  monthlySubFee: Yup.number().when('pricingType', {
    is: 'daybased',
    then: (s) => s.typeError('Enter a number').required('Monthly sub fee is required').min(0),
    otherwise: (s) => s.notRequired()
  }),
  basePrice: Yup.number().typeError('Enter a number').required('Base price is required').min(0),
  effectiveFrom: Yup.string().required('Effective-from date is required'),
  servicePricingOptions: Yup.array().of(
    Yup.object({
      name: Yup.string().required('Option name is required'),
      price: Yup.number().typeError('Enter a number').required('Option price is required').min(0)
    })
  )
});

export function ChefTierPricing() {
  const [pricing, setPricing] = useState<AdminServicePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<AdminService[]>([]);
  const [specialServices, setSpecialServices] = useState<SpecialServiceOption[]>([]);
  const [chefCategories, setChefCategories] = useState<ChefCategoryOption[]>([]);

  const [search, setSearch] = useState('');
  const [chefCategoryFilter, setChefCategoryFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [editing, setEditing] = useState<PricingFormValues | null>(null);
  const [deleting, setDeleting] = useState<AdminServicePricing | null>(null);

  const loadPricing = () => {
    setLoading(true);
    listAdminServicePricing().
    then(setPricing).
    catch((err) => toast.error(errorMessage(err, 'Could not load pricing rules.'))).
    finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPricing();
    listServices().then((res) => setServices(res.payload)).catch(() => toast.error('Could not load services.'));
    listSpecialServices().then(setSpecialServices).catch(() => toast.error('Could not load special services.'));
    listChefCategories().then(setChefCategories).catch(() => toast.error('Could not load chef categories.'));
  }, []);

  const handleDelete = async (p: AdminServicePricing) => {
    try {
      await deleteAdminServicePricing(p.id);
      setPricing((prev) => prev.filter((row) => row.id !== p.id));
      toast.success('Pricing rule deleted.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete pricing rule.'));
    }
  };

  const rows = pricing.filter(
    (p) =>
    (chefCategoryFilter === 'all' || p.chefCategory.id === chefCategoryFilter) && (
    serviceFilter === 'all' || p.target.type === 'service' && p.target.id === serviceFilter) && (
    p.chefCategory.name.toLowerCase().includes(search.toLowerCase()) ||
    p.target.name.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: Column<AdminServicePricing>[] = [
  {
    key: 'chefCategory',
    header: 'Chef category',
    render: (p) => <Badge tone="brand">{p.chefCategory.name}</Badge>
  },
  {
    key: 'target',
    header: 'Target',
    render: (p) =>
    <div>
          <p className="font-medium text-ink-900">{p.target.name}</p>
          <Badge tone="neutral">{p.target.type === 'service' ? 'Service' : 'Special service'}</Badge>
        </div>

  },
  {
    key: 'pricingType',
    header: 'Pricing type',
    render: (p) => <Badge tone={p.pricingType === 'daybased' ? 'info' : 'neutral'}>{p.pricingType === 'daybased' ? 'Day-based' : 'Level-based'}</Badge>
  },
  {
    key: 'basePrice',
    header: 'Base price',
    align: 'right',
    render: (p) => <span className="font-medium">{convertToThousand(p.basePrice)}</span>
  },
  {
    key: 'dayBased',
    header: 'Day-based terms',
    render: (p) =>
    p.pricingType === 'daybased' ?
    <p className="text-xs text-ink-500">
          {p.numberOfDays} day{p.numberOfDays === 1 ? '' : 's'} · {convertToThousand(p.monthlySubFee ?? 0)}/mo
        </p> :

    <span className="text-xs text-ink-400">—</span>

  },
  {
    key: 'options',
    header: 'Options',
    align: 'center',
    render: (p) => p.servicePricingOptions.length
  },
  {
    key: 'effective',
    header: 'Effective',
    render: (p) =>
    <p className="text-xs text-ink-500">
          {formatDate(p.effectiveFrom)}{p.effectiveTo ? ` – ${formatDate(p.effectiveTo)}` : ' – ongoing'}
        </p>

  },
  {
    key: 'status',
    header: 'Status',
    render: (p) => <Badge tone={p.isActive ? 'success' : 'neutral'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '110px',
    render: (p) =>
    <RowActions
      onEdit={() => setEditing(toFormValues(p))}
      onDelete={() => setDeleting(p)} />

  }];


  return (
    <div>
      <PageHeader
        title="Chef Category Pricing"
        description="Set what each chef category charges per service, including day-based terms and add-on options."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyForm)}>
            New pricing rule
          </Button>
        } />


      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {chefCategories.map((c) => {
          const rules = pricing.filter((p) => p.chefCategory.id === c.id && p.isActive);
          const avg = rules.length ? rules.reduce((s, r) => s + r.basePrice, 0) / rules.length : 0;
          return (
            <Card key={c.id} className="p-5">
              <Badge tone="brand">{c.name}</Badge>
              <p className="mt-3 font-heading text-2xl font-semibold text-ink-950">
                {avg ? convertToThousand(avg) : '—'}
              </p>
              <p className="mt-1 text-xs text-ink-400">
                Average across {rules.length} active rule{rules.length === 1 ? '' : 's'}
              </p>
            </Card>);

        })}
      </div>

      <Card>
        <CardHeader
          title="Pricing matrix"
          description="Each rule maps a chef category to a service (or special service) and its rate card" />

        <Toolbar search={search} onSearch={setSearch} placeholder="Search by category or target…">
          <FilterSelect
            label="Chef category filter"
            value={chefCategoryFilter}
            onChange={setChefCategoryFilter}
            options={[
            { value: 'all', label: 'All chef categories' },
            ...chefCategories.map((c) => ({ value: c.id, label: c.name }))]
            } />

          <FilterSelect
            label="Service filter"
            value={serviceFilter}
            onChange={setServiceFilter}
            options={[
            { value: 'all', label: 'All services' },
            ...services.map((s) => ({ value: s.id, label: s.name }))]
            } />

        </Toolbar>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(p) => p.id}
          emptyTitle={loading ? 'Loading pricing rules…' : 'No pricing rules'}
          emptyDescription={loading ? 'Fetching the pricing matrix.' : 'Add a rule so chefs in this category can be booked for a service.'} />

      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit pricing rule' : 'New pricing rule'}
        description="Rates feed directly into booking quotes and chef payouts."
        size="lg">

        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={async (values, helpers) => {
            try {
              const input = {
                targetType: values.targetType,
                serviceId: values.serviceId || undefined,
                specialServiceId: values.specialServiceId || undefined,
                chefCategoryId: values.chefCategoryId,
                pricingType: values.pricingType,
                numberOfDays: values.numberOfDays === '' ? undefined : Number(values.numberOfDays),
                monthlySubFee: values.monthlySubFee === '' ? undefined : Number(values.monthlySubFee),
                description: values.description,
                basePrice: Number(values.basePrice),
                servicePricingOptions: values.servicePricingOptions.
                filter((o) => o.name.trim() && o.price !== '').
                map((o) => ({
                  name: o.name.trim(),
                  price: Number(o.price),
                  description: o.description.trim() || undefined
                })),
                effectiveFrom: values.effectiveFrom,
                effectiveTo: values.effectiveTo || undefined,
                isActive: values.isActive
              };
              const saved = values.id ?
              await updateAdminServicePricing(values.id, input) :
              await createAdminServicePricing(input);
              setPricing((prev) => {
                const exists = prev.some((p) => p.id === saved.id);
                return exists ? prev.map((p) => p.id === saved.id ? saved : p) : [saved, ...prev];
              });
              toast.success(`Pricing rule ${values.id ? 'updated' : 'created'}.`);
              setEditing(null);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save pricing rule.'));
            } finally {
              helpers.setSubmitting(false);
            }
          }}>

            {({ values, isSubmitting }) =>
          <Form>
                <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
                  <FormGrid>
                    <SelectField
                  name="targetType"
                  label="Target type"
                  options={[
                  { value: 'service', label: 'Service' },
                  { value: 'specialService', label: 'Special service' }]
                  } />

                    <SelectField
                  name="chefCategoryId"
                  label="Chef category"
                  options={chefCategories.map((c) => ({ value: c.id, label: c.name }))} />

                  </FormGrid>

                  {values.targetType === 'service' ?
              <SelectField
                name="serviceId"
                label="Service"
                options={services.map((s) => ({ value: s.id, label: s.name }))} /> :

              <SelectField
                name="specialServiceId"
                label="Special service"
                options={specialServices.map((s) => ({ value: s.id, label: s.title }))} />
              }

                  <FormGrid>
                    <SelectField
                  name="pricingType"
                  label="Pricing type"
                  options={[
                  { value: 'levelbased', label: 'Level-based' },
                  { value: 'daybased', label: 'Day-based' }]
                  } />

                    <NumberField name="basePrice" label="Base price" prefix="₦" placeholder="150000" />
                  </FormGrid>

                  {values.pricingType === 'daybased' &&
              <FormGrid>
                      <NumberField name="numberOfDays" label="Number of days" placeholder="2" />
                      <NumberField name="monthlySubFee" label="Monthly sub fee" prefix="₦" placeholder="25000" />
                    </FormGrid>
              }

                  <TextAreaField name="description" label="Description" placeholder="Optional internal note about this rule." />

                  <FormGrid>
                    <TextField name="effectiveFrom" type="date" label="Effective from" />
                    <TextField name="effectiveTo" type="date" label="Effective to" hint="Leave blank for ongoing." />
                  </FormGrid>

                  <CheckboxField name="isActive" label="Rule is active" hint="Inactive rules block this category from being quoted for the target." />

                  <div className="border-t border-ink-200 pt-5">
                    <FieldSectionTitle>Pricing options</FieldSectionTitle>
                    <FieldArray name="servicePricingOptions">
                      {({ push, remove }) =>
                  <div className="mt-3 space-y-3">
                          {values.servicePricingOptions.length === 0 &&
                    <p className="rounded-lg border border-dashed border-ink-300 px-4 py-6 text-center text-sm text-ink-500">
                              No add-on options yet.
                            </p>
                    }
                          {values.servicePricingOptions.map((_, i) =>
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-ink-200 bg-ink-50/50 p-4">

                              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                                <TextField
                          name={`servicePricingOptions.${i}.name`}
                          label="Option name"
                          placeholder="Weekend surcharge" />

                                <NumberField
                          name={`servicePricingOptions.${i}.price`}
                          label="Price"
                          prefix="₦"
                          placeholder="10000" />

                                <TextField
                          name={`servicePricingOptions.${i}.description`}
                          label="Description"
                          placeholder="Optional detail" />

                              </div>
                              <button
                        type="button"
                        onClick={() => remove(i)}
                        aria-label={`Remove option ${i + 1}`}
                        className="mt-7 rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600">

                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                    )}
                          <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={<Plus className="h-4 w-4" />}
                      onClick={() => push({ name: '', price: '', description: '' })}>

                            Add option
                          </Button>
                        </div>
                  }
                    </FieldArray>
                  </div>
                </div>
                <ModalFooter>
                  <Button variant="secondary" type="button" disabled={isSubmitting} onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : editing.id ? 'Save changes' : 'Create rule'}
                  </Button>
                </ModalFooter>
              </Form>
          }
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete pricing rule"
        message={`Remove the ${deleting?.chefCategory.name} rate for ${deleting?.target.name}?`}
        onConfirm={() => deleting && handleDelete(deleting)}
        onClose={() => setDeleting(null)} />

    </div>);

}
