import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import {
  BadgeCheck,
  Calendar,
  ChefHat,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Star,
  UtensilsCrossed } from
'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
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
  type SearchSelectOption } from
'../../components/form/Fields';
import { useAuthStore } from '../../store/authStore';
import { formatDate, titleCase } from '../../utils/format';
import { ApiError } from '../../config/api';
import {
  getChefProfile,
  updateChefProfile,
  type ChefProfile } from
'../../services/chef/chefServices';
import { getServicesOffered } from '../../services/servicesOfferedApis';
import { getStateLgas, getStates } from '../../services/utility';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

interface ProfileFormValues {
  name: string;
  phone: string;
  gender: string;
  dob: string;
  state: {stateId: string;stateName: string;};
  city: string;
  yearsOfExperience: number | '';
  bio: string;
  specialties: string[];
  servicesOffered: string[];
  avatarFile: File | null;
}

const schema = Yup.object({
  name: Yup.string().required('Your name is required'),
  phone: Yup.string().required('Phone number is required'),
  state: Yup.object({ stateId: Yup.string().required('Select a state') }),
  city: Yup.string().required('Select a city'),
  yearsOfExperience: Yup.number().
  typeError('Enter a number').
  required('Experience is required').
  min(0, 'Cannot be negative').
  max(60, 'That seems too high'),
  bio: Yup.string().required('Add a short bio').max(240, 'Keep it under 240 characters'),
  specialties: Yup.array().of(Yup.string()).min(1, 'Add at least one specialty'),
  servicesOffered: Yup.array().of(Yup.string()).min(1, 'Select at least one service')
});

function StatCard({ label, value }: {label: string;value: React.ReactNode;}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-2 font-heading text-2xl font-semibold text-ink-950">{value}</p>
    </Card>);

}

