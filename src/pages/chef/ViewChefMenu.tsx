import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { ArrowLeft, ImageOff, Loader2, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  CheckboxField,
  FormGrid,
  ImageField,
  NumberField,
  SelectField,
  TextAreaField,
  TextField } from
'../../components/form/Fields';
import {
  addChefMenuGrocery,
  deleteChefMenu,
  deleteChefMenuGrocery,
  getChefMenuById,
  updateChefMenu,
  type ChefMenu,
  type ChefMenuClass,
  type ChefMenuPricingModel,
  type ChefMenuType } from
'../../services/chef/menuServices';
import { convertToThousand, formatDate, titleCase } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const editSchema = Yup.object({
  title: Yup.string().required('Menu title is required'),
  description: Yup.string().required('Add a short description'),
  menuType: Yup.string().oneOf(['breakfast', 'lunch', 'dinner']).required('Select when this menu is served'),
  pricePerHead: Yup.number().
  typeError('Enter a number').
  required('Price per head is required').
  min(0, 'Cannot be negative')
});

function AddGroceryForm({ menuId, onAdded }: {menuId: string;onAdded: (menu: ChefMenu) => void;}) {
  const [groceryName, setGroceryName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!groceryName.trim() || unitPrice === '') {
      toast.error('Enter an item name and unit price.');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await addChefMenuGrocery(menuId, {
        groceryName: groceryName.trim(),
        description: description.trim() || undefined,
        unitPrice: Number(unitPrice)
      });
      onAdded(updated);
      setGroceryName('');
      setDescription('');
      setUnitPrice('');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add grocery item.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 border-t border-ink-200 p-5 sm:flex-row sm:items-end">
      <label className="flex-1 text-sm">
        <span className="mb-1 block font-medium text-ink-700">Item</span>
        <input
          value={groceryName}
          onChange={(e) => setGroceryName(e.target.value)}
          placeholder="Duck breast"
          className="h-10 w-full rounded-lg border border-ink-200 px-3 text-sm focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25" />

      </label>
      <label className="flex-1 text-sm">
        <span className="mb-1 block font-medium text-ink-700">Detail</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional note"
          className="h-10 w-full rounded-lg border border-ink-200 px-3 text-sm focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25" />

      </label>
      <label className="w-full text-sm sm:w-32">
        <span className="mb-1 block font-medium text-ink-700">Unit price</span>
        <input
          type="number"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          placeholder="4500"
          className="h-10 w-full rounded-lg border border-ink-200 px-3 text-sm focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25" />

      </label>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<Plus className="h-4 w-4" />}
        disabled={submitting}
        onClick={handleAdd}
        className="sm:mb-0.5">

        Add item
      </Button>
    </div>);

}

