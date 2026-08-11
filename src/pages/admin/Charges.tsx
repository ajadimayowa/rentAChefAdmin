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
  SwitchField,
  TextField } from
'../../components/form/Fields';
import { useAdminData } from '../../contexts/AdminDataContext';
import { formatCurrency, titleCase, uid } from '../../utils/format';
import type { Charge } from '../../types';

const schema = Yup.object({
  name: Yup.string().required('Charge name is required'),
  code: Yup.string().
  required('Code is required').
  matches(/^[A-Z0-9_]+$/, 'Use uppercase letters, numbers and underscores'),
  type: Yup.string().required('Select a charge type'),
  appliesTo: Yup.string().required('Select what this applies to'),
  value: Yup.number().
  typeError('Enter a number').
  required('Value is required').
  min(0, 'Must be zero or more').
  when('type', {
    is: 'percentage',
    then: (s) => s.max(100, 'Percentage cannot exceed 100')
  })
});

const emptyCharge: Charge = {
  id: '',
  name: '',
  code: '',
  type: 'percentage',
  value: 0,
  appliesTo: 'booking',
  status: 'active'
};

const appliesOptions = [
{ value: 'booking', label: 'Booking subtotal' },
{ value: 'grocery', label: 'Grocery costs' },
{ value: 'chef_payout', label: 'Chef payout' },
{ value: 'package', label: 'Packages' }];


export function Charges() {
  const { charges, saveCharge, removeCharge } = useAdminData();
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('all');
  const [editing, setEditing] = useState<Charge | null>(null);
  const [deleting, setDeleting] = useState<Charge | null>(null);

  const rows = useMemo(
    () =>
    charges.filter(
      (c) =>
      (scope === 'all' || c.appliesTo === scope) && (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()))
    ),
    [charges, search, scope]
  );

  const columns: Column<Charge>[] = [
  {
    key: 'name',
    header: 'Charge',
    render: (c) =>
    <div>
          <p className="font-medium text-ink-950">{c.name}</p>
          <p className="font-mono text-xs text-ink-500">{c.code}</p>
        </div>

  },
  {
    key: 'applies',
    header: 'Applies to',
    render: (c) =>
    <Badge tone="neutral">
          {appliesOptions.find((o) => o.value === c.appliesTo)?.label ?? c.appliesTo}
        </Badge>

  },
  { key: 'type', header: 'Type', render: (c) => titleCase(c.type) },
  {
    key: 'value',
    header: 'Value',
    align: 'right',
    render: (c) =>
    <span className="font-medium">
          {c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}
        </span>

  },
  {
    key: 'status',
    header: 'Status',
    render: (c) => <Badge tone={statusTone(c.status)}>{titleCase(c.status)}</Badge>
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '110px',
    render: (c) => <RowActions onEdit={() => setEditing(c)} onDelete={() => setDeleting(c)} />
  }];


  const activePct = charges.
  filter((c) => c.status === 'active' && c.type === 'percentage' && c.appliesTo === 'booking').
  reduce((s, c) => s + c.value, 0);

  return (
    <div>
      <PageHeader
        title="Charges & Pricing"
        description="Platform fees, surcharges and commissions applied across bookings."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyCharge)}>
            New charge
          </Button>
        } />
      

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-ink-500">Effective booking fee</p>
          <p className="mt-2 font-heading text-2xl font-semibold text-ink-950">{activePct}%</p>
          <p className="mt-1 text-xs text-ink-400">Sum of active percentage charges on bookings</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink-500">Active charges</p>
          <p className="mt-2 font-heading text-2xl font-semibold text-ink-950">
            {charges.filter((c) => c.status === 'active').length}
          </p>
          <p className="mt-1 text-xs text-ink-400">of {charges.length} configured</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink-500">Chef commission</p>
          <p className="mt-2 font-heading text-2xl font-semibold text-ink-950">
            {charges.find((c) => c.code === 'CHEF_COMMISSION')?.value ?? 0}%
          </p>
          <p className="mt-1 text-xs text-ink-400">Retained from each chef payout</p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Charge rules"
          description="Rules are applied in order at booking checkout" />
        
        <Toolbar search={search} onSearch={setSearch} placeholder="Search charges…">
          <FilterSelect
            label="Scope filter"
            value={scope}
            onChange={setScope}
            options={[{ value: 'all', label: 'All scopes' }, ...appliesOptions]} />
          
        </Toolbar>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          emptyTitle="No charges configured"
          emptyDescription="Add a platform fee or surcharge to start monetising bookings." />
        
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit charge' : 'New charge'}
        description="Charges are recalculated on every booking total."
        size="md">
        
        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={(values) => {
            saveCharge({ ...values, id: values.id || uid('chg'), value: Number(values.value) });
            setEditing(null);
          }}>
          
            <Form>
              <div className="space-y-4 px-6 py-5">
                <FormGrid>
                  <TextField name="name" label="Charge name" placeholder="Platform Service Fee" />
                  <TextField name="code" label="Code" placeholder="PLATFORM_FEE" />
                </FormGrid>
                <FormGrid>
                  <SelectField
                  name="type"
                  label="Type"
                  options={[
                  { value: 'percentage', label: 'Percentage' },
                  { value: 'fixed', label: 'Fixed amount' }]
                  } />
                
                  <NumberField name="value" label="Value" placeholder="12" />
                </FormGrid>
                <SelectField name="appliesTo" label="Applies to" options={appliesOptions} />
                <SwitchField
                name="status"
                label="Charge is active"
                hint="Inactive charges are excluded from new booking calculations." />
              
              </div>
              <ModalFooter>
                <Button variant="secondary" type="button" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">{editing.id ? 'Save changes' : 'Create charge'}</Button>
              </ModalFooter>
            </Form>
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete charge"
        message={`Remove “${deleting?.name}”? Existing bookings will be recalculated without it.`}
        onConfirm={() => deleting && removeCharge(deleting.id)}
        onClose={() => setDeleting(null)} />
      
    </div>);

}