import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { ArrowLeft, ImageOff, ListChecks, Loader2, Pencil, Tag, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { CheckboxField, TextAreaField, TextField } from '../../components/form/Fields';
import {
  deleteChefLevel,
  getChefLevel,
  updateChefLevel,
  type ChefLevelDetail } from
'../../services/admin/chefLevelServices';
import { convertToThousand, formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string()
});

export function ViewChefLevel() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const [level, setLevel] = useState<ChefLevelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getChefLevel(id).
    then(setLevel).
    catch((err) => toast.error(errorMessage(err, 'Could not load this chef level.'))).
    finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!level) return;
    try {
      await deleteChefLevel(level.id);
      toast.success(`${level.name} deleted.`);
      navigate('/admin/chef-levels');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete this chef level.'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        <p className="mt-3 text-sm text-ink-500">Loading chef level…</p>
      </div>);

  }

  if (!level || !id) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-heading text-lg font-semibold text-ink-900">Chef level not found</p>
        <Link
          to="/admin/chef-levels"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-buttons">

          <ArrowLeft className="h-4 w-4" /> Back to chef levels
        </Link>
      </div>);

  }

  return (
    <div>
      <Link
        to="/admin/chef-levels"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">

        <ArrowLeft className="h-4 w-4" /> Back to chef levels
      </Link>

      <PageHeader
        title={level.name}
        description={level.description || 'No description added yet.'}
        action={
        <div className="flex items-center gap-2">
            <Badge tone={level.isActive ? 'success' : 'neutral'}>{level.isActive ? 'Active' : 'Inactive'}</Badge>
            <Button
            variant="secondary"
            size="sm"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => setEditing(true)}>

              Edit
            </Button>
            <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => setDeleting(true)}>

              Delete
            </Button>
          </div>
        } />


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Level details" />
            <div className="grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-ink-400">Slug</p>
                <p className="mt-0.5 text-ink-800">/{level.slug}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Created</p>
                <p className="mt-0.5 text-ink-800">{formatDate(level.createdAt)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Tasks"
              description="Responsibilities associated with chefs at this level" />

            {level.tasks.length === 0 ?
            <div className="flex flex-col items-center px-5 py-10 text-center">
                <ListChecks className="h-6 w-6 text-ink-300" />
                <p className="mt-3 text-sm text-ink-500">No tasks added to this level yet.</p>
              </div> :

            <ul className="divide-y divide-ink-100">
                {level.tasks.map((task, i) =>
              <li key={i} className="px-5 py-3 text-sm text-ink-700">
                    {task}
                  </li>
              )}
              </ul>
            }
          </Card>

          <Card>
            <CardHeader
              title="Services"
              description="Priced services tied to this level" />

            {level.services.length === 0 ?
            <div className="flex flex-col items-center px-5 py-10 text-center">
                <Tag className="h-6 w-6 text-ink-300" />
                <p className="mt-3 text-sm text-ink-500">No services attached to this level yet.</p>
              </div> :

            <ul className="divide-y divide-ink-100">
                {level.services.map((service, i) =>
              <li key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="text-ink-700">{service.label}</span>
                    <span className="font-medium text-ink-900">{convertToThousand(service.price)}</span>
                  </li>
              )}
              </ul>
            }
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Photo" />
            <div className="flex items-center justify-center p-5">
              {level.image ?
              <img src={level.image} alt={level.name} className="w-full rounded-lg object-cover" /> :

              <div className="flex h-32 w-full items-center justify-center rounded-lg bg-ink-100 text-ink-400">
                  <ImageOff className="h-6 w-6" />
                </div>
              }
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit chef level"
        description="Chef levels are stored as categories, shared with the Service Categories page."
        size="md">

        <Formik
          initialValues={{
            name: level.name,
            description: level.description,
            isActive: level.isActive
          }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const updated = await updateChefLevel(level.id, {
                name: values.name,
                description: values.description || undefined,
                isActive: values.isActive
              });
              setLevel(updated);
              toast.success('Chef level updated.');
              setEditing(false);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save this chef level.'));
            } finally {
              setSubmitting(false);
            }
          }}>

          {({ isSubmitting }) =>
          <Form>
              <div className="space-y-4 px-6 py-5">
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
                <Button variant="secondary" type="button" disabled={isSubmitting} onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : 'Save changes'}
                </Button>
              </ModalFooter>
            </Form>
          }
        </Formik>
      </Modal>

      <ConfirmDialog
        open={deleting}
        title="Delete chef level"
        message={`Delete "${level.name}"? Chefs already assigned to this level will keep the reference until reassigned.`}
        onConfirm={handleDelete}
        onClose={() => setDeleting(false)} />

    </div>);

}