export function ViewChefMenu() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<ChefMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getChefMenuById(id).
    then(setMenu).
    catch((err) => toast.error(errorMessage(err, 'Could not load this menu.'))).
    finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!menu) return;
    try {
      await deleteChefMenu(menu.id);
      toast.success(`${menu.title} deleted.`);
      navigate('/chef/menus');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete this menu.'));
    }
  };

  const handleRemoveGrocery = async (groceryId: string) => {
    if (!menu) return;
    try {
      const updated = await deleteChefMenuGrocery(menu.id, groceryId);
      setMenu(updated);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove that grocery item.'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        <p className="mt-3 text-sm text-ink-500">Loading menu…</p>
      </div>);

  }

  if (!menu || !id) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-heading text-lg font-semibold text-ink-900">Menu not found</p>
        <Link to="/chef/menus" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-buttons">
          <ArrowLeft className="h-4 w-4" /> Back to menus
        </Link>
      </div>);

  }

  return (
    <div>
      <Link
        to="/chef/menus"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">

        <ArrowLeft className="h-4 w-4" /> Back to menus
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
            <CardHeader title="Menu details" />
            <div className="grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-ink-400">Served at</p>
                <p className="mt-0.5"><Badge tone="neutral">{titleCase(menu.menuType)}</Badge></p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Cuisine class</p>
                <p className="mt-0.5 text-ink-800">{menu.menuClass ? titleCase(menu.menuClass) : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Pricing model</p>
                <p className="mt-0.5 text-ink-800">{menu.pricingModel ? titleCase(menu.pricingModel) : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Price per head</p>
                <p className="mt-0.5 font-medium text-ink-800">{convertToThousand(menu.pricePerHead)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Signature menu</p>
                <p className="mt-0.5">
                  {menu.isSignatureMenu ?
                  <Badge tone="brand">
                      <Star className="mr-1 inline h-3 w-3" /> Yes
                    </Badge> :

                  <span className="text-ink-400">—</span>
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Created</p>
                <p className="mt-0.5 text-ink-800">{formatDate(menu.createdAt)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Grocery costing"
              description={`Total ${convertToThousand(menu.totalGroceryCost)}`} />

            {menu.groceries.length === 0 ?
            <p className="px-5 py-6 text-sm text-ink-500">No grocery items costed yet.</p> :

            <div className="divide-y divide-ink-200/80">
                {menu.groceries.map((g) =>
              <div key={g.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink-900">{g.groceryName}</p>
                      {g.description ? <p className="text-ink-500">{g.description}</p> : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-ink-800">{convertToThousand(g.unitPrice)}</span>
                      <button
                    type="button"
                    onClick={() => handleRemoveGrocery(g.id)}
                    aria-label={`Remove ${g.groceryName}`}
                    className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600">

                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
              )}
              </div>
            }
            <AddGroceryForm menuId={menu.id} onAdded={setMenu} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Photo" />
            <div className="flex items-center justify-center p-5">
              {menu.samplePicture ?
              <img src={menu.samplePicture} alt={menu.title} className="w-full rounded-lg object-cover" /> :

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
        title="Edit menu"
        description="Update what guests see when they browse this menu."
        size="lg">

        <Formik
          initialValues={{
            title: menu.title,
            description: menu.description,
            menuType: menu.menuType as ChefMenuType,
            menuClass: (menu.menuClass ?? '') as ChefMenuClass | '',
            pricingModel: (menu.pricingModel ?? '') as ChefMenuPricingModel | '',
            pricePerHead: menu.pricePerHead as number | '',
            isSignatureMenu: menu.isSignatureMenu,
            samplePictureFile: null as File | null
          }}
          validationSchema={editSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const updated = await updateChefMenu(menu.id, {
                title: values.title,
                description: values.description,
                menuType: values.menuType,
                menuClass: values.menuClass || undefined,
                pricingModel: values.pricingModel || undefined,
                pricePerHead: Number(values.pricePerHead),
                isSignatureMenu: values.isSignatureMenu,
                samplePicture: values.samplePictureFile
              });
              setMenu(updated);
              toast.success('Menu updated.');
              setEditing(false);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save this menu.'));
            } finally {
              setSubmitting(false);
            }
          }}>

          {({ isSubmitting }) =>
          <Form>
              <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
                <TextField name="title" label="Menu title" placeholder="Sunday Special" />
                <TextAreaField
                name="description"
                label="Description"
                rows={3}
                placeholder="Smoky party jollof rice with grilled chicken." />


                <FormGrid>
                  <SelectField
                  name="menuType"
                  label="Served at"
                  options={[
                  { value: 'breakfast', label: 'Breakfast' },
                  { value: 'lunch', label: 'Lunch' },
                  { value: 'dinner', label: 'Dinner' }]
                  } />

                  <SelectField
                  name="menuClass"
                  label="Cuisine class"
                  options={[
                  { value: 'nigerian', label: 'Nigerian' },
                  { value: 'continental', label: 'Continental' }]
                  } />

                </FormGrid>

                <FormGrid>
                  <SelectField
                  name="pricingModel"
                  label="Pricing model"
                  options={[
                  { value: 'perhead', label: 'Per head' },
                  { value: 'plater', label: 'Per platter' }]
                  } />

                  <NumberField name="pricePerHead" label="Price per head" prefix="₦" placeholder="6500" />
                </FormGrid>

                <CheckboxField
                name="isSignatureMenu"
                label="Signature menu"
                hint="Feature this as one of your standout menus on your profile." />


                <ImageField
                name="samplePictureFile"
                label="Sample picture"
                hint="Upload a new photo to replace the current one."
                previewUrl={menu.samplePicture} />

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
        title="Delete menu"
        message={`Delete "${menu.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onClose={() => setDeleting(false)} />

    </div>);

}
