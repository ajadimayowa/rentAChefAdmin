import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Check, Plus, ShieldBan, ShieldCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge, statusTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RowActions } from '../../components/ui/RowActions';
import {
  FormGrid,
  ImageField,
  MultiSelectSearchField,
  NumberField,
  SearchSelectField,
  SelectField,
  TagsField,
  TextAreaField,
  TextField,
  type MultiSelectOption,
  type SearchSelectOption
} from
  '../../components/form/Fields';
import { formatDate, titleCase } from '../../utils/format';
import type { ApprovalStatus, Chef } from '../../types';
import { ApiError } from '../../config/api';
import {
  createChef,
  deleteChef,
  listChefs,
  updateChef,
  updateChefStatus,
  type ChefInput
} from
  '../../services/admin/adminServices';
import { getChefLevels } from '../../services/chef/chefServices';
import { getServicesOffered } from '../../services/servicesOfferedApis';
import { getStateLgas, getStates } from '../../services/utility';

const schema = Yup.object({
  name: Yup.string().required('Chef name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  state: Yup.object({
    stateId: Yup.string().required('Select a state'),
    stateName: Yup.string()
  }),
  city: Yup.string().required('Select a city'),
  chefLevel: Yup.object().test('required', 'Select a chef level', (value: any) => Boolean(value?.id)),
  yearsOfExperience: Yup.number().
    typeError('Enter a number').
    required('Experience is required').
    min(0, 'Cannot be negative').
    max(60, 'That seems too high'),
  bio: Yup.string().required('Add a short bio'),
  specialties: Yup.array().of(Yup.string()).min(1, 'Add at least one specialty'),
  servicesOffered: Yup.array().of(Yup.string()).min(1, 'Select at least one service'),
  avatarFile: Yup.mixed<File>().test(
    'required-photo',
    'Add a chef photo',
    function (value) {
      // Editing an existing chef never requires a new upload — the backend keeps
      // the current photo when none is attached. Only creating a new chef does.
      if (this.parent.id) return true;
      return Boolean(value || this.parent.avatar);
    }
  )
});

type ChefFormValues = Chef & { avatarFile: File | null; };

const emptyChef: ChefFormValues = {
  id: '',
  name: '',
  email: '',
  phone: '',
  state: {
    stateId:'',
    stateName:'',
  },
  city: '',
  chefLevel: null,
  specialties: [],
  servicesOffered: [],
  yearsOfExperience: 0,
  rating: 0,
  jobsCompleted: 0,
  status: 'pending',
  avatar: '',
  avatarFile: null,
  bio: '',
  joinedAt: new Date().toISOString().slice(0, 10)
};

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof ApiError ? err.message : fallback;

function toChefInput(values: ChefFormValues): ChefInput {
  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    state: values.state,
    city: values.city,
    chefLevel: values.chefLevel,
    specialties: values.specialties,
    servicesOffered: values.servicesOffered,
    yearsOfExperience: values.yearsOfExperience,
    bio: values.bio,
    status: values.status,
    avatar: values.avatarFile
  };
}

