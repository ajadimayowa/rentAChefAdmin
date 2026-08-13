import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RowActions } from '../../components/ui/RowActions';
import {
  FormGrid,
  ImageField,
  MultiSelectSearchField,
  NumberField,
  SwitchField,
  TagsField,
  TextAreaField,
  TextField } from
'../../components/form/Fields';
import {
  createAdminPackage,
  deleteAdminPackage,
  listAdminPackages,
  updateAdminPackage,
  type AdminPackage,
  type PackageInput } from
'../../services/admin/packageServices';
import { listServices, type AdminService } from '../../services/admin/adminServices';
import { listAdminMenus, type AdminMenu } from '../../services/admin/menuServices';
import { convertToThousand } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

interface PackageFormValues {
  id?: string;
  title: string;
  description: string;
  price: number | '';
  durationHours: number | '';
  guests: number | '';
  serviceIds: string[];
  menus: string[];
  perks: string[];
  isActive: boolean;
  packageImage: File | null;
}

const emptyPackageForm: PackageFormValues = {
  title: '',
  description: '',
  price: '',
  durationHours: 4,
  guests: 2,
  serviceIds: [],
  menus: [],
  perks: [],
  isActive: true,
  packageImage: null
};

const toFormValues = (pkg: AdminPackage): PackageFormValues => ({
  id: pkg.id,
  title: pkg.title,
  description: pkg.description,
  price: pkg.price,
  durationHours: pkg.durationHours,
  guests: pkg.guests,
  serviceIds: pkg.services.map((s) => s.id),
  menus: pkg.menus.map((m) => m.id),
  perks: pkg.perks,
  isActive: pkg.isActive,
  packageImage: null
});

const schema = Yup.object({
  title: Yup.string().required('Package name is required'),
  description: Yup.string().required('Add a description').max(200, 'Keep it under 200 characters'),
  price: Yup.number().typeError('Enter a number').required('Price is required').min(0),
  durationHours: Yup.number().typeError('Enter a number').required('Duration is required').min(0),
  guests: Yup.number().typeError('Enter a number').required('Guest count is required').min(1),
  serviceIds: Yup.array().of(Yup.string()).min(1, 'Select at least one service')
});

export function Packages() {
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<AdminService[]>([]);
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<PackageFormValues | null>(null);
  const [deleting, setDeleting] = useState<AdminPackage | null>(null);

  const loadPackages = () => {
    setLoading(true);
    listAdminPackages().
    then(setPackages).
    catch((err) => toast.error(errorMessage(err, 'Could not load packages.'))).
    finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPackages();
    listServices().then((res) => setServices(res.payload)).catch(() => toast.error('Could not load services.'));
    listAdminMenus({ limit: 200 }).
    then((res) => setMenus(res.data)).
    catch(() => toast.error('Could not load menus.'));
  }, []);

  const handleDelete = async (pkg: AdminPackage) => {
    try {
      await deleteAdminPackage(pkg.id);
      setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
      toast.success(`${pkg.title} deleted.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete package.'));
    }
  };

  const rows = packages.filter(
    (p) =>
    (status === 'all' || (status === 'active') === p.isActive) && (
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="Packages"
        description="Bundle services, menus and perks into a single fixed-price offer."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyPackageForm)}>
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
          <p className="font-heading text-[15px] font-semibold text-ink-900">
            {loading ? 'Loading packages…' : 'No packages found'}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            {loading ? 'Fetching the package catalogue.' : 'Bundle a service with a menu to create your first package.'}
          </p>
        </Card> :

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {rows.map((pkg) =>
        <Card key={pkg.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-ink-950">{pkg.title}</h3>
                  <Badge tone={pkg.isActive ? 'success' : 'neutral'}>{pkg.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <RowActions
              onEdit={() => setEditing(toFormValues(pkg))}
              onDelete={() => setDeleting(pkg)} />

              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink-600">{pkg.description}</p>

              <dl className="mt-5 grid grid-cols-3 gap-3 rounded-lg bg-ink-50 p-3 text-center">
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-ink-400">Price</dt>
                  <dd className="mt-0.5 font-heading text-sm font-semibold text-ink-950">
                    {convertToThousand(pkg.price)}
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
                  {pkg.services.map((s) =>
              <Badge key={s.id} tone="neutral">
                      {s.name}
                    </Badge>
              )}
                  {pkg.menus.map((m) =>
              <Badge key={m.id} tone="brand">
                      {m.title}
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
          onSubmit={async (values, helpers) => {
            try {
              const input: PackageInput = {
                title: values.title,
                description: values.description,
                price: Number(values.price),
                durationHours: Number(values.durationHours),
                guests: Number(values.guests),
                perks: values.perks.filter(Boolean),
                isActive: values.isActive,
                serviceIds: values.serviceIds,
                menus: values.menus,
                packageImage: values.packageImage
              };
              const saved = values.id ?
              await updateAdminPackage(values.id, input) :
              await createAdminPackage(input);
              setPackages((prev) => {
                const exists = prev.some((p) => p.id === saved.id);
                return exists ? prev.map((p) => p.id === saved.id ? saved : p) : [saved, ...prev];
              });
              toast.success(`${saved.title} ${values.id ? 'updated' : 'created'}.`);
              setEditing(null);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save package.'));
            } finally {
              helpers.setSubmitting(false);
            }
          }}>

            {({ isSubmitting }) =>
          <Form>
                <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
                  <TextField name="title" label="Package name" placeholder="Date Night Signature" />
                  <TextAreaField
                name="description"
                label="Description"
                placeholder="What does this bundle include?" />

                  <FormGrid>
                    <NumberField name="price" label="Package price" prefix="₦" placeholder="62000" />
                    <NumberField name="durationHours" label="Duration (hours)" placeholder="4" />
                  </FormGrid>
                  <NumberField name="guests" label="Guests included" placeholder="2" />
                  <MultiSelectSearchField
                name="serviceIds"
                label="Services included"
                placeholder="Select services…"
                options={services.map((s) => ({ value: s.id, label: s.name }))} />

                  <MultiSelectSearchField
                name="menus"
                label="Menus included"
                placeholder="Select menus…"
                options={menus.map((m) => ({ value: m.id, label: m.title }))} />

                  <TagsField
                name="perks"
                label="Perks"
                placeholder="Wine pairing notes, Table styling"
                hint="Separate each perk with a comma." />

                  <ImageField
                name="packageImage"
                label="Package image"
                previewUrl={packages.find((p) => p.id === editing.id)?.packageImage} />

                  <SwitchField
                name="isActive"
                label="Package is live"
                hint="Inactive packages cannot be selected on new bookings." />

                </div>
                <ModalFooter>
                  <Button variant="secondary" type="button" disabled={isSubmitting} onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : editing.id ? 'Save changes' : 'Create package'}
                  </Button>
                </ModalFooter>
              </Form>
          }
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete package"
        message={`Delete "${deleting?.title}"? Bookings already using it keep their agreed price.`}
        onConfirm={() => deleting && handleDelete(deleting)}
        onClose={() => setDeleting(null)} />

    </div>);

}
