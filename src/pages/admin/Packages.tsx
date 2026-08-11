import React, { useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Check, Plus } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { Badge, statusTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RowActions } from '../../components/ui/RowActions';
import {
  FormGrid,
  MultiSelectField,
  NumberField,
  SwitchField,
  TagsField,
  TextAreaField,
  TextField } from
'../../components/form/Fields';
import { useAdminData } from '../../contexts/AdminDataContext';
import { formatCurrency, titleCase, uid } from '../../utils/format';
import type { Package } from '../../types';

const schema = Yup.object({
  name: Yup.string().required('Package name is required'),
  description: Yup.string().required('Add a description').max(200, 'Keep it under 200 characters'),
  price: Yup.number().typeError('Enter a number').required('Price is required').min(1),
  durationHours: Yup.number().typeError('Enter a number').required('Duration is required').min(1),
  guests: Yup.number().typeError('Enter a number').required('Guest count is required').min(1),
  serviceIds: Yup.array().of(Yup.string()).min(1, 'Select at least one service')
});

const emptyPackage: Package = {
  id: '',
  name: '',
  description: '',
  serviceIds: [],
  menuIds: [],
  price: 0,
  durationHours: 4,
  guests: 2,
  perks: [],
  status: 'active',
  createdAt: new Date().toISOString().slice(0, 10)
};

export function Packages() {
  const { packages, services, menus, savePackage, removePackage, lookup } = useAdminData();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<Package | null>(null);
  const [deleting, setDeleting] = useState<Package | null>(null);

  const rows = useMemo(
    () =>
    packages.filter(
      (p) =>
      (status === 'all' || p.status === status) && (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()))
    ),
    [packages, search, status]
  );

  return (
    <div>
      <PageHeader
        title="Packages"
        description="Bundle services, menus and perks into a single fixed-price offer."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyPackage)}>
            New package
          </Button>
        } />
      

      <Card className="mb-6">
        <Toolbar search={search} onSearch={setSearch} placeholder="Search packages…">
          <FilterSelect
            label="Status filter"
            value={status}
            onChange={setStatus}
            options={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }]
            } />
          
        </Toolbar>
      </Card>

      {rows.length === 0 ?
      <Card className="px-6 py-16 text-center">
          <p className="font-heading text-[15px] font-semibold text-ink-900">No packages found</p>
          <p className="mt-1 text-sm text-ink-500">
            Bundle a service with a menu to create your first package.
          </p>
        </Card> :

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {rows.map((pkg) =>
        <Card key={pkg.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-ink-950">{pkg.name}</h3>
                  <Badge tone={statusTone(pkg.status)}>{titleCase(pkg.status)}</Badge>
                </div>
                <RowActions onEdit={() => setEditing(pkg)} onDelete={() => setDeleting(pkg)} />
              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink-600">{pkg.description}</p>

              <dl className="mt-5 grid grid-cols-3 gap-3 rounded-lg bg-ink-50 p-3 text-center">
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-ink-400">Price</dt>
                  <dd className="mt-0.5 font-heading text-sm font-semibold text-ink-950">
                    {formatCurrency(pkg.price)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-ink-400">Duration</dt>
                  <dd className="mt-0.5 font-heading text-sm font-semibold text-ink-950">
                    {pkg.durationHours} hrs
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-ink-400">Guests</dt>
                  <dd className="mt-0.5 font-heading text-sm font-semibold text-ink-950">
                    {pkg.guests}
                  </dd>
                </div>
              </dl>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Includes
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pkg.serviceIds.map((id) =>
              <Badge key={id} tone="neutral">
                      {lookup.serviceName(id)}
                    </Badge>
              )}
                  {pkg.menuIds.map((id) =>
              <Badge key={id} tone="brand">
                      {lookup.menuName(id)}
                    </Badge>
              )}
                </div>
              </div>

              {pkg.perks.length > 0 ?
          <ul className="mt-4 space-y-1.5 border-t border-ink-100 pt-4">
                  {pkg.perks.map((perk) =>
            <li key={perk} className="flex items-center gap-2 text-sm text-ink-600">
                      <Check className="h-4 w-4 shrink-0 text-amber-600" />
                      {perk}
                    </li>
            )}
                </ul> :
          null}
            </Card>
        )}
        </div>
      }

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit package' : 'New package'}
        description="Packages appear as a single bookable offer with a fixed price.">
        
        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={(values) => {
            savePackage({
              ...values,
              id: values.id || uid('pkg'),
              perks: values.perks.filter(Boolean)
            });
            setEditing(null);
          }}>
          
            <Form>
              <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
                <TextField name="name" label="Package name" placeholder="Date Night Signature" />
                <TextAreaField
                name="description"
                label="Description"
                placeholder="What does this bundle include?" />
              
                <FormGrid>
                  <NumberField name="price" label="Package price" prefix="$" placeholder="620" />
                  <NumberField name="durationHours" label="Duration (hours)" placeholder="4" />
                </FormGrid>
                <NumberField name="guests" label="Guests included" placeholder="2" />
                <MultiSelectField
                name="serviceIds"
                label="Services included"
                options={services.map((s) => ({ value: s.id, label: s.name }))} />
              
                <MultiSelectField
                name="menuIds"
                label="Menus included"
                options={menus.map((m) => ({ value: m.id, label: m.name }))} />
              
                <TagsField
                name="perks"
                label="Perks"
                placeholder="Wine pairing notes, Table styling"
                hint="Separate each perk with a comma." />
              
                <SwitchField
                name="status"
                label="Package is live"
                hint="Inactive packages cannot be selected on new bookings." />
              
              </div>
              <ModalFooter>
                <Button variant="secondary" type="button" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">{editing.id ? 'Save changes' : 'Create package'}</Button>
              </ModalFooter>
            </Form>
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete package"
        message={`Delete “${deleting?.name}”? Bookings already using it keep their agreed price.`}
        onConfirm={() => deleting && removePackage(deleting.id)}
        onClose={() => setDeleting(null)} />
      
    </div>);

}