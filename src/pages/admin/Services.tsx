import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Plus, ShoppingBag, UploadCloud, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
// import { ConfirmDialog } from '../../components/ui/ConfirmDialog'; // delete option disabled
import { RowActions } from '../../components/ui/RowActions';
import {
  CheckboxField,
  FieldSectionTitle,
  FormGrid,
  MultiSelectField,
  SelectField,
  TextAreaField,
  TextField } from
'../../components/form/Fields';
import {
  createService,
  // deleteService, // delete option disabled — see handleDelete/ConfirmDialog below
  listServiceCategories,
  listServices,
  listWorkflows,
  updateService,
  type AdminService,
  type ChefLevelCode,
  type ServiceCategoryOption,
  type ServiceInput,
  type WorkflowOption } from
'../../services/admin/adminServices';
import { titleCase } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const CHEF_LEVEL_OPTIONS: {value: ChefLevelCode;label: string;}[] = [
{ value: 'junior', label: 'Junior' },
{ value: 'senior', label: 'Senior' },
{ value: 'sous', label: 'Sous' },
{ value: 'head', label: 'Head' },
{ value: 'pro', label: 'Pro' },
{ value: 'executive', label: 'Executive' }];


const schema = Yup.object({
  name: Yup.string().required('Service name is required'),
  categoryId: Yup.string().required('Select a category'),
  workflow: Yup.string().required('Select the booking workflow this service uses'),
  bookingType: Yup.string().oneOf(['instant', 'quotation']).required('Select a booking type'),
  description: Yup.string()
});

const emptyService: ServiceInput & {id?: string;} = {
  name: '',
  categoryId: '',
  description: '',
  icon: '',
  workflow: '',
  bookingType: '',
  allowedChefLevels: [],
  supportsChefMenu: false,
  supportsCustomerMenuUpload: false,
  supportsProcurement: true,
  isActive: true
};

