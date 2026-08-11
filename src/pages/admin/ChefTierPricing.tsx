import React, { useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge, statusTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RowActions } from '../../components/ui/RowActions';
import {
  FormGrid,
  NumberField,
  SelectField,
  SwitchField } from
'../../components/form/Fields';
import { useAdminData } from '../../contexts/AdminDataContext';
import { formatCurrency, titleCase, uid } from '../../utils/format';
import type { ChefCategoryPrice, ChefTier } from '../../types';

const tiers: ChefTier[] = ['Standard', 'Premium', 'Executive', 'Signature'];

const schema = Yup.object({
  tier: Yup.string().required('Select a chef tier'),
  serviceId: Yup.string().required('Select a service'),
  hourlyRate: Yup.number().typeError('Enter a number').required('Hourly rate is required').min(1),
  minimumHours: Yup.number().typeError('Enter a number').required('Minimum hours is required').min(1),
  weekendSurchargePct: Yup.number().typeError('Enter a number').min(0).max(100, 'Max 100%'),
  travelFee: Yup.number().typeError('Enter a number').min(0)
});

const emptyRule: ChefCategoryPrice = {
  id: '',
  tier: 'Standard',
  serviceId: '',
  hourlyRate: 0,
  minimumHours: 3,
  weekendSurchargePct: 0,
  travelFee: 0,
  status: 'active'
};

export function ChefTierPricing() {
  const { chefPrices, services, chefs, saveChefPrice, removeChefPrice, lookup } = useAdminData();
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('all');
  const [editing, setEditing] = useState<ChefCategoryPrice | null>(null);
  const [deleting, setDeleting] = useState<ChefCategoryPrice | null>(null);

  const rows = useMemo(
    () =>
    chefPrices.filter(
      (p) =>
      (tier === 'all' || p.tier === tier) && (
      p.tier.toLowerCase().includes(search.toLowerCase()) ||
      lookup.serviceName(p.serviceId).toLowerCase().includes(search.toLowerCase()))
    ),
    [chefPrices, search, tier, lookup]
  );

  const columns: Column<ChefCategoryPrice>[] = [
  {
    key: 'tier',
    header: 'Chef tier',
    render: (p) =>
    <div>
          <Badge tone="brand">{p.tier}</Badge>
          <p className="mt-1 text-xs text-ink-500">
            {chefs.filter((c) => c.chefLevel?.name === p.tier).length} chefs
          </p>
        </div>

  },
  { key: 'service', header: 'Service', render: (p) => lookup.serviceName(p.serviceId) },
  {
    key: 'rate',
    header: 'Hourly rate',
    align: 'right',
    render: (p) => <span className="font-medium">{formatCurrency(p.hourlyRate)}/hr</span>
  },
  { key: 'min', header: 'Min hours', align: 'center', render: (p) => p.minimumHours },
  {
    key: 'weekend',
    header: 'Weekend',
    align: 'right',
    render: (p) => `+${p.weekendSurchargePct}%`
  },
  {
    key: 'travel',
    header: 'Travel fee',
    align: 'right',
    render: (p) => formatCurrency(p.travelFee)
  },
  {
    key: 'minCharge',
    header: 'Min charge',
    align: 'right',
    render: (p) =>
    <span className="font-medium text-ink-950">
          {formatCurrency(p.hourlyRate * p.minimumHours + p.travelFee)}
        </span>

  },
  {
    key: 'status',
    header: 'Status',
    render: (p) => <Badge tone={statusTone(p.status)}>{titleCase(p.status)}</Badge>
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '110px',
    render: (p) => <RowActions onEdit={() => setEditing(p)} onDelete={() => setDeleting(p)} />
  }];


  return (
    <div>
      <PageHeader
        title="Chef Tier Pricing"
        description="Set what each chef tier charges per service, including minimums and surcharges."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyRule)}>
            New pricing rule
          </Button>
        } />
      

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((t) => {
          const rules = chefPrices.filter((p) => p.tier === t && p.status === 'active');
          const avg = rules.length ?
          rules.reduce((s, r) => s + r.hourlyRate, 0) / rules.length :
          0;
          return (
            <Card key={t} className="p-5">
              <div className="flex items-center justify-between">
                <Badge tone="brand">{t}</Badge>
                <span className="text-xs text-ink-400">
                  {chefs.filter((c) => c.chefLevel?.name === t).length} chefs
                </span>
              </div>
              <p className="mt-3 font-heading text-2xl font-semibold text-ink-950">
                {avg ? `${formatCurrency(avg)}/hr` : '—'}
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
          description="Each rule maps a chef tier to a service and its rate card" />
        
        <Toolbar search={search} onSearch={setSearch} placeholder="Search by tier or service…">
          <FilterSelect
            label="Tier filter"
            value={tier}
            onChange={setTier}
            options={[
            { value: 'all', label: 'All tiers' },
            ...tiers.map((t) => ({ value: t, label: t }))]
            } />
          
        </Toolbar>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(p) => p.id}
          emptyTitle="No pricing rules"
          emptyDescription="Add a rule so chefs in this tier can be booked for a service." />
        
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit pricing rule' : 'New pricing rule'}
        description="Rates feed directly into booking quotes and chef payouts."
        size="md">
        
        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={(values) => {
            saveChefPrice({ ...values, id: values.id || uid('ccp') });
            setEditing(null);
          }}>
          
            <Form>
              <div className="space-y-4 px-6 py-5">
                <FormGrid>
                  <SelectField
                  name="tier"
                  label="Chef tier"
                  options={tiers.map((t) => ({ value: t, label: t }))} />
                
                  <SelectField
                  name="serviceId"
                  label="Service"
                  options={services.map((s) => ({ value: s.id, label: s.name }))} />
                
                </FormGrid>
                <FormGrid>
                  <NumberField name="hourlyRate" label="Hourly rate" prefix="$" placeholder="70" />
                  <NumberField name="minimumHours" label="Minimum hours" placeholder="3" />
                </FormGrid>
                <FormGrid>
                  <NumberField
                  name="weekendSurchargePct"
                  label="Weekend surcharge (%)"
                  placeholder="10" />
                
                  <NumberField name="travelFee" label="Travel fee" prefix="$" placeholder="25" />
                </FormGrid>
                <SwitchField
                name="status"
                label="Rule is active"
                hint="Inactive rules block this tier from being quoted for the service." />
              
              </div>
              <ModalFooter>
                <Button variant="secondary" type="button" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">{editing.id ? 'Save changes' : 'Create rule'}</Button>
              </ModalFooter>
            </Form>
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete pricing rule"
        message={`Remove the ${deleting?.tier} rate for ${
        deleting ? lookup.serviceName(deleting.serviceId) : ''}?`
        }
        onConfirm={() => deleting && removeChefPrice(deleting.id)}
        onClose={() => setDeleting(null)} />
      
    </div>);

}