export function ChefProfilePage() {
  const authUser = useAuthStore((s) => s.user);
  const updateAuthUser = useAuthStore((s) => s.updateUser);

  const [profile, setProfile] = useState<ChefProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [states, setStates] = useState<SearchSelectOption[]>([]);
  const [lgas, setLgas] = useState<SearchSelectOption[]>([]);
  const [lgasLoading, setLgasLoading] = useState(false);
  const [serviceOptions, setServiceOptions] = useState<MultiSelectOption[]>([]);

  const loadProfile = () => {
    if (!authUser) return;
    setLoading(true);
    getChefProfile(authUser.id).
    then(setProfile).
    catch((err) => toast.error(errorMessage(err, 'Could not load your profile.'))).
    finally(() => setLoading(false));
  };

  useEffect(loadProfile, [authUser?.id]);

  useEffect(() => {
    getStates().
    then((res) => setStates((res.payload as any[]).map((s) => ({ id: String(s.id), label: s.state })))).
    catch(() => toast.error('Could not load states.'));
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
      setLgas((res.payload as any[]).map((l) => ({ id: l, label: l })));
    } catch (err) {
      toast.error(errorMessage(err, 'Could not load cities.'));
      setLgas([]);
    } finally {
      setLgasLoading(false);
    }
  };

  useEffect(() => {
    if (editing && profile?.state.stateId) {
      loadLgas(profile.state.stateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        <p className="mt-3 text-sm text-ink-500">Loading your profile…</p>
      </div>);

  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-heading text-lg font-semibold text-ink-900">Could not load your profile</p>
        <p className="mt-1 text-sm text-ink-500">Refresh the page to try again.</p>
      </div>);

  }

  const initialValues: ProfileFormValues = {
    name: profile.name,
    phone: profile.phone,
    gender: profile.gender ?? '',
    dob: profile.dob ? profile.dob.slice(0, 10) : '',
    state: profile.state,
    city: profile.city,
    yearsOfExperience: profile.yearsOfExperience,
    bio: profile.bio,
    specialties: profile.specialties,
    servicesOffered: profile.services.map((s) => s.id),
    avatarFile: null
  };

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="This is what guests see when they browse your chef profile."
        action={
        <Button icon={<Pencil className="h-4 w-4" />} onClick={() => setEditing(true)}>
            Edit profile
          </Button>
        } />


      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total bookings" value={profile.totalBookings} />
        <StatCard label="Completed" value={profile.completedBookings} />
        <StatCard label="Upcoming" value={profile.upcomingBookings} />
        <StatCard
          label="Rating"
          value={
          <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-buttons text-buttons" />
              {profile.rating || '—'}
            </span>
          } />

      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Profile" />
            <div className="flex flex-col gap-5 p-5 sm:flex-row">
              {profile.avatar ?
              <img
                src={profile.avatar}
                alt=""
                className="h-24 w-24 shrink-0 rounded-xl border border-ink-200 object-cover" /> :

              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-400">
                  <ChefHat className="h-8 w-8" />
                </div>
              }
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{profile.chefLevel?.name || 'No chef level'}</Badge>
                  {profile.isEmailVerified ?
                  <Badge tone="success">
                      <BadgeCheck className="mr-1 h-3 w-3" /> Email verified
                    </Badge> :

                  <Badge tone="warning">Email not verified</Badge>
                  }
                </div>
                <p className="text-sm leading-relaxed text-ink-600">{profile.bio || 'No bio added yet.'}</p>
                {profile.specialties.length > 0 &&
                <div className="flex flex-wrap gap-1.5">
                    {profile.specialties.map((s) =>
                  <Badge key={s} tone="neutral">{s}</Badge>
                  )}
                  </div>
                }
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Services offered" />
            <div className="flex flex-wrap gap-1.5 p-5">
              {profile.services.length > 0 ?
              profile.services.map((s) =>
              <Badge key={s.id} tone="info">
                    <UtensilsCrossed className="mr-1 h-3 w-3" /> {s.name}
                  </Badge>
              ) :

              <p className="text-sm text-ink-500">No services assigned yet.</p>
              }
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent menus" description="Last 3 menus you've created" />
            {profile.recentMenus.length > 0 ?
            <ul className="divide-y divide-ink-100">
                {profile.recentMenus.map((m) =>
              <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div>
                      <p className="font-medium text-ink-900">{m.title}</p>
                      <p className="text-xs text-ink-500">
                        {[m.menuType, m.menuClass].filter((v): v is string => Boolean(v)).map(titleCase).join(' · ') || '—'}
                        {m.isSignatureMenu ? ' · Signature' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-ink-900">₦{m.pricePerHead.toLocaleString()}/head</p>
                      <p className="text-xs text-ink-400">{m.createdAt ? formatDate(m.createdAt) : '—'}</p>
                    </div>
                  </li>
              )}
              </ul> :

            <p className="px-5 py-6 text-sm text-ink-500">No menus created yet.</p>
            }
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Contact" />
            <div className="space-y-3 p-5 text-sm">
              <div className="flex items-center gap-2 text-ink-700">
                <Mail className="h-4 w-4 shrink-0 text-ink-400" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <Phone className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{profile.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <MapPin className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{[profile.city, profile.state.stateName].filter(Boolean).join(', ') || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <ChefHat className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{profile.gender || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <Calendar className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{profile.dob ? formatDate(profile.dob) : '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <Clock className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{profile.yearsOfExperience} years experience</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Staff record" />
            <div className="space-y-2 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">Staff ID</span>
                <span className="font-medium text-ink-900">{profile.staffId || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Chef level</span>
                <span className="font-medium text-ink-900">{profile.chefLevel?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Joined</span>
                <span className="font-medium text-ink-900">{formatDate(profile.joinedAt)}</span>
              </div>
            </div>
            <p className="border-t border-ink-200 px-5 py-3 text-xs text-ink-400">
              Chef level, rating and staff ID are managed by Rent a Chef admin.
            </p>
          </Card>
        </div>
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit profile"
        description="Update what guests see when they browse your chef profile."
        size="lg">

        <Formik<ProfileFormValues>
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const updated = await updateChefProfile(profile.id, {
                name: values.name,
                phone: values.phone,
                gender: values.gender || undefined,
                dob: values.dob || undefined,
                state: values.state,
                city: values.city,
                yearsOfExperience: Number(values.yearsOfExperience),
                bio: values.bio,
                specialties: values.specialties,
                servicesOffered: values.servicesOffered,
                avatar: values.avatarFile
              });
              setProfile(updated);
              updateAuthUser({ name: updated.name, avatar: updated.avatar });
              toast.success('Profile updated.');
              setEditing(false);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save your profile.'));
            } finally {
              setSubmitting(false);
            }
          }}>

          {({ isSubmitting, values, setFieldValue }) =>
          <Form>
              <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
                <ImageField
                name="avatarFile"
                label="Profile photo"
                hint="JPG or PNG, square works best."
                previewUrl={profile.avatar || undefined} />

                <FormGrid>
                  <TextField name="name" label="Full name" placeholder="Antoine Dubois" />
                  <TextField name="phone" label="Phone" placeholder="+234 800 000 0000" />
                </FormGrid>
                <FormGrid>
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

                  <SearchSelectField
                  id="city"
                  name="city"
                  label="City"
                  data={lgas}
                  disabled={!values.state?.stateId || lgasLoading}
                  placeholder={
                  lgasLoading ? 'Loading…' : values.state?.stateId ? 'Select a city' : 'Select a state first'
                  } />

                </FormGrid>
                <FormGrid>
                  <SelectField
                  name="gender"
                  label="Gender"
                  options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' }]
                  } />

                  <TextField name="dob" label="Date of birth" type="date" />
                </FormGrid>
                <NumberField name="yearsOfExperience" label="Years of experience" placeholder="12" />
                <TagsField
                name="specialties"
                label="Specialties"
                placeholder="French, Modern European"
                hint="Separate each specialty with a comma." />

                <MultiSelectSearchField
                name="servicesOffered"
                label="Services you offer"
                options={serviceOptions}
                placeholder="Select services…"
                hint="Search and check every service you can deliver." />

                <TextAreaField
                name="bio"
                label="Bio"
                rows={3}
                placeholder="What makes your cooking distinctive?" />

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
    </div>);

}