export function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState<AdminService[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryOption[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editing, setEditing] = useState<(ServiceInput & {id?: string;}) | null>(null);
  // Delete option disabled — see RowActions/ConfirmDialog below.
  // const [deleting, setDeleting] = useState<AdminService | null>(null);

  const categoryNamesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const loadServices = () => {
    setLoading(true);
    listServices({ categoryId: categoryFilter }, categoryNamesById).
    then((res) => setServices(res.payload)).
    catch((err) => toast.error(errorMessage(err, 'Could not load services.'))).
    finally(() => setLoading(false));
  };

  useEffect(() => {
    listServiceCategories().
    then((res) => setCategories(res.payload)).
    catch(() => toast.error('Could not load service categories.'));
    listWorkflows().
    then((res) => setWorkflows(res.payload)).
    catch(() => toast.error('Could not load workflows.'));
  }, []);

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, categoryNamesById.size]);

  const upsert = (service: AdminService) => {
    setServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      return exists ? prev.map((s) => s.id === service.id ? service : s) : [service, ...prev];
    });
  };

  // const handleDelete = async (service: AdminService) => {
  //   try {
  //     await deleteService(service.id);
  //     setServices((prev) => prev.filter((s) => s.id !== service.id));
  //     toast.success(`${service.name} deleted.`);
  //   } catch (err) {
  //     toast.error(errorMessage(err, 'Could not delete service.'));
  //   }
  // };

  const rows = useMemo(
    () =>
    services.filter(
      (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    ),
    [services, search]
  );

  const columns: Column<AdminService>[] = [
  {
    key: 'service',
    header: 'Service',
    render: (s) =>
    <div>
          <p className="font-medium text-ink-950">{s.name}</p>
          <p className="max-w-sm truncate text-xs text-ink-500">{s.description || 'No description'}</p>
        </div>

  },
  {
    key: 'category',
    header: 'Category',
    render: (s) => <Badge tone="neutral">{s.categoryName}</Badge>
  },
  {
    key: 'workflow',
    header: 'Workflow',
    render: (s) => <span className="text-xs text-ink-600">{s.workflow || '—'}</span>
  },
  {
    key: 'bookingType',
    header: 'Booking type',
    render: (s) => s.bookingType ? <Badge tone="brand">{titleCase(s.bookingType)}</Badge> : '—'
  },
  {
    key: 'chefLevels',
    header: 'Chef levels',
    render: (s) =>
    s.allowedChefLevels.length ?
    <div className="flex flex-wrap gap-1">
            {s.allowedChefLevels.map((l) =>
      <Badge key={l} tone="neutral">{titleCase(l)}</Badge>
      )}
          </div> :

    <span className="text-xs text-ink-400">Any</span>

  },
  {
    key: 'capabilities',
    header: 'Capabilities',
    align: 'center',
    render: (s) =>
    <div className="flex items-center justify-center gap-2 text-ink-400">
          <UtensilsCrossed
        className={`h-4 w-4 ${s.supportsChefMenu ? 'text-buttons' : ''}`}
        aria-label="Supports chef menu" />

          <UploadCloud
        className={`h-4 w-4 ${s.supportsCustomerMenuUpload ? 'text-buttons' : ''}`}
        aria-label="Supports customer menu upload" />

          <ShoppingBag
        className={`h-4 w-4 ${s.supportsProcurement ? 'text-buttons' : ''}`}
        aria-label="Supports procurement" />

        </div>

  },
  {
    key: 'status',
    header: 'Status',
    render: (s) => <Badge tone={s.isActive ? 'success' : 'neutral'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '110px',
    render: (s) =>
    <RowActions
      onView={() => navigate(`/admin/services/${s.id}`)}
      onEdit={() => setEditing({ ...s })}
      // onDelete={() => setDeleting(s)}
    />

  }];


  return (
    <div>
      <PageHeader
        title="Services"
        description="Define what customers can book, which workflow drives it and who can deliver it."
        // action={
        // <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyService)}>
        //     New service
        //   </Button>
        // } 
        />


      <Card>
        <CardHeader
          title="Service catalogue"
          description={`${services.length} service${services.length === 1 ? '' : 's'} across ${categories.length} categories`} />

        <Toolbar search={search} onSearch={setSearch} placeholder="Search services…">
          <FilterSelect
            label="Category filter"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
            { value: 'all', label: 'All categories' },
            ...categories.map((c) => ({ value: c.id, label: c.name }))]
            } />

        </Toolbar>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(s) => s.id}
          onRowClick={(s) => navigate(`/admin/services/${s.id}`)}
          emptyTitle={loading ? 'Loading services…' : 'No services found'}
          emptyDescription={loading ? 'Fetching the service catalogue.' : 'Create a service so chefs and menus can be attached to it.'} />

      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit service' : 'New service'}
        description="Pricing rules and menus are attached to services once they're created."
        size="lg">

        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const res = values.id ?
              await updateService(values.id, values, categoryNamesById) :
              await createService(values);
              upsert(res.payload);
              setEditing(null);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save service.'));
            } finally {
              setSubmitting(false);
            }
          }}>

            {({ isSubmitting }) =>
          <Form>
                <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
                  <FormGrid>
                    <TextField name="name" label="Service name" placeholder="Signature Tasting Menu" />
                    <SelectField
                  name="categoryId"
                  label="Category"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))} />

                  </FormGrid>
                  <TextAreaField
                name="description"
                label="Description"
                placeholder="What does this service include?" />


                  <FormGrid>
                    {/* Workflow can't be changed once a service exists — changing it would
                        break bookings/pricing already tied to the original workflow. Only
                        editable when creating a new service. */}
                    {editing.id ?
                <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink-800">Booking workflow</label>
                        <p className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-600">
                          {workflows.find((w) => w.code === editing.workflow)?.displayName || editing.workflow || '—'}
                        </p>
                      </div> :

                <SelectField
                  name="workflow"
                  label="Booking workflow"
                  options={workflows.map((w) => ({ value: w.code, label: w.displayName }))} />

                }
                    <SelectField
                  name="bookingType"
                  label="Booking type"
                  options={[
                  { value: 'instant', label: 'Instant' },
                  { value: 'quotation', label: 'Quotation' }]
                  } />

                  </FormGrid>

                  <TextField
                name="icon"
                label="Icon"
                placeholder="🍽️ or icon name"
                hint="Shown next to the service in the customer app." />


                  <div className="border-t border-ink-200 pt-5">
                    <MultiSelectField
                  name="allowedChefLevels"
                  label="Eligible chef levels"
                  hint="Leave empty to allow any chef level."
                  options={CHEF_LEVEL_OPTIONS} />

                  </div>

                  <div className="border-t border-ink-200 pt-5 space-y-3">
                    <FieldSectionTitle>Capabilities</FieldSectionTitle>
                    <CheckboxField
                  name="supportsChefMenu"
                  label="Supports chef menu"
                  hint="Customers can pick from the chef's own menus." />

                    <CheckboxField
                  name="supportsCustomerMenuUpload"
                  label="Supports customer menu upload"
                  hint="Customers can upload their own menu for this service." />

                    <CheckboxField
                  name="supportsProcurement"
                  label="Supports procurement"
                  hint="The platform can source groceries on the customer's behalf." />

                    <CheckboxField
                  name="isActive"
                  label="Active"
                  hint="Inactive services are hidden from customers but keep their history." />

                  </div>
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
                    {isSubmitting ? 'Saving…' : editing.id ? 'Save changes' : 'Create service'}
                  </Button>
                </ModalFooter>
              </Form>
          }
          </Formik> :
        null}
      </Modal>

      {/* <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete service"
        message={`Delete "${deleting?.name}"? Menus and pricing rules linked to it will lose their reference.`}
        onConfirm={() => deleting && handleDelete(deleting)}
        onClose={() => setDeleting(null)} /> */}

    </div>);

}
