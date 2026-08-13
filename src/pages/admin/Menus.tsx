import React, { useEffect, useState } from 'react';
import { FieldArray, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
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
  getAdminMenu,
  listAdminMenus,
  listMenuTypeOptions,
  listPackageOptions,
  type AdminMenu,
  type MenuCreatorType,
  type MenuTimeSlot,
  type MenuTypeOption,
  type PackageOption } from
'../../services/admin/menuServices';
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
  relatedServiceId: string;
  menuType: MenuTimeSlot | '';
  menuClass: string;
  pricingModel: string;
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
  relatedServiceId: '',
  menuType: '',
  menuClass: '',
  pricingModel: '',
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
  relatedServiceId: Yup.string().required('Select the service this menu belongs to'),
  menuType: Yup.string().oneOf(['breakfast', 'lunch', 'dinner']).required('Select a menu type'),
  pricePerHead: Yup.number().typeError('Enter a number').required('Price per head is required').min(0),
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

export function Menus() {
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [menuTypeFilter, setMenuTypeFilter] = useState('all');

  const [services, setServices] = useState<AdminService[]>([]);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [menuTypeOptions, setMenuTypeOptions] = useState<MenuTypeOption[]>([]);
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([]);

  const [addOpen, setAddOpen] = useState(false);

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
        limit: 100
      }).
      then((res) => setMenus(res.data)).
      catch((err) => toast.error(errorMessage(err, 'Could not load menus.'))).
      finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, creatorFilter, menuTypeFilter]);

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
  { key: 'service', header: 'Service', render: (m) => serviceNameById(m.relatedServiceId) },
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
    header: 'Price / head',
    align: 'right',
    render: (m) => <span className="font-medium">{convertToThousand(m.pricePerHead)}</span>
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
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
            New menu
          </Button>
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

        </Toolbar>
        <DataTable
          columns={columns}
          rows={menus}
          rowKey={(m) => m.id}
          emptyTitle={loading ? 'Loading menus…' : 'No menus found'}
          emptyDescription={loading ? 'Fetching the menu library.' : 'Create a menu and attach its grocery list to track food cost.'} />

      </Card>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="New menu"
        description="Courses are shown to customers; grocery costing stays internal."
        size="xl">

        <Formik
          initialValues={emptyMenuForm}
          validationSchema={schema}
          onSubmit={async (values, helpers) => {
            try {
              const created = await createMenuCore({
                menuCreatorType: values.menuCreatorType,
                title: values.title,
                description: values.description,
                relatedServiceId: values.relatedServiceId,
                menuType: values.menuType as MenuTimeSlot,
                menuClass: values.menuClass || undefined,
                pricingModel: values.pricingModel || undefined,
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
              setAddOpen(false);
              helpers.resetForm();
            } catch (err) {
              toast.error(errorMessage(err, 'Could not create menu.'));
            } finally {
              helpers.setSubmitting(false);
            }
          }}>

          {({ values, isSubmitting }) =>
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

                  <SelectField
                  name="relatedServiceId"
                  label="Service"
                  options={services.map((s) => ({ value: s.id, label: s.name }))} />

                </FormGrid>

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


                <ImageField name="samplePicture" label="Sample picture" hint="Shown to customers browsing this menu." />

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
                <Button variant="secondary" type="button" disabled={isSubmitting} onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating…' : 'Create menu'}
                </Button>
              </ModalFooter>
            </Form>
          }
        </Formik>
      </Modal>
    </div>);

}
