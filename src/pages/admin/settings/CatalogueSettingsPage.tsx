import { useEffect, useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Toolbar } from '../../../components/ui/Toolbar';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { RowActions } from '../../../components/ui/RowActions';
import { ImageField, SwitchField, TextAreaField, TextField } from '../../../components/form/Fields';
import { ApiError } from '../../../config/api';
import {
  createCatalogueItem,
  deleteCatalogueItem,
  listCatalogue,
  updateCatalogueItem,
  type CatalogueItem,
  type CatalogueKind } from
'../../../services/admin/settingsServices';
import { SettingsBackLink } from './SettingsBackLink';

const errorMessage = (err: unknown, fallback: string): string => err instanceof ApiError ? err.message : fallback;

interface FormValues {
  id?: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  /** New picture to upload (protein options); the current one stays if none is chosen. */
  image: File | null;
  currentImage: string | null;
}

const empty: FormValues = { name: '', description: '', status: 'active', image: null, currentImage: null };

const schema = Yup.object({
  name: Yup.string().trim().required('Name is required').max(80, 'Keep it under 80 characters'),
  description: Yup.string().max(300, 'Keep it under 300 characters')
});

export interface CatalogueCopy {
  title: string;
  description: string;
  /** Singular, lowercase: "event type". */
  noun: string;
  namePlaceholder: string;
  descriptionPlaceholder: string;
  /** Entries have a picture (protein options), shown in the app. */
  withImage?: boolean;
}

/** Settings page for a simple named list (event types, protein options): add, edit, switch off, delete. */
export function CatalogueSettingsPage({ kind, copy }: {kind: CatalogueKind;copy: CatalogueCopy;}) {
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [deleting, setDeleting] = useState<CatalogueItem | null>(null);
  const Noun = copy.noun.charAt(0).toUpperCase() + copy.noun.slice(1);

  useEffect(() => {
    listCatalogue(kind).
    then(setItems).
    catch((err) => toast.error(errorMessage(err, `Could not load ${copy.noun}s.`))).
    finally(() => setLoading(false));
  }, [kind, copy.noun]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)) : items;
  }, [items, search]);

  const edit = (i: CatalogueItem) =>
  setEditing({
    id: i.id,
    name: i.name,
    description: i.description,
    status: i.isActive ? 'active' : 'inactive',
    image: null,
    currentImage: i.proteinImage
  });

  const handleDelete = async (item: CatalogueItem) => {
    try {
      await deleteCatalogueItem(kind, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`${item.name} deleted.`);
    } catch (err) {
      toast.error(errorMessage(err, `Could not delete this ${copy.noun}.`));
    }
  };

  const columns: Column<CatalogueItem>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (i) =>
    <div className="flex max-w-md items-center gap-3">
          {copy.withImage ?
      i.proteinImage ?
      <img src={i.proteinImage} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-ink-100 object-cover" /> :

      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-[10px] text-ink-400">
                No pic
              </span> :

      null}
          <div>
            <p className="font-medium text-ink-950">{i.name}</p>
            {i.description ? <p className="mt-0.5 text-xs text-ink-500">{i.description}</p> : null}
          </div>
        </div>

  },
  {
    key: 'status',
    header: 'Status',
    render: (i) => <Badge tone={i.isActive ? 'success' : 'neutral'}>{i.isActive ? 'Active' : 'Inactive'}</Badge>
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '110px',
    render: (i) => <RowActions onEdit={() => edit(i)} onDelete={() => setDeleting(i)} />
  }];


  return (
    <div>
      <SettingsBackLink />
      <PageHeader
        title={copy.title}
        description={copy.description}
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(empty)}>
            Add {copy.noun}
          </Button>
        } />


      <Card>
        <CardHeader
          title={`All ${copy.noun}s`}
          description={loading ? 'Loading…' : `${items.length} total · ${items.filter((i) => i.isActive).length} active`} />

        <Toolbar search={search} onSearch={setSearch} placeholder={`Search ${copy.noun}s…`} />
        {loading ?
        <p className="px-5 py-12 text-center text-sm text-ink-500">Loading…</p> :

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(i) => i.id}
          onRowClick={edit}
          emptyTitle={search ? `No ${copy.noun}s match your search` : `No ${copy.noun}s yet`}
          emptyDescription={search ? 'Try a different name.' : `Add your first ${copy.noun}.`} />

        }
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        closeOnOverlayClick={false}
        title={editing?.id ? `Edit ${copy.noun}` : `Add ${copy.noun}`}
        description={`Only active ${copy.noun}s are shown in the app.`}
        size="md">

        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            const input = {
              name: values.name.trim(),
              description: values.description.trim(),
              isActive: values.status === 'active',
              proteinImage: copy.withImage ? values.image : undefined
            };
            try {
              if (values.id) {
                const updated = await updateCatalogueItem(kind, values.id, input);
                setItems((prev) => prev.map((i) => i.id === updated.id ? updated : i));
                toast.success(`${updated.name} updated.`);
              } else {
                const created = await createCatalogueItem(kind, input);
                setItems((prev) => [created, ...prev]);
                toast.success(`${created.name} added.`);
              }
              setEditing(null);
            } catch (err) {
              toast.error(errorMessage(err, `Could not save this ${copy.noun}.`));
            } finally {
              setSubmitting(false);
            }
          }}>

            {({ isSubmitting }) =>
          <Form>
                <div className="space-y-4 px-6 py-5">
                  <TextField name="name" label="Name" placeholder={copy.namePlaceholder} />
                  <TextAreaField name="description" label="Description (optional)" rows={2} placeholder={copy.descriptionPlaceholder} />
                  {copy.withImage ?
              <ImageField
                name="image"
                label="Picture"
                hint={editing.currentImage ? 'The current picture is kept unless you choose a new one.' : 'Shown in the app next to this option. JPG or PNG, up to 2 MB.'}
                previewUrl={editing.currentImage || undefined} /> :

              null}
                  <SwitchField name="status" label={`${Noun} is active`} hint="Inactive entries are kept but hidden in the app." />
                </div>
                <ModalFooter>
                  <Button variant="secondary" type="button" disabled={isSubmitting} onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : editing.id ? 'Save changes' : `Add ${copy.noun}`}
                  </Button>
                </ModalFooter>
              </Form>
          }
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${copy.noun}`}
        message={`Delete “${deleting?.name}”? To hide it without deleting, switch it off instead.`}
        onConfirm={() => deleting && handleDelete(deleting)}
        onClose={() => setDeleting(null)} />

    </div>);

}

export function EventTypesPage() {
  return (
    <CatalogueSettingsPage
      kind="event-types"
      copy={{
        title: 'Event types',
        description: 'The kinds of events customers can book for, e.g. Wedding, Birthday, Corporate dinner.',
        noun: 'event type',
        namePlaceholder: 'e.g. Wedding',
        descriptionPlaceholder: 'Optional note about this event type'
      }} />);


}

export function ProteinOptionsPage() {
  return (
    <CatalogueSettingsPage
      kind="protein-options"
      copy={{
        title: 'Protein options',
        description: 'Proteins customers can choose from, e.g. Full Cow, Ram, Chicken Carton.',
        noun: 'protein option',
        namePlaceholder: 'e.g. Chicken Carton',
        descriptionPlaceholder: 'Optional note, e.g. what a carton contains',
        withImage: true
      }} />);


}
