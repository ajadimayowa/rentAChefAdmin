import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { HardHat, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RowActions } from '../../components/ui/RowActions';
import { CheckboxField, ImageField, TextAreaField, TextField } from '../../components/form/Fields';
import {
  createChefLevel,
  deleteChefLevel,
  getChefLevel,
  listChefLevels,
  updateChefLevel,
  type ChefLevelSummary } from
'../../services/admin/chefLevelServices';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const schema = Yup.object({
  name: Yup.string().trim().required('Name is required'),
  description: Yup.string()
});

// POST /category/create rejects a missing description, and every new level needs an icon.
const createSchema = Yup.object({
  name: Yup.string().trim().required('Name is required'),
  description: Yup.string().trim().required('Description is required'),
  icon: Yup.mixed<File>().required('Choose an icon for this level')
});

const emptyLevel: ChefLevelFormValues = {
  id: '',
  name: '',
  description: '',
  isActive: true,
  icon: null,
  currentIcon: undefined
};

interface ChefLevelFormValues {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  icon: File | null;
  /** URL of the icon already saved, shown as the preview while editing. */
  currentIcon?: string;
}

export function ChefLevels() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<ChefLevelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ChefLevelFormValues | null>(null);
  const [deleting, setDeleting] = useState<ChefLevelSummary | null>(null);

  const loadLevels = () => {
    setLoading(true);
    listChefLevels().
    then(setLevels).
    catch((err) => toast.error(errorMessage(err, 'Could not load chef levels.'))).
    finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLevels();
  }, []);

  const openEdit = async (level: ChefLevelSummary) => {
    try {
      const detail = await getChefLevel(level.id);
      setEditing({
        id: detail.id,
        name: detail.name,
        description: detail.description,
        isActive: detail.isActive,
        icon: null,
        currentIcon: detail.image || undefined
      });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not load this chef level.'));
    }
  };

  const handleDelete = async (level: ChefLevelSummary) => {
    try {
      await deleteChefLevel(level.id);
      setLevels((prev) => prev.filter((l) => l.id !== level.id));
      toast.success(`${level.name} deleted.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete this chef level.'));
    }
  };

  const rows = useMemo(
    () => levels.filter((l) => l.name.toLowerCase().includes(search.toLowerCase())),
    [levels, search]
  );

  const columns: Column<ChefLevelSummary>[] = [
  {
    key: 'level',
    header: 'Chef level',
    render: (l) =>
    <div className="flex items-center gap-3">
          {l.image ?
      <img src={l.image} alt="" className="h-9 w-9 shrink-0 rounded-lg bg-ink-100 object-cover" /> :

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-400">
              <HardHat className="h-4 w-4" />
            </div>
      }
          <p className="font-medium text-ink-950">{l.name}</p>
        </div>

  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '110px',
    render: (l) =>
    <RowActions
      onView={() => navigate(`/admin/chef-levels/${l.id}`)}
      onEdit={() => openEdit(l)}
      onDelete={() => setDeleting(l)} />

  }];


  return (
    <div>
      <PageHeader
        title="Chef Levels"
        description="The tiers chefs are assigned to across the platform, used when creating chef profiles and setting tier pricing."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyLevel)}>
            New chef level
          </Button>
        } />


      <Card>
        <CardHeader
          title="Chef level list"
          description={`${levels.length} chef level${levels.length === 1 ? '' : 's'} on record`} />

        <Toolbar search={search} onSearch={setSearch} placeholder="Search chef levels…" />
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(l) => l.id}
          onRowClick={(l) => navigate(`/admin/chef-levels/${l.id}`)}
          emptyTitle={loading ? 'Loading chef levels…' : 'No chef levels found'}
          emptyDescription={
          loading ?
          'Fetching chef levels.' :
          'Create one with the “New chef level” button.'
          } />

      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit chef level' : 'New chef level'}
        description="Chef levels are stored as categories, shared with the Service Categories page."
        size="md">

        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={editing.id ? schema : createSchema}
          onSubmit={async (values, { setSubmitting }) => {
            const input = {
              name: values.name.trim(),
              description: values.description.trim() || undefined,
              isActive: values.isActive,
              icon: values.icon
            };
            try {
              if (values.id) {
                const updated = await updateChefLevel(values.id, input);
                setLevels((prev) =>
                prev.map((l) =>
                l.id === updated.id ? { id: updated.id, name: updated.name, image: updated.image } : l
                )
                );
                toast.success('Chef level updated.');
              } else {
                const created = await createChefLevel(input);
                setLevels((prev) => [{ id: created.id, name: created.name, image: created.image }, ...prev]);
                toast.success(`${created.name} created.`);
              }
              setEditing(null);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save this chef level.'));
            } finally {
              setSubmitting(false);
            }
          }}>

            {({ isSubmitting }) =>
          <Form>
                <div className="space-y-4 px-6 py-5">
                  <ImageField
                name="icon"
                label="Level icon"
                hint={editing.id ? 'Choose a new image to replace the current icon.' : undefined}
                previewUrl={editing.currentIcon} />

                  <TextField name="name" label="Level name" placeholder="Senior Chef" />
                  <TextAreaField
                name="description"
                label="Description"
                placeholder="What does a chef at this level handle?" />

                  <CheckboxField
                name="isActive"
                label="Active"
                hint="Inactive levels stay on record but shouldn't be assigned to new chefs." />

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
                    {isSubmitting ? 'Saving…' : editing.id ? 'Save changes' : 'Create chef level'}
                  </Button>
                </ModalFooter>
              </Form>
          }
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete chef level"
        message={`Delete "${deleting?.name}"? Chefs already assigned to this level will keep the reference until reassigned.`}
        onConfirm={() => deleting && handleDelete(deleting)}
        onClose={() => setDeleting(null)} />

    </div>);

}
