import React, { useMemo, useState } from 'react';
import { FieldArray, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Plus, Trash2 } from 'lucide-react';
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
  FieldSectionTitle,
  FormGrid,
  NumberField,
  SelectField,
  SwitchField,
  TextField } from
'../../components/form/Fields';
import { useAdminData } from '../../contexts/AdminDataContext';
import { formatCurrency, formatCurrencyPrecise, groceryTotal, titleCase, uid } from '../../utils/format';
import type { Menu } from '../../types';

const schema = Yup.object({
  name: Yup.string().required('Menu name is required'),
  cuisine: Yup.string().required('Cuisine is required'),
  serviceId: Yup.string().required('Select the service this menu belongs to'),
  serves: Yup.number().typeError('Enter a number').required('Serves is required').min(1),
  pricePerHead: Yup.number().typeError('Enter a number').required('Price per head is required').min(1),
  courses: Yup.array().
  of(
    Yup.object({
      course: Yup.string().required('Course is required'),
      name: Yup.string().required('Dish name is required')
    })
  ).
  min(1, 'Add at least one course'),
  groceries: Yup.array().of(
    Yup.object({
      name: Yup.string().required('Item is required'),
      quantity: Yup.number().typeError('Enter a number').required('Qty required').min(0.01),
      unitCost: Yup.number().typeError('Enter a number').required('Cost required').min(0)
    })
  )
});

const emptyMenu: Menu = {
  id: '',
  name: '',
  cuisine: '',
  serviceId: '',
  serves: 4,
  pricePerHead: 0,
  courses: [],
  groceries: [],
  status: 'active',
  createdAt: new Date().toISOString().slice(0, 10)
};

