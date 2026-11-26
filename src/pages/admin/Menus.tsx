import React, { useEffect, useState } from 'react';
import { FieldArray, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { FolderPlus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { RowActions } from '../../components/ui/RowActions';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import {
  CheckboxField,
  FieldSectionTitle,
  FormGrid,
  ImageField,
  MultiSelectSearchField,
  NumberField,
  SearchSelectField,
  SelectField,
  TextAreaField,
  TextField } from
'../../components/form/Fields';
import {
  addMenuGrocery,
  attachMenuToPackage,
  createMenuCore,
  createMenuTypeOption,
  updateMenuCore,
  getAdminMenu,
  listAdminMenus,
  listMenuTypeOptions,
  listPackageOptions,
  MENU_ATTRIBUTE_SUGGESTIONS,
  MENU_KIND_OPTIONS,
  type AdminMenu,
  type MenuKind,
  type MenuCreatorType,
  type MenuTimeSlot,
  type MenuTypeOption,
  type PackageOption } from
'../../services/admin/menuServices';
import { ServiceCheckboxes } from '../../components/form/ServiceCheckboxes';
import { MenuAttributesField } from '../../components/admin/menus/MenuAttributesField';
import { listChefs, listServices, type AdminService } from '../../services/admin/adminServices';
import type { Chef } from '../../types';
import { convertToThousand, formatDate, titleCase } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

interface GroceryRow {
  groceryName: string;
  description: string;
  unitPrice: number | '';
}

interface MenuFormValues {
  menuCreatorType: MenuCreatorType;
  title: string;
  description: string;
  serviceIds: string[];
  menuType: MenuTimeSlot | '';
  menuClass: string;
  pricingModel: string;
  menuKind: MenuKind | '';
  attributes: string[];
  menuCategory: string[];
  pricePerHead: number | '';
  chefId: string;
  isSignatureMenu: boolean;
  packages: string[];
  samplePicture: File | null;
  groceries: GroceryRow[];
}

const emptyMenuForm: MenuFormValues = {
  menuCreatorType: 'organization',
  title: '',
  description: '',
  serviceIds: [],
  menuType: '',
  menuClass: '',
  pricingModel: '',
  menuKind: '',
  attributes: [],
  menuCategory: [],
  pricePerHead: '',
  chefId: '',
  isSignatureMenu: false,
  packages: [],
  samplePicture: null,
  groceries: []
};

const schema = Yup.object({
  menuCreatorType: Yup.string().oneOf(['chef', 'organization']).required(),
  title: Yup.string().required('Menu title is required'),
  description: Yup.string().required('Description is required'),
  serviceIds: Yup.array().of(Yup.string()).min(1, 'Select at least one service'),
  menuType: Yup.string().oneOf(['breakfast', 'lunch', 'dinner']).required('Select a menu type'),
  pricePerHead: Yup.number().
  typeError('Enter a number').
  min(0, 'Must be zero or more').
  when('pricingModel', {
    is: 'plater',
    then: (s) => s.required('Price per platter is required'),
    otherwise: (s) => s.required('Price per head is required')
  }),
  menuKind: Yup.string().oneOf(['', 'classic', 'premium', 'signature']),
  attributes: Yup.array().of(Yup.string().max(40)).max(10, 'Up to 10 attributes'),
  chefId: Yup.string().when('menuCreatorType', {
    is: 'chef',
    then: (s) => s.required('Select the chef this menu belongs to'),
    otherwise: (s) => s.notRequired()
  }),
  groceries: Yup.array().of(
    Yup.object({
      groceryName: Yup.string().required('Item name is required'),
      unitPrice: Yup.number().typeError('Enter a number').required('Unit price is required').min(0)
    })
  )
});

const categorySchema = Yup.object({
  title: Yup.string().trim().required('Category name is required').max(80, 'Keep it under 80 characters'),
  description: Yup.string().trim().required('Add a short description').max(300, 'Keep it under 300 characters'),
  packageId: Yup.string().required('Select the package this category belongs to')
});

/** Pre-fills the menu form from a saved menu. The picture stays unless a new one is chosen. */
const toMenuFormValues = (m: AdminMenu): MenuFormValues => ({
  menuCreatorType: m.menuCreatorType,
  title: m.title,
  description: m.description,
  serviceIds: [...m.serviceIds],
  menuType: m.menuType ?? '',
  menuClass: m.menuClass ?? '',
  pricingModel: m.pricingModel ?? '',
  menuKind: m.menuKind ?? '',
  attributes: [...m.attributes],
  menuCategory: m.menuCategory.map((c) => c.id),
  pricePerHead: m.pricePerHead,
  chefId: m.chef?.id ?? '',
  isSignatureMenu: m.isSignatureMenu,
  packages: m.packages.map((p) => p.id),
  samplePicture: null,
  groceries: m.groceries.map((g) => ({
    groceryName: g.groceryName,
    description: g.description ?? '',
    unitPrice: g.unitPrice
  }))
});

export function Menus() {
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [menuTypeFilter, setMenuTypeFilter] = useState('all');
  const [kindFilter, setKindFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  const [services, setServices] = useState<AdminService[]>([]);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [menuTypeOptions, setMenuTypeOptions] = useState<MenuTypeOption[]>([]);
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<AdminMenu | null>(null);
  const formOpen = addOpen || Boolean(editingMenu);
  const closeForm = () => {
    setAddOpen(false);
    setEditingMenu(null);
  };

  const serviceNameById = (id?: string) => services.find((s) => s.id === id)?.name || '—';

  useEffect(() => {
    listServices().then((res) => setServices(res.payload)).catch(() => toast.error('Could not load services.'));
    listChefs({ status: 'approved', limit: 200 }).
    then((res) => setChefs(res.payload)).
    catch(() => toast.error('Could not load chefs.'));
    listMenuTypeOptions().then(setMenuTypeOptions).catch(() => toast.error('Could not load menu categories.'));
    listPackageOptions().then(setPackageOptions).catch(() => toast.error('Could not load packages.'));
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      listAdminMenus({
        search,
        menuCreatorType: creatorFilter as MenuCreatorType | 'all',
        menuType: menuTypeFilter as MenuTimeSlot | 'all',
        menuKind: kindFilter as MenuKind | 'all',
        serviceId: serviceFilter === 'all' ? undefined : serviceFilter,
        limit: 100
      }).
      then((res) => setMenus(res.data)).
      catch((err) => toast.error(errorMessage(err, 'Could not load menus.'))).
      finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, creatorFilter, menuTypeFilter, kindFilter, serviceFilter]);

  const columns: Column<AdminMenu>[] = [
  {
    key: 'menu',
    header: 'Menu',
    render: (m) =>
    <div className="flex items-center gap-3">
          {m.samplePicture &&
      <img src={m.samplePicture} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
      }
          <div>
            <p className="font-medium text-ink-950">{m.title}</p>
            <p className="max-w-sm truncate text-xs text-ink-500">{m.description}</p>
            {m.attributes.length ? <p className="mt-0.5 text-xs text-ink-600">{m.attributes.join(' · ')}</p> : null}
          </div>
        </div>

  },
  {
    key: 'creator',
    header: 'Creator',
    render: (m) =>
    <div>
          <Badge tone={m.menuCreatorType === 'chef' ? 'brand' : 'neutral'}>{titleCase(m.menuCreatorType)}</Badge>
          {m.chef && <p className="mt-1 text-xs text-ink-500">{m.chef.fullName}</p>}
        </div>

  },
  {
    key: 'service',
    header: 'Services',
    render: (m) => {
      const names = m.serviceIds.map(serviceNameById);
      if (names.length === 0) return <span className="text-xs text-ink-400">—</span>;
      const shown = names.slice(0, 2);
      return (
        <div className="flex max-w-[14rem] flex-wrap gap-1" title={names.join(', ')}>
            {shown.map((n, i) => <Badge key={i} tone="info">{n}</Badge>)}
            {names.length > shown.length ? <Badge tone="neutral">+{names.length - shown.length} more</Badge> : null}
          </div>);

    }
  },
  {
    key: 'kind',
    header: 'Kind',
    render: (m) =>
    m.menuKind ?
    <Badge tone={m.menuKind === 'signature' ? 'brand' : m.menuKind === 'premium' ? 'info' : 'neutral'}>
            {titleCase(m.menuKind)}
          </Badge> :
    <span className="text-xs text-ink-400">—</span>
  },
  {
    key: 'type',
    header: 'Menu type',
    render: (m) =>
    <div className="space-y-1">
          <Badge tone="neutral">{titleCase(m.menuType)}</Badge>
          {m.menuClass && <p className="text-xs text-ink-500">{titleCase(m.menuClass)}</p>}
        </div>

  },
  {
    key: 'perHead',
    header: 'Price',
    align: 'right',
    render: (m) =>
    <span className="font-medium">
          {convertToThousand(m.pricePerHead)}
          <span className="ml-1 text-xs font-normal text-ink-500">{m.pricingModel === 'plater' ? '/ platter' : '/ head'}</span>
        </span>
  },
  {
    key: 'grocery',
    header: 'Grocery cost',
    align: 'right',
    render: (m) => convertToThousand(m.totalGroceryCost)
  },
  {
    key: 'signature',
    header: 'Signature',
    align: 'center',
    render: (m) => m.isSignatureMenu ? <Badge tone="success">Yes</Badge> : <span className="text-xs text-ink-400">—</span>
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '70px',
    render: (m) => <RowActions onEdit={() => setEditingMenu(m)} />
  },
  {
    key: 'created',
    header: 'Created',
    render: (m) => formatDate(m.createdAt)
  }];


  return (
    <div>
      <PageHeader
        title="Menus & Groceries"
        description="Build menus, itemise the grocery costing behind each one, and attach them to services and packages."
        action={
        <>
            <Button variant="secondary" icon={<FolderPlus className="h-4 w-4" />} onClick={() => setCategoryOpen(true)}>
              Create menu category
            </Button>
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
              New menu
            </Button>
          </>
        } />


      <Card>
        <CardHeader
          title="Menu library"
          description={`${menus.length} menu${menus.length === 1 ? '' : 's'} on record`} />

        <Toolbar search={search} onSearch={setSearch} placeholder="Search menus…">
          <FilterSelect
            label="Creator filter"
            value={creatorFilter}
            onChange={setCreatorFilter}
            options={[
            { value: 'all', label: 'All creators' },
            { value: 'organization', label: 'Organization' },
            { value: 'chef', label: 'Chef' }]
            } />

          <FilterSelect
            label="Menu type filter"
            value={menuTypeFilter}
            onChange={setMenuTypeFilter}
            options={[
            { value: 'all', label: 'All menu types' },
            { value: 'breakfast', label: 'Breakfast' },
            { value: 'lunch', label: 'Lunch' },
            { value: 'dinner', label: 'Dinner' }]
            } />

          <FilterSelect
            label="Menu kind filter"
            value={kindFilter}
            onChange={setKindFilter}
            options={[{ value: 'all', label: 'All kinds' }, ...MENU_KIND_OPTIONS]} />

          <FilterSelect
            label="Service filter"
            value={serviceFilter}
            onChange={setServiceFilter}
            options={[{ value: 'all', label: 'All services' }, ...services.map((sv) => ({ value: sv.id, label: sv.name }))]} />

        </Toolbar>
        <DataTable
          columns={columns}
          rows={menus}
          rowKey={(m) => m.id}
          onRowClick={(m) => setEditingMenu(m)}
          emptyTitle={loading ? 'Loading menus…' : 'No menus found'}
          emptyDescription={loading ? 'Fetching the menu library.' : 'Create a menu and attach its grocery list to track food cost.'} />

      </Card>

      <Modal
        open={formOpen}
        onClose={closeForm}
        closeOnOverlayClick={false}
        title={editingMenu ? `Edit ${editingMenu.title}` : 'New menu'}
        description="Courses are shown to customers; grocery costing stays internal."
        size="xl">

        <Formik
          key={editingMenu?.id ?? 'new'}
          initialValues={editingMenu ? toMenuFormValues(editingMenu) : emptyMenuForm}
          validationSchema={schema}
          onSubmit={async (values, helpers) => {
            if (editingMenu) {
              try {
                const updated = await updateMenuCore(editingMenu.id, {
                  menuCreatorType: values.menuCreatorType,
                  title: values.title,
                  description: values.description,
                  serviceIds: values.serviceIds,
                  menuType: values.menuType as MenuTimeSlot,
                  menuClass: values.menuClass,
                  pricingModel: values.pricingModel,
                  menuKind: values.menuKind,
                  attributes: values.attributes,
                  menuCategory: values.menuCategory,
                  pricePerHead: Number(values.pricePerHead),
                  chefId: values.menuCreatorType === 'chef' ? values.chefId : undefined,
                  isSignatureMenu: values.menuCreatorType === 'chef' ? values.isSignatureMenu : false,
                  samplePicture: values.samplePicture,
                  packages: values.packages,
                  groceries: values.groceries.
                  filter((g) => g.groceryName.trim() && g.unitPrice !== '').
                  map((g) => ({
                    groceryName: g.groceryName.trim(),
                    description: g.description.trim() || undefined,
                    unitPrice: Number(g.unitPrice)
                  }))
                });
                setMenus((prev) => prev.map((m) => m.id === updated.id ? updated : m));
                toast.success(`${updated.title} updated.`);
                closeForm();
              } catch (err) {
                toast.error(errorMessage(err, 'Could not save the menu.'));
              } finally {
                helpers.setSubmitting(false);
              }
              return;
            }
            try {
              const created = await createMenuCore({
                menuCreatorType: values.menuCreatorType,
                title: values.title,
                description: values.description,
                serviceIds: values.serviceIds,
                menuType: values.menuType as MenuTimeSlot,
                menuClass: values.menuClass || undefined,
                pricingModel: values.pricingModel || undefined,
                menuKind: values.menuKind,
                attributes: values.attributes,
                menuCategory: values.menuCategory,
                pricePerHead: Number(values.pricePerHead),
                chefId: values.menuCreatorType === 'chef' ? values.chefId : undefined,
                isSignatureMenu: values.menuCreatorType === 'chef' ? values.isSignatureMenu : false,
                samplePicture: values.samplePicture
              });

              for (const grocery of values.groceries) {
                if (!grocery.groceryName.trim() || grocery.unitPrice === '') continue;
                await addMenuGrocery(created.id, {
                  groceryName: grocery.groceryName.trim(),
                  description: grocery.description.trim() || undefined,
                  unitPrice: Number(grocery.unitPrice)
                });
              }

              for (const packageId of values.packages) {
                await attachMenuToPackage(created.id, packageId);
              }

              const finalMenu = await getAdminMenu(created.id);
              setMenus((prev) => [finalMenu, ...prev]);
              toast.success(`${finalMenu.title} created.`);
              closeForm();
              helpers.resetForm();
            } catch (err) {
              toast.error(errorMessage(err, 'Could not create menu.'));
            } finally {
              helpers.setSubmitting(false);
            }
          }}>

          {({ values, errors, touched, submitCount, setFieldValue, setFieldTouched, isSubmitting }) =>
          <Form>
              <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
                <FormGrid>
                  <SelectField
                  name="menuCreatorType"
                  label="Menu creator"
                  options={[
                  { value: 'organization', label: 'Organization' },
                  { value: 'chef', label: 'Chef' }]
                  } />

                </FormGrid>

                <ServiceCheckboxes
                label="Services this menu belongs to"
                services={[...services].sort((a, b) => a.name.localeCompare(b.name)).map((sv) => ({ id: sv.id, name: sv.name }))}
                selected={values.serviceIds}
                onChange={(ids) => {
                  setFieldValue('serviceIds', ids);
                  setFieldTouched('serviceIds', true, false);
                }}
                error={(touched.serviceIds || submitCount > 0) && typeof errors.serviceIds === 'string' ? errors.serviceIds : undefined} />

                {values.menuCreatorType === 'chef' &&
              <FormGrid>
                    <SearchSelectField
                  id="menu-chef"
                  name="chefId"
                  label="Chef"
                  placeholder="Search chefs…"
                  data={chefs.map((c) => ({ id: c.id, label: c.name }))} />

                    <CheckboxField
                  name="isSignatureMenu"
                  label="Signature menu"
                  hint="Highlighted as one of this chef's signature dishes." />

                  </FormGrid>
              }

                <TextField name="title" label="Menu title" placeholder="Sunday Special" />
                <TextAreaField
                name="description"
                label="Description"
                placeholder="Smoky party jollof rice with grilled chicken." />


                <FormGrid>
                  <SelectField
                  name="menuType"
                  label="Menu type"
                  options={[
                  { value: 'breakfast', label: 'Breakfast' },
                  { value: 'lunch', label: 'Lunch' },
                  { value: 'dinner', label: 'Dinner' }]
                  } />

                  <SelectField
                  name="menuClass"
                  label="Menu class"
                  options={[
                  { value: 'nigerian', label: 'Nigerian' },
                  { value: 'continental', label: 'Continental' },
                  { value: 'intercontinental', label: 'Intercontinental' }]
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

                  <NumberField
                  name="pricePerHead"
                  label={values.pricingModel === 'plater' ? 'Price per platter' : 'Price per head'}
                  prefix="₦"
                  placeholder={values.pricingModel === 'plater' ? '25000' : '6500'} />
                </FormGrid>

                <SelectField
                name="menuKind"
                label="Menu kind (optional)"
                options={MENU_KIND_OPTIONS} />

                <MenuAttributesField
                name="attributes"
                label="Attributes (optional)"
                hint="Courses or features in the order customers see them, e.g. Starter · Main · Dessert."
                suggestions={MENU_ATTRIBUTE_SUGGESTIONS} />

                <MultiSelectSearchField
                name="menuCategory"
                label="Menu category"
                placeholder="Attach to menu categories…"
                options={menuTypeOptions.map((o) => ({ value: o.id, label: o.title }))} />


                <MultiSelectSearchField
                name="packages"
                label="Packages"
                placeholder="Attach to packages…"
                options={packageOptions.map((o) => ({ value: o.id, label: o.title }))} />


                <ImageField
                name="samplePicture"
                label="Sample picture"
                hint={editingMenu ? 'The current picture is kept unless you choose a new one.' : 'Shown to customers browsing this menu.'}
                previewUrl={editingMenu?.samplePicture || undefined} />

                <div className="border-t border-ink-200 pt-5">
                  <FieldSectionTitle>Grocery costing</FieldSectionTitle>
                  <FieldArray name="groceries">
                    {({ push, remove }) =>
                  <div className="mt-3 space-y-3">
                        {values.groceries.length === 0 &&
                    <p className="rounded-lg border border-dashed border-ink-300 px-4 py-6 text-center text-sm text-ink-500">
                            No grocery items costed yet.
                          </p>
                    }
                        {values.groceries.map((_, i) =>
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-ink-200 bg-ink-50/50 p-4">

                            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                              <TextField
                          name={`groceries.${i}.groceryName`}
                          label="Item"
                          placeholder="Duck breast" />

                              <TextField
                          name={`groceries.${i}.description`}
                          label="Description"
                          placeholder="Optional detail" />

                              <NumberField
                          name={`groceries.${i}.unitPrice`}
                          label="Unit price"
                          prefix="₦"
                          placeholder="14500" />

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
                      onClick={() => push({ groceryName: '', description: '', unitPrice: '' })}>

                          Add grocery item
                        </Button>
                      </div>
                  }
                  </FieldArray>
                </div>
              </div>
              <ModalFooter>
                <Button variant="secondary" type="button" disabled={isSubmitting} onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ?
                editingMenu ? 'Saving…' : 'Creating…' :
                editingMenu ? 'Save changes' : 'Create menu'}
                </Button>
              </ModalFooter>
            </Form>
          }
        </Formik>
      </Modal>

      <Modal
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        closeOnOverlayClick={false}
        title="Create menu category"
        description="Categories group menus within a package. New categories can be picked straight away when creating a menu."
        size="md">

        <Formik
          initialValues={{ title: '', description: '', packageId: '' }}
          validationSchema={categorySchema}
          onSubmit={async (values, helpers) => {
            try {
              const created = await createMenuTypeOption({
                title: values.title.trim(),
                description: values.description.trim(),
                packageId: values.packageId
              });
              setMenuTypeOptions((prev) => [created, ...prev.filter((o) => o.id !== created.id)]);
              toast.success(`${created.title} category created.`);
              setCategoryOpen(false);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not create the menu category.'));
            } finally {
              helpers.setSubmitting(false);
            }
          }}>

          {({ isSubmitting }) =>
          <Form>
              <div className="space-y-4 px-6 py-5">
                <TextField name="title" label="Category name" placeholder="e.g. Date Night Classics" />
                <TextAreaField name="description" label="Description" rows={3} placeholder="What menus in this category have in common" />
                <SelectField
                name="packageId"
                label="Package"
                options={packageOptions.map((o) => ({ value: o.id, label: o.title }))} />

                {packageOptions.length === 0 ?
              <p className="text-xs text-amber-700">No packages found. Create a package first — every category belongs to one.</p> :
              null}
              </div>
              <ModalFooter>
                <Button variant="secondary" type="button" disabled={isSubmitting} onClick={() => setCategoryOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating…' : 'Create category'}
                </Button>
              </ModalFooter>
            </Form>
          }
        </Formik>
      </Modal>
    </div>);

}