export function Chefs() {
  const navigate = useNavigate();
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [chefLevelFilter, setChefLevelFilter] = useState('all');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<ChefFormValues | null>(null);
  const [deleting, setDeleting] = useState<Chef | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [states, setStates] = useState<SearchSelectOption[]>([]);
  const [lgas, setLgas] = useState<SearchSelectOption[]>([]);
  const [lgasLoading, setLgasLoading] = useState(false);
  const [chefLevels, setChefLevels] = useState<SearchSelectOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<MultiSelectOption[]>([]);

  useEffect(() => {
    listChefs().
      then((res) => setChefs(res.payload)).
      catch((err) => toast.error(errorMessage(err, 'Could not load chefs.'))).
      finally(() => setLoading(false));
  }, []);

  const upsertChef = (chef: Chef) => {
    setChefs((prev) => {
      const exists = prev.some((c) => c.id === chef.id);
      return exists ? prev.map((c) => c.id === chef.id ? chef : c) : [chef, ...prev];
    });
  };

  useEffect(() => {
    getStates().
      // `s.id` comes back as a number; chef.address.stateId is stored as a string
      // (Mongoose casts it on save), so ids must be normalized to match on edit.
      then((res) => setStates(res.payload.map((s:any) => ({ id: String(s.id), label: s.state })))).
      catch(() => toast.error('Could not load states.'));
  }, []);

  useEffect(() => {
    getChefLevels().
      then((res) => setChefLevels(res.payload.map((l) => ({ id: l.id, label: l.name })))).
      catch(() => toast.error('Could not load chef levels.'));
  }, []);

  useEffect(() => {
    getServicesOffered().
      then((res) => setServiceOptions(res.payload.map((s) => ({ value: s.id, label: s.name })))).
      catch(() => toast.error('Could not load services.'));
  }, []);

  const loadLgas = async (stateId: string) => {
    if (!stateId) {
      setLgas([]);
      return;
    }
    setLgasLoading(true);
    try {
      const res = await getStateLgas(stateId);
      setLgas(res.payload.map((l:any) => ({ id: l, label: l })));
    } catch (err) {
      toast.error(errorMessage(err, 'Could not load cities.'));
      setLgas([]);
    } finally {
      setLgasLoading(false);
    }
  };

  useEffect(() => {
    if (editing?.state) {
      loadLgas(editing.state?.stateId);
    } else {
      setLgas([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id]);

  const handleStatusChange = async (chef: Chef, next: ApprovalStatus) => {
    setStatusUpdating(chef.id);
    try {
      const res = await updateChefStatus(chef.id, next);
      upsertChef(res.payload);
      if (next === 'approved') {
        toast.success(`${chef.name} approved. A verification email was sent to ${chef.email}.`);
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update chef status.'));
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDelete = async (chef: Chef) => {
    try {
      await deleteChef(chef.id);
      setChefs((prev) => prev.filter((c) => c.id !== chef.id));
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove chef.'));
    }
  };

  const rows = useMemo(
    () =>
      chefs.filter(
        (c) =>
          (chefLevelFilter === 'all' || c.chefLevel?.id === chefLevelFilter) && (
            status === 'all' || c.status === status) && (
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.specialties.join(' ').toLowerCase().includes(search.toLowerCase()) ||
            c.city.toLowerCase().includes(search.toLowerCase()))
      ),
    [chefs, search, chefLevelFilter, status]
  );

  const columns: Column<Chef>[] = [
    {
      key: 'chef',
      header: 'Chef',
      render: (c) =>
        <div className="flex items-center gap-3">
          <img src={c.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
          <div>
            <p className="font-medium text-ink-950">{c.name}</p>
            <p className="text-xs text-ink-500">{c.specialties.join(' · ')}</p>
          </div>
        </div>

    },
    {
      key: 'chefLevel',
      header: 'Chef level',
      render: (c) => <Badge tone="brand">{c.chefLevel?.name || '—'}</Badge>
    },
    {
      key: 'city',
      header: 'Location',
      render: (c) =>
        <div>
          <p>{c.city}</p>
          <p className="text-xs text-ink-500">Joined {formatDate(c.joinedAt)}</p>
        </div>

    },
    {
      key: 'experience',
      header: 'Experience',
      align: 'center',
      render: (c) => `${c.yearsOfExperience} yrs`
    },
    {
      key: 'rating',
      header: 'Rating',
      align: 'right',
      render: (c) =>
        <span className="inline-flex items-center gap-1 font-medium">
          <Star className="h-3.5 w-3.5 fill-buttons text-buttons" />
          {c.rating || '—'}
          <span className="text-xs font-normal text-ink-400">({c.jobsCompleted})</span>
        </span>

    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <Badge tone={statusTone(c.status)}>{titleCase(c.status)}</Badge>
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '190px',
      render: (c) =>
        <RowActions
          onView={() => navigate(`/admin/chefs/${c.id}`)}
          onEdit={() => setEditing({ ...c, avatarFile: null })}
          onDelete={() => setDeleting(c)}
          extra={
            c.status === 'pending' ?
              <Button
                size="sm"
                icon={<Check className="h-3.5 w-3.5" />}
                disabled={statusUpdating === c.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(c, 'approved');
                }}>

                Approve
              </Button> :
              c.status === 'approved' ?
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<ShieldBan className="h-3.5 w-3.5" />}
                  disabled={statusUpdating === c.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(c, 'suspended');
                  }}>

                  Suspend
                </Button> :

                <Button
                  size="sm"
                  variant="ghost"
                  icon={<ShieldCheck className="h-3.5 w-3.5" />}
                  disabled={statusUpdating === c.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(c, 'approved');
                  }}>

                  Reinstate
                </Button>

          } />


    }];


  return (
    <div>
      <PageHeader
        title="Chefs"
        description="Onboard chefs, set their chef level and control who can accept bookings."
        action={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyChef)}>
            Add chef
          </Button>
        } />


      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {chefLevels.map((level) =>
          <Card key={level.id} className="p-5">
            <Badge tone="brand">{level.label}</Badge>
            <p className="mt-3 font-heading text-2xl font-semibold text-ink-950">
              {chefs.filter((c) => c.chefLevel?.id === level.id).length}
            </p>
            <p className="mt-1 text-xs text-ink-400">
              {chefs.filter((c) => c.chefLevel?.id === level.id && c.status === 'approved').length} approved
            </p>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader title="Chef roster" description={`${chefs.length} chefs on the platform`} />
        <Toolbar search={search} onSearch={setSearch} placeholder="Search chefs, specialty or city…">
          <FilterSelect
            label="Chef level filter"
            value={chefLevelFilter}
            onChange={setChefLevelFilter}
            options={[
              { value: 'all', label: 'All chef levels' },
              ...chefLevels.map((l) => ({ value: l.id, label: l.label }))]
            } />

          <FilterSelect
            label="Status filter"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'suspended', label: 'Suspended' }]
            } />

        </Toolbar>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          onRowClick={(c) => navigate(`/admin/chefs/${c.id}`)}
          emptyTitle={loading ? 'Loading chefs…' : 'No chefs found'}
          emptyDescription={loading ? 'Fetching the chef roster.' : 'Adjust the filters or onboard a new chef to the roster.'} />

      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        closeOnOverlayClick={false}
        title={editing?.id ? 'Edit chef' : 'Add chef'}
        description="Chef level determines the rate card applied to this chef's bookings.">

        {editing ?
          <Formik
            initialValues={editing}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const input = toChefInput(values);
                const res = values.id ?
                  await updateChef(values.id, input) :
                  await createChef(input);
                upsertChef(res.payload);
                setEditing(null);
              } catch (err) {
                toast.error(errorMessage(err, 'Could not save chef.'));
              } finally {
                setSubmitting(false);
              }
            }}>

            {({ isSubmitting, values, setFieldValue }) =>
              <Form>
                <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
                  <ImageField
                    name="avatarFile"
                    label="Chef photo"
                    hint="JPG or PNG, square works best."
                    previewUrl={editing.avatar || undefined} />

                  <FormGrid>
                    <TextField name="name" label="Full name" placeholder="Antoine Dubois" />
                    <TextField name="email" label="Email" type="email" placeholder="chef@email.com" />
                  </FormGrid>
                  <FormGrid>
                    <TextField name="phone" label="Phone" placeholder="+1 415 000 0000" />
                    <SearchSelectField
                      id="state"
                      name="state.stateId"
                      label="State"
                      data={states}
                      placeholder="Select a state"
                      onSelect={(option) => {
                        setFieldValue('state.stateName', option?.label ?? '');
                        setFieldValue('city', '');
                        loadLgas(option?.id ?? '');
                      }} />

                  </FormGrid>
                  <FormGrid>
                    <SearchSelectField
                      id="city"
                      name="city"
                      label="City"
                      data={lgas}
                      disabled={!values.state || lgasLoading}
                      placeholder={
                        lgasLoading ? 'Loading…' : values.state ? 'Select a city' : 'Select a state first'
                      } />

                    <SearchSelectField
                      id="chefLevel"
                      name="chefLevel.id"
                      label="Chef level"
                      data={chefLevels}
                      placeholder="Select a chef level"
                      onSelect={(option) => setFieldValue('chefLevel.name', option?.label ?? '')} />

                  </FormGrid>
                  <NumberField name="yearsOfExperience" label="Years of experience" placeholder="12" />
                  <TagsField
                    name="specialties"
                    label="Specialties"
                    placeholder="French, Modern European"
                    hint="Separate each specialty with a comma." />

                  <MultiSelectSearchField
                    name="servicesOffered"
                    label="Select services offered"
                    options={serviceOptions}
                    placeholder="Select services…"
                    hint="Search and check every service this chef can deliver." />

                  <TextAreaField
                    name="bio"
                    label="Bio"
                    rows={3}
                    placeholder="What makes this chef's cooking distinctive?" />

                  <SelectField
                    name="status"
                    label="Approval status"
                    options={[
                      { value: 'pending', label: 'Pending review' },
                      { value: 'approved', label: 'Approved' },
                      { value: 'suspended', label: 'Suspended' },
                      { value: 'rejected', label: 'Rejected' }]
                    } />

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
                    {isSubmitting ?
                      'Saving…' :
                      editing.id ? 'Save changes' : 'Add chef'}
                  </Button>
                </ModalFooter>
              </Form>
            }
          </Formik> :
          null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove chef"
        message={`Remove ${deleting?.name} from the roster? Any upcoming bookings will need reassignment.`}
        confirmLabel="Remove"
        onConfirm={() => deleting && handleDelete(deleting)}
        onClose={() => setDeleting(null)} />

    </div>);

}