export function Menus() {
  const { menus, services, saveMenu, removeMenu, lookup } = useAdminData();
  const [search, setSearch] = useState('');
  const [service, setService] = useState('all');
  const [editing, setEditing] = useState<Menu | null>(null);
  const [deleting, setDeleting] = useState<Menu | null>(null);

  const rows = useMemo(
    () =>
    menus.filter(
      (m) =>
      (service === 'all' || m.serviceId === service) && (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.cuisine.toLowerCase().includes(search.toLowerCase()))
    ),
    [menus, search, service]
  );

  const columns: Column<Menu>[] = [
  {
    key: 'menu',
    header: 'Menu',
    render: (m) =>
    <div>
          <p className="font-medium text-ink-950">{m.name}</p>
          <p className="text-xs text-ink-500">{m.cuisine}</p>
        </div>

  },
  { key: 'service', header: 'Service', render: (m) => lookup.serviceName(m.serviceId) },
  { key: 'courses', header: 'Courses', align: 'center', render: (m) => m.courses.length },
  { key: 'serves', header: 'Serves', align: 'center', render: (m) => m.serves },
  {
    key: 'grocery',
    header: 'Grocery cost',
    align: 'right',
    render: (m) => formatCurrency(groceryTotal(m.groceries))
  },
  {
    key: 'perHead',
    header: 'Price / head',
    align: 'right',
    render: (m) => <span className="font-medium">{formatCurrency(m.pricePerHead)}</span>
  },
  {
    key: 'margin',
    header: 'Food cost',
    align: 'right',
    render: (m) => {
      const revenue = m.pricePerHead * m.serves;
      const pct = revenue ? Math.round(groceryTotal(m.groceries) / revenue * 100) : 0;
      return (
        <Badge tone={pct > 40 ? 'danger' : pct > 28 ? 'warning' : 'success'}>{pct}%</Badge>);

    }
  },
  {
    key: 'status',
    header: 'Status',
    render: (m) => <Badge tone={statusTone(m.status)}>{titleCase(m.status)}</Badge>
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '110px',
    render: (m) => <RowActions onEdit={() => setEditing(m)} onDelete={() => setDeleting(m)} />
  }];


  return (
    <div>
      <PageHeader
        title="Menus & Groceries"
        description="Build course-by-course menus and itemise the grocery costing behind each one."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyMenu)}>
            New menu
          </Button>
        } />
      

      <Card>
        <CardHeader
          title="Menu library"
          description="Food cost is grocery spend as a share of menu revenue" />
        
        <Toolbar search={search} onSearch={setSearch} placeholder="Search menus or cuisine…">
          <FilterSelect
            label="Service filter"
            value={service}
            onChange={setService}
            options={[
            { value: 'all', label: 'All services' },
            ...services.map((s) => ({ value: s.id, label: s.name }))]
            } />
          
        </Toolbar>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(m) => m.id}
          emptyTitle="No menus found"
          emptyDescription="Create a menu and attach its grocery list to track food cost." />
        
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit menu' : 'New menu'}
        description="Courses are shown to customers; grocery costing stays internal."
        size="xl">
        
        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={(values) => {
            saveMenu({
              ...values,
              id: values.id || uid('mnu'),
              courses: values.courses.map((c) => ({ ...c, id: c.id || uid('crs') })),
              groceries: values.groceries.map((g) => ({ ...g, id: g.id || uid('grc') }))
            });
            setEditing(null);
          }}>
          
            {({ values }) => {
            const grocery = groceryTotal(values.groceries);
            const revenue = Number(values.pricePerHead || 0) * Number(values.serves || 0);
            const pct = revenue ? Math.round(grocery / revenue * 100) : 0;
            return (
              <Form>
                  <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
                    <FormGrid>
                      <TextField name="name" label="Menu name" placeholder="Autumn Harvest Tasting" />
                      <TextField name="cuisine" label="Cuisine" placeholder="Modern European" />
                    </FormGrid>
                    <FormGrid>
                      <SelectField
                      name="serviceId"
                      label="Service"
                      options={services.map((s) => ({ value: s.id, label: s.name }))} />
                    
                      <NumberField name="serves" label="Serves (guests)" placeholder="8" />
                    </FormGrid>
                    <NumberField
                    name="pricePerHead"
                    label="Price per head"
                    prefix="$"
                    placeholder="145" />
                  
                    <SwitchField
                    name="status"
                    label="Menu is bookable"
                    hint="Inactive menus stay in the library but cannot be attached to bookings." />
                  

                    <div className="border-t border-ink-200 pt-5">
                      <FieldSectionTitle>Courses</FieldSectionTitle>
                      <FieldArray name="courses">
                        {({ push, remove }) =>
                      <div className="mt-3 space-y-3">
                            {values.courses.length === 0 ?
                        <p className="rounded-lg border border-dashed border-ink-300 px-4 py-6 text-center text-sm text-ink-500">
                                No courses added yet.
                              </p> :
                        null}
                            {values.courses.map((course, i) =>
                        <div
                          key={course.id || i}
                          className="flex items-start gap-3 rounded-xl border border-ink-200 bg-ink-50/50 p-4">
                          
                                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                                  <TextField
                              name={`courses.${i}.course`}
                              label="Course"
                              placeholder="Starter" />
                            
                                  <TextField
                              name={`courses.${i}.name`}
                              label="Dish"
                              placeholder="Cured trout" />
                            
                                  <TextField
                              name={`courses.${i}.description`}
                              label="Detail"
                              placeholder="Beet, dill crème fraîche" />
                            
                                </div>
                                <button
                            type="button"
                            onClick={() => remove(i)}
                            aria-label={`Remove course ${i + 1}`}
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
                          onClick={() =>
                          push({ id: uid('crs'), course: '', name: '', description: '' })
                          }>
                          
                              Add course
                            </Button>
                          </div>
                      }
                      </FieldArray>
                    </div>

                    <div className="border-t border-ink-200 pt-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <FieldSectionTitle>Grocery costing</FieldSectionTitle>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-ink-500">
                            Total{' '}
                            <span className="font-heading font-semibold text-ink-950">
                              {formatCurrencyPrecise(grocery)}
                            </span>
                          </span>
                          <Badge tone={pct > 40 ? 'danger' : pct > 28 ? 'warning' : 'success'}>
                            {pct}% food cost
                          </Badge>
                        </div>
                      </div>

                      <FieldArray name="groceries">
                        {({ push, remove }) =>
                      <div className="mt-3 space-y-3">
                            {values.groceries.length === 0 ?
                        <p className="rounded-lg border border-dashed border-ink-300 px-4 py-6 text-center text-sm text-ink-500">
                                No grocery items costed yet.
                              </p> :
                        null}
                            {values.groceries.map((item, i) =>
                        <div
                          key={item.id || i}
                          className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4">
                          
                                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                                  <TextField
                              name={`groceries.${i}.name`}
                              label="Item"
                              placeholder="Duck breast" />
                            
                                  <NumberField
                              name={`groceries.${i}.quantity`}
                              label="Qty"
                              placeholder="8" />
                            
                                  <TextField
                              name={`groceries.${i}.unit`}
                              label="Unit"
                              placeholder="kg" />
                            
                                  <NumberField
                              name={`groceries.${i}.unitCost`}
                              label="Unit cost"
                              prefix="$"
                              placeholder="14.50" />
                            
                                </div>
                                <button
                            type="button"
                            onClick={() => remove(i)}
                            aria-label={`Remove grocery item ${i + 1}`}
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
                          onClick={() =>
                          push({
                            id: uid('grc'),
                            name: '',
                            quantity: 1,
                            unit: 'kg',
                            unitCost: 0
                          })
                          }>
                          
                              Add grocery item
                            </Button>
                          </div>
                      }
                      </FieldArray>
                    </div>
                  </div>
                  <ModalFooter>
                    <Button variant="secondary" type="button" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editing.id ? 'Save changes' : 'Create menu'}</Button>
                  </ModalFooter>
                </Form>);

          }}
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete menu"
        message={`Delete “${deleting?.name}”? Bookings referencing it will show as unassigned.`}
        onConfirm={() => deleting && removeMenu(deleting.id)}
        onClose={() => setDeleting(null)} />
      
    </div>);

}