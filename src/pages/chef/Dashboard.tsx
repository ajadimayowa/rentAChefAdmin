import { CalendarCheck, Coins, Loader2, Plus, Star, Trash2, Utensils } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Field, FieldArray, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import {
  FieldSectionTitle,
  FormGrid,
  ImageField,
  NumberField,
  SelectField,
  TextAreaField,
  TextField } from
'../../components/form/Fields';
import { useAuthStore } from '../../store/authStore';
import { convertToThousand, formatCurrencyPrecise, formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';
import { getServicesOffered, type ServiceOfferedOption } from '../../services/servicesOfferedApis';
import { createChefMenu, type ChefMenuGroceryInput, type ChefMenuClass, type ChefMenuPricingModel, type ChefMenuType } from '../../services/chef/menuServices';
import { getChefDashboard, type ChefDashboardData } from '../../services/chef/chefServices';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

interface MenuFormValues {
  title: string;
  description: string;
  menuType: ChefMenuType | '';
  menuClass: ChefMenuClass | '';
  pricingModel: ChefMenuPricingModel | '';
  relatedServiceId: string;
  pricePerHead: number | '';
  isSignatureMenu: boolean;
  samplePictureFile: File | null;
  groceries: ChefMenuGroceryInput[];
}

const emptyMenuValues: MenuFormValues = {
  title: '',
  description: '',
  menuType: '',
  menuClass: '',
  pricingModel: '',
  relatedServiceId: '',
  pricePerHead: '',
  isSignatureMenu: true,
  samplePictureFile: null,
  groceries: []
};

const menuSchema = Yup.object({
  title: Yup.string().required('Menu title is required'),
  description: Yup.string().required('Add a short description'),
  menuType: Yup.string().oneOf(['breakfast', 'lunch', 'dinner']).required('Select when this menu is served'),
  menuClass: Yup.string().oneOf(['nigerian', 'continental']),
  pricingModel: Yup.string().oneOf(['perhead', 'plater']),
  relatedServiceId: Yup.string().required('Select the service this menu belongs to'),
  pricePerHead: Yup.number().
  typeError('Enter a number').
  required('Price per head is required').
  min(0, 'Cannot be negative'),
  groceries: Yup.array().of(
    Yup.object({
      groceryName: Yup.string().required('Item name is required'),
      unitPrice: Yup.number().typeError('Enter a number').required('Unit price is required').min(0, 'Cannot be negative')
    })
  )
});

function AddMenuModal({
  open,
  chefId,
  onClose,
  onCreated



}: {open: boolean;chefId: string;onClose: () => void;onCreated: () => void;}) {
  const [serviceOptions, setServiceOptions] = useState<ServiceOfferedOption[]>([]);

  useEffect(() => {
    if (!open) return;
    getServicesOffered().
    then((res) => setServiceOptions(res.payload)).
    catch(() => toast.error('Could not load services.'));
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add menu"
      description="Build out a menu guests can book, and cost the groceries behind it."
      size="xl">

      <Formik<MenuFormValues>
        initialValues={emptyMenuValues}
        validationSchema={menuSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            await createChefMenu(
              {
                title: values.title,
                description: values.description,
                menuType: values.menuType as ChefMenuType,
                menuClass: values.menuClass || undefined,
                pricingModel: values.pricingModel || undefined,
                relatedServiceId: values.relatedServiceId,
                pricePerHead: Number(values.pricePerHead),
                isSignatureMenu: values.isSignatureMenu,
                samplePicture: values.samplePictureFile,
                groceries: values.groceries
              },
              chefId
            );
            toast.success(`${values.title} was added to your menus.`);
            resetForm();
            onCreated();
          } catch (err) {
            toast.error(errorMessage(err, 'Could not create menu.'));
          } finally {
            setSubmitting(false);
          }
        }}>

        {({ values, isSubmitting }) => {
          const groceryTotal = values.groceries.reduce(
            (sum, g) => sum + Number(g.unitPrice || 0),
            0
          );
          return (
            <Form>
              <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
                <ImageField
                  name="samplePictureFile"
                  label="Sample picture"
                  hint="Optional — a photo of the finished plate helps guests decide." />

                <FormGrid>
                  <TextField name="title" label="Menu title" placeholder="Sunday Special" />
                  <SelectField
                    name="relatedServiceId"
                    label="Service"
                    options={serviceOptions.map((s) => ({ value: s.id, label: s.name }))} />

                </FormGrid>

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

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-200 bg-ink-50/50 px-4 py-3">
                  <Field type="checkbox" name="isSignatureMenu" className="mt-0.5 h-4 w-4 rounded border-ink-300 text-buttons focus:ring-buttons/40" />
                  <span>
                    <span className="block text-sm font-medium text-ink-800">Signature menu</span>
                    <span className="mt-0.5 block text-xs text-ink-500">
                      Feature this as one of your standout menus on your profile.
                    </span>
                  </span>
                </label>

                <div className="border-t border-ink-200 pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <FieldSectionTitle>Grocery costing</FieldSectionTitle>
                    <span className="text-sm text-ink-500">
                      Total{' '}
                      <span className="font-heading font-semibold text-ink-950">
                        {formatCurrencyPrecise(groceryTotal)}
                      </span>
                    </span>
                  </div>

                  <FieldArray name="groceries">
                    {({ push, remove }) =>
                    <div className="mt-3 space-y-3">
                        {values.groceries.length === 0 ?
                      <p className="rounded-lg border border-dashed border-ink-300 px-4 py-6 text-center text-sm text-ink-500">
                            No grocery items costed yet.
                          </p> :
                      null}
                        {values.groceries.map((_item, i) =>
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4">

                            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                              <TextField
                            name={`groceries.${i}.groceryName`}
                            label="Item"
                            placeholder="Duck breast" />

                              <TextField
                            name={`groceries.${i}.description`}
                            label="Detail"
                            placeholder="Optional note" />

                              <NumberField
                            name={`groceries.${i}.unitPrice`}
                            label="Unit price"
                            prefix="₦"
                            placeholder="4500" />

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
                        onClick={() => push({ groceryName: '', description: '', unitPrice: 0 })}>

                          Add grocery item
                        </Button>
                      </div>
                    }
                  </FieldArray>
                </div>
              </div>
              <ModalFooter>
                <Button variant="secondary" type="button" disabled={isSubmitting} onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating…' : 'Create menu'}
                </Button>
              </ModalFooter>
            </Form>);

        }}
      </Formik>
    </Modal>);

}

export function ChefDashboard() {
  const authUser = useAuthStore((s) => s.user);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [data, setData] = useState<ChefDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = () => {
    setLoading(true);
    getChefDashboard().
    then((res) => setData(res.payload)).
    catch((err) => toast.error(errorMessage(err, 'Could not load your dashboard.'))).
    finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div>
      <PageHeader
        title={`Welcome back${authUser ? `, ${authUser.name.split(' ')[0]}` : ''}`}
        description="Here's a snapshot of your bookings and standing on Rent a Chef."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setAddMenuOpen(true)}>
            Add menu
          </Button>
        } />


      {loading ?
      <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
          <p className="mt-3 text-sm text-ink-500">Loading your dashboard…</p>
        </div> :
      !data ?
      <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="font-heading text-lg font-semibold text-ink-900">Could not load your dashboard</p>
          <p className="mt-1 text-sm text-ink-500">Refresh the page to try again.</p>
        </div> :

      <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
            label="Upcoming bookings"
            value={String(data.metrics.upcomingBookings)}
            icon={<CalendarCheck className="h-4.5 w-4.5" />} />

            <StatCard
            label="Jobs completed"
            value={String(data.metrics.jobsCompleted)}
            icon={<Utensils className="h-4.5 w-4.5" />} />

            <StatCard
            label="Rating"
            value={data.metrics.rating ? data.metrics.rating.toFixed(1) : '—'}
            icon={<Star className="h-4.5 w-4.5" />} />

            <StatCard
            label="Lifetime earnings"
            value={convertToThousand(data.metrics.lifetimeEarnings)}
            icon={<Coins className="h-4.5 w-4.5" />} />

          </div>

          <Card className="mt-6">
            <CardHeader title="Upcoming bookings" />
            <div className="divide-y divide-ink-200/80">
              {data.upcomingBookings.length === 0 ?
            <p className="px-5 py-6 text-sm text-ink-500">No upcoming bookings yet.</p> :

            data.upcomingBookings.map((b) =>
            <Link
              key={b.id}
              to={`/chef/bookings/${b.id}`}
              className="flex items-center justify-between px-5 py-3 text-sm transition-colors hover:bg-ink-50/60">

                    <div>
                      <p className="font-medium text-ink-900">{b.bookingNumber}</p>
                      <p className="text-ink-500">
                        {b.customerName} · {formatDate(b.date)}
                        {b.guests != null ? ` · ${b.guests} guests` : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-buttons/15 px-2.5 py-1 text-xs font-medium text-amber-700">
                      {b.status}
                    </span>
                  </Link>
            )
            }
            </div>
          </Card>
        </>
      }

      {authUser ?
      <AddMenuModal
        open={addMenuOpen}
        chefId={authUser.id}
        onClose={() => setAddMenuOpen(false)}
        onCreated={() => setAddMenuOpen(false)} /> :

      null}
    </div>);

}
