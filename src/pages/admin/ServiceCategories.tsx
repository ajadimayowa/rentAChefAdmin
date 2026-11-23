import { useEffect, useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { ImageOff, Plus } from 'lucide-react';
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
import { ImageField, SwitchField, TextAreaField, TextField } from '../../components/form/Fields';
import {
  createServiceCategory,
  deleteServiceCategory,
  listServiceCategoriesFull,
  listServices,
  updateServiceCategory,
  type AdminServiceCategory } from
'../../services/admin/adminServices';
import { ApiError } from '../../config/api';
import { formatDate } from '../../utils/format';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const schema = Yup.object({
  name: Yup.string().trim().required('Category name is required').min(3, 'Too short'),
  description: Yup.string().trim().required('Add a short description').max(180, 'Keep it under 180 characters')
});

// Every new category needs a picture; when editing, the existing one is kept unless replaced.
const createSchema = schema.shape({
  image: Yup.mixed<File>().required('Choose a picture for this category')
});

interface CategoryFormValues {
  id: string;
  name: string;
  description: string;
  /** SwitchField toggles between 'active' and 'inactive'. */
  status: 'active' | 'inactive';
  image: File | null;
  /** URL of the picture already saved, shown as the preview while editing. */
  currentImage?: string;
}

const emptyCategory: CategoryFormValues = {
  id: '',
  name: '',
  description: '',
  status: 'active',
  image: null,
  currentImage: undefined
};

export function ServiceCategories() {
  const [categories, setCategories] = useState<AdminServiceCategory[]>([]);
  const [serviceCounts, setServiceCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<CategoryFormValues | null>(null);
  const [deleting, setDeleting] = useState<AdminServiceCategory | null>(null);

  useEffect(() => {
    listServiceCategoriesFull().
    then(setCategories).
    catch((err) => toast.error(errorMessage(err, 'Could not load service categories.'))).
    finally(() => setLoading(false));

    // Only used for the "Services" count column, so a failure here is non-fatal.
    listServices().
    then((res) => {
      const counts = new Map<string, number>();
      res.payload.forEach((s) => counts.set(s.categoryId, (counts.get(s.categoryId) ?? 0) + 1));
      setServiceCounts(counts);
    }).
    catch(() => undefined);
  }, []);

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
      (status === 'all' || (status === 'active') === c.isActive) && (
      c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    );
  }, [categories, search, status]);

  const handleDelete = async (category: AdminServiceCategory) => {
    try {
      await deleteServiceCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      toast.success(`${category.name} deleted.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete this category.'));
    }
  };

  const columns: Column<AdminServiceCategory>[] = [
  {
    key: 'name',
    header: 'Category',
    render: (c) =>
    <div className="flex items-center gap-3">
          {c.image ?
      <img src={c.image} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-ink-100 object-cover" /> :

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-400">
              <ImageOff className="h-4 w-4" />
            </div>
      }
          <div>
            <p className="font-medium text-ink-950">{c.name}</p>
            {c.slug ? <p className="text-xs text-ink-500">/{c.slug}</p> : null}
          </div>
        </div>

  },
  {
    key: 'description',
    header: 'Description',
    render: (c) => <p className="max-w-md text-ink-600">{c.description || '—'}</p>
  },
  {
    key: 'services',
    header: 'Services',
    align: 'center',
    render: (c) => <span className="font-medium">{serviceCounts.get(c.id) ?? 0}</span>
  },
  { key: 'created', header: 'Created', render: (c) => formatDate(c.createdAt) },
  {
    key: 'status',
    header: 'Status',
    render: (c) => <Badge tone={c.isActive ? 'success' : 'neutral'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '110px',
    render: (c) =>
    <RowActions
      onEdit={() =>
      setEditing({
        id: c.id,
        name: c.name,
        description: c.description,
        status: c.isActive ? 'active' : 'inactive',
        image: null,
        currentImage: c.image || undefined
      })
      }
      onDelete={() => setDeleting(c)} />

  }];


  const deletingCount = deleting ? serviceCounts.get(deleting.id) ?? 0 : 0;

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
        <CardHeader
          title="Category list"
          description={`${categories.length} categor${categories.length === 1 ? 'y' : 'ies'} on record`} />

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
          emptyTitle={loading ? 'Loading categories…' : 'No categories found'}
          emptyDescription={
          loading ? 'Fetching service categories.' : 'Create a category to start organising your service catalogue.'
          } />

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
          validationSchema={editing.id ? schema : createSchema}
          onSubmit={async (values, { setSubmitting }) => {
            const input = {
              name: values.name.trim(),
              description: values.description.trim(),
              isActive: values.status === 'active',
              image: values.image
            };
            try {
              if (values.id) {
                const updated = await updateServiceCategory(values.id, input);
                setCategories((prev) => prev.map((c) => c.id === updated.id ? updated : c));
                toast.success('Category updated.');
              } else {
                const created = await createServiceCategory(input);
                setCategories((prev) => [created, ...prev]);
                toast.success(`${created.name} created.`);
              }
              setEditing(null);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save this category.'));
            } finally {
              setSubmitting(false);
            }
          }}>

            {({ isSubmitting }) =>
          <Form>
                <div className="space-y-4 px-6 py-5">
                  <ImageField
                name="image"
                label="Category picture"
                hint={editing.id ? 'Choose a new image to replace the current picture.' : undefined}
                previewUrl={editing.currentImage} />

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
                  <Button
                variant="secondary"
                type="button"
                disabled={isSubmitting}
                onClick={() => setEditing(null)}>

                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : editing.id ? 'Save changes' : 'Create category'}
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
        message={
        deletingCount ?
        `Delete “${deleting?.name}”? ${deletingCount} service${deletingCount === 1 ? '' : 's'} in it will need to be re-categorised.` :
        `Delete “${deleting?.name}”?`
        }
        onConfirm={() => deleting && handleDelete(deleting)}
        onClose={() => setDeleting(null)} />

    </div>);

}
