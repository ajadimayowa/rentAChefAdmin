import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { ArrowLeft, ImageOff, Loader2, Pencil, Trash2, UtensilsCrossed, Users } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ImageField, NumberField, TextAreaField, TextField } from '../../components/form/Fields';
import {
  deleteSpecialMenu,
  getSpecialMenu,
  updateSpecialMenu,
  type AdminSpecialMenu,
  type SpecialMenuInput } from
'../../services/admin/specialMenuServices';
import { convertToThousand, formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const schema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  minimumGuests: Yup.number().typeError('Enter a number').required('Minimum guests is required').min(1),
  numberOfDishes: Yup.number().typeError('Enter a number').required('Number of dishes is required').min(1),
  price: Yup.number().typeError('Enter a number').required('Price is required').min(0)
});

export function ViewSpecialService() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<AdminSpecialMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSpecialMenu(id).
    then(setMenu).
    catch((err) => toast.error(errorMessage(err, 'Could not load this special service.'))).
    finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!menu) return;
    try {
      await deleteSpecialMenu(menu.id);
      toast.success(`${menu.title} deleted.`);
      navigate('/admin/special-services');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete this special service.'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        <p className="mt-3 text-sm text-ink-500">Loading special service…</p>
      </div>);

  }

  if (!menu || !id) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-heading text-lg font-semibold text-ink-900">Special service not found</p>
        <Link
          to="/admin/special-services"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-buttons">

          <ArrowLeft className="h-4 w-4" /> Back to special services
        </Link>
      </div>);

  }

  return (
    <div>
      <Link
        to="/admin/special-services"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">

        <ArrowLeft className="h-4 w-4" /> Back to special services
      </Link>

      <PageHeader
        title={menu.title}
        description={menu.description || 'No description added yet.'}
        action={
        <div className="flex items-center gap-2">
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
            <CardHeader title="Special service details" />
            <div className="grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-ink-400">Minimum guests</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-ink-800">
                  <Users className="h-3.5 w-3.5 text-ink-400" /> {menu.minimumGuests}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Number of dishes</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-ink-800">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-ink-400" /> {menu.numberOfDishes}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Price</p>
                <p className="mt-0.5 font-medium text-ink-800">{convertToThousand(menu.price)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Created</p>
                <p className="mt-0.5 text-ink-800">{formatDate(menu.createdAt)}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Photo" />
            <div className="flex items-center justify-center p-5">
              {menu.image ?
              <img src={menu.image} alt={menu.title} className="w-full rounded-lg object-cover" /> :

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
        title="Edit special service"
        description="Shown to customers as a curated, fixed-price experience."
        size="lg">

        <Formik
          initialValues={{
            title: menu.title,
            description: menu.description,
            minimumGuests: menu.minimumGuests as number | '',
            numberOfDishes: menu.numberOfDishes as number | '',
            price: menu.price as number | '',
            menuPic: null as File | null
          }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const input: SpecialMenuInput = {
                title: values.title,
                description: values.description || undefined,
                minimumGuests: Number(values.minimumGuests),
                numberOfDishes: Number(values.numberOfDishes),
                price: Number(values.price),
                menuPic: values.menuPic
              };
              const updated = await updateSpecialMenu(menu.id, input);
              setMenu(updated);
              toast.success('Special service updated.');
              setEditing(false);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save this special service.'));
            } finally {
              setSubmitting(false);
            }
          }}>

          {({ isSubmitting }) =>
          <Form>
              <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
                <TextField name="title" label="Title" placeholder="Anniversary Dinner" />
                <TextAreaField
                name="description"
                label="Description"
                placeholder="What's included in this experience?" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <NumberField name="minimumGuests" label="Minimum guests" placeholder="2" />
                  <NumberField name="numberOfDishes" label="Number of dishes" placeholder="5" />
                  <NumberField name="price" label="Price" prefix="₦" placeholder="150000" />
                </div>
                <ImageField
                name="menuPic"
                label="Menu photo"
                hint="Shown to customers browsing special services."
                previewUrl={menu.image} />

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
        title="Delete special service"
        message={`Delete "${menu.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onClose={() => setDeleting(false)} />

    </div>);

}
