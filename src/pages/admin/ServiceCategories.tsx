import React, { useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge, statusTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RowActions } from '../../components/ui/RowActions';
import { SwitchField, TextAreaField, TextField } from '../../components/form/Fields';
import { useAdminData } from '../../contexts/AdminDataContext';
import { formatDate, slugify, titleCase, uid } from '../../utils/format';
import type { ServiceCategory } from '../../types';

const schema = Yup.object({
  name: Yup.string().required('Category name is required').min(3, 'Too short'),
  description: Yup.string().required('Add a short description').max(180, 'Keep it under 180 characters')
});

const emptyCategory: ServiceCategory = {
  id: '',
  name: '',
  slug: '',
  description: '',
  icon: 'UtensilsCrossed',
  status: 'active',
  createdAt: new Date().toISOString().slice(0, 10)
};

export function ServiceCategories() {
  const { categories, services, saveCategory, removeCategory } = useAdminData();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const [deleting, setDeleting] = useState<ServiceCategory | null>(null);

  const rows = useMemo(
    () =>
    categories.filter(
      (c) =>
      (status === 'all' || c.status === status) && (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()))
    ),
    [categories, search, status]
  );

  const columns: Column<ServiceCategory>[] = [
  {
    key: 'name',
    header: 'Category',
    render: (c) =>
    <div>
          <p className="font-medium text-ink-950">{c.name}</p>
          <p className="text-xs text-ink-500">/{c.slug}</p>
        </div>

  },
  {
    key: 'description',
    header: 'Description',
    render: (c) => <p className="max-w-md text-ink-600">{c.description}</p>
  },
  {
    key: 'services',
    header: 'Services',
    align: 'center',
    render: (c) =>
    <span className="font-medium">
          {services.filter((s) => s.categoryId === c.id).length}
        </span>

  },
  { key: 'created', header: 'Created', render: (c) => formatDate(c.createdAt) },
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


  return (
    <div>
      <PageHeader
        title="Service Categories"
        description="Group services into the categories customers browse on the marketplace."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyCategory)}>
            New category
          </Button>
        } />
      

      <Card>
        <Toolbar search={search} onSearch={setSearch} placeholder="Search categories…">
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
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          emptyTitle="No categories found"
          emptyDescription="Create a category to start organising your service catalogue." />
        
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit category' : 'New category'}
        description="Categories control how services are grouped and filtered."
        size="md">
        
        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={(values) => {
            saveCategory({
              ...values,
              id: values.id || uid('cat'),
              slug: slugify(values.name)
            });
            setEditing(null);
          }}>
          
            {({ isSubmitting }) =>
          <Form>
                <div className="space-y-4 px-6 py-5">
                  <TextField name="name" label="Category name" placeholder="e.g. Private Dining" />
                  <TextAreaField
                name="description"
                label="Description"
                placeholder="What kind of services live in this category?" />
              
                  <SwitchField
                name="status"
                label="Visible to customers"
                hint="Inactive categories stay in the catalogue but are hidden from browse." />
              
                </div>
                <ModalFooter>
                  <Button variant="secondary" type="button" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {editing.id ? 'Save changes' : 'Create category'}
                  </Button>
                </ModalFooter>
              </Form>
          }
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete category"
        message={`Delete “${deleting?.name}”? Services assigned to it will need to be re-categorised.`}
        onConfirm={() => deleting && removeCategory(deleting.id)}
        onClose={() => setDeleting(null)} />
      
    </div>);

}