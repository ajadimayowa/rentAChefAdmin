import React, { useEffect, useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { LinkIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SearchSelectField, TextAreaField, TextField } from '../../components/form/Fields';
import {
  createTermsAndCon,
  deleteTermsAndCon,
  listTermsAndCons,
  updateTermsAndCon,
  type TermsAndConRecord,
  type TermsTargetType } from
'../../services/admin/termsServices';
import { listServiceCategories, listServices, type ServiceCategoryOption } from '../../services/admin/adminServices';
import { listSpecialMenus, type AdminSpecialMenu } from '../../services/admin/specialMenuServices';
import { formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const TARGET_TYPE_LABELS: Record<TermsTargetType, string> = {
  service: 'Service',
  category: 'Category',
  specialMenu: 'Special menu'
};

const TARGET_TYPE_TONES: Record<TermsTargetType, BadgeTone> = {
  service: 'brand',
  category: 'info',
  specialMenu: 'success'
};

const schema = Yup.object({
  description: Yup.string().required('Clause text is required').min(10, 'Add a bit more detail'),
  termsUrl: Yup.string().url('Enter a valid URL'),
  targetType: Yup.string().oneOf(['service', 'category', 'specialMenu']).required('Select what this clause applies to'),
  targetId: Yup.string().required('Select the specific item')
});

interface TermsFormValues {
  id?: string;
  description: string;
  termsUrl: string;
  targetType: TermsTargetType | '';
  targetId: string;
}

const emptyTerm: TermsFormValues = {
  description: '',
  termsUrl: '',
  targetType: '',
  targetId: ''
};

interface SimpleOption {
  id: string;
  name: string;
}

export function TermsAndConditions() {
  const [terms, setTerms] = useState<TermsAndConRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [services, setServices] = useState<SimpleOption[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryOption[]>([]);
  const [specialMenus, setSpecialMenus] = useState<AdminSpecialMenu[]>([]);

  const [editing, setEditing] = useState<TermsFormValues | null>(null);
  const [deleting, setDeleting] = useState<TermsAndConRecord | null>(null);

  const loadTerms = () => {
    setLoading(true);
    listTermsAndCons({ limit: 200 }).
    then((res) => setTerms(res.data)).
    catch((err) => toast.error(errorMessage(err, 'Could not load terms & conditions.'))).
    finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTerms();
    listServices().
    then((res) => setServices(res.payload.map((s) => ({ id: s.id, name: s.name })))).
    catch(() => toast.error('Could not load services.'));
    listServiceCategories().
    then((res) => setCategories(res.payload)).
    catch(() => toast.error('Could not load service categories.'));
    listSpecialMenus({ limit: 200 }).
    then((res) => setSpecialMenus(res.data)).
    catch(() => toast.error('Could not load special services.'));
  }, []);

  const rows = useMemo(
    () =>
    terms.filter(
      (t) =>
      (typeFilter === 'all' || t.targetType === typeFilter) && (
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.targetName.toLowerCase().includes(search.toLowerCase()))
    ),
    [terms, search, typeFilter]
  );

  const targetOptionsFor = (type: TermsTargetType | ''): {id: string;label: string;}[] => {
    if (type === 'service') return services.map((s) => ({ id: s.id, label: s.name }));
    if (type === 'category') return categories.map((c) => ({ id: c.id, label: c.name }));
    if (type === 'specialMenu') return specialMenus.map((m) => ({ id: m.id, label: m.title }));
    return [];
  };

  const handleDelete = async (term: TermsAndConRecord) => {
    try {
      await deleteTermsAndCon(term.id);
      setTerms((prev) => prev.filter((t) => t.id !== term.id));
      toast.success('Clause removed.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete this clause.'));
    }
  };

  const columns: Column<TermsAndConRecord>[] = [
  {
    key: 'clause',
    header: 'Clause',
    render: (t) =>
    <div>
          <p className="max-w-md text-sm leading-relaxed text-ink-700">{t.description}</p>
          {t.termsUrl ?
      <a
        href={t.termsUrl}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-buttons hover:underline">

              <LinkIcon className="h-3 w-3" /> Read more
            </a> :
      null}
        </div>

  },
  {
    key: 'target',
    header: 'Applies to',
    render: (t) =>
    t.targetType ?
    <div>
          <Badge tone={TARGET_TYPE_TONES[t.targetType]}>{TARGET_TYPE_LABELS[t.targetType]}</Badge>
          <p className="mt-1 text-xs text-ink-500">{t.targetName}</p>
        </div> :

    <span className="text-xs text-ink-400">—</span>

  },
  { key: 'created', header: 'Created', render: (t) => formatDate(t.createdAt) },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '90px',
    render: (t) =>
    <div className="flex items-center justify-end gap-1">
          <button
        type="button"
        onClick={() =>
        setEditing({
          id: t.id,
          description: t.description,
          termsUrl: t.termsUrl ?? '',
          targetType: t.targetType ?? '',
          targetId: t.targetId
        })
        }
        aria-label="Edit clause"
        className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900">

            <Pencil className="h-4 w-4" />
          </button>
          <button
        type="button"
        onClick={() => setDeleting(t)}
        aria-label="Delete clause"
        className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600">

            <Trash2 className="h-4 w-4" />
          </button>
        </div>

  }];


  return (
    <div>
      <PageHeader
        title="Terms & Conditions"
        description="Clauses shown to customers before they confirm a booking — attached to a service, a category, or a special service."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptyTerm)}>
            Add clause
          </Button>
        } />


      <Card>
        <CardHeader
          title="Clauses"
          description={`${terms.length} clause${terms.length === 1 ? '' : 's'} on record`} />

        <Toolbar search={search} onSearch={setSearch} placeholder="Search clauses…">
          <FilterSelect
            label="Applies-to filter"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
            { value: 'all', label: 'Applies to anything' },
            { value: 'service', label: 'Services' },
            { value: 'category', label: 'Categories' },
            { value: 'specialMenu', label: 'Special services' }]
            } />

        </Toolbar>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(t) => t.id}
          emptyTitle={loading ? 'Loading clauses…' : 'No clauses found'}
          emptyDescription={
          loading ?
          'Fetching terms & conditions.' :
          'Add a clause and attach it to a service, category, or special service.'
          } />

      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit clause' : 'Add clause'}
        description="Shown to the customer before they confirm a booking for the item it's attached to."
        size="md">

        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const input = {
                description: values.description,
                termsUrl: values.termsUrl || undefined,
                serviceId: values.targetType === 'service' ? values.targetId : null,
                categoryId: values.targetType === 'category' ? values.targetId : null,
                specialMenuId: values.targetType === 'specialMenu' ? values.targetId : null
              };
              if (values.id) {
                await updateTermsAndCon(values.id, input);
                toast.success('Clause updated.');
              } else {
                await createTermsAndCon(input);
                toast.success('Clause added.');
              }
              loadTerms();
              setEditing(null);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save this clause.'));
            } finally {
              setSubmitting(false);
            }
          }}>

            {({ values, errors, touched, setFieldValue, isSubmitting }) =>
          <Form>
                <div className="space-y-4 px-6 py-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink-800">Applies to</label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(TARGET_TYPE_LABELS) as TermsTargetType[]).map((type) =>
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFieldValue('targetType', type);
                      setFieldValue('targetId', '');
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    values.targetType === type ?
                    'bg-ink-950 text-white' :
                    'bg-ink-100 text-ink-600 hover:bg-ink-200 hover:text-ink-900'}`
                    }>

                          {TARGET_TYPE_LABELS[type]}
                        </button>
                  )}
                    </div>
                    {touched.targetType && errors.targetType ?
                <p className="mt-1 text-xs font-medium text-red-600">{errors.targetType}</p> :
                null}
                  </div>

                  {values.targetType ?
              <SearchSelectField
                id="terms-target-id"
                name="targetId"
                label={TARGET_TYPE_LABELS[values.targetType]}
                placeholder={`Search ${TARGET_TYPE_LABELS[values.targetType].toLowerCase()}s…`}
                data={targetOptionsFor(values.targetType)} /> :

              null}

                  <TextAreaField
                name="description"
                label="Clause text"
                rows={5}
                placeholder="Describe the condition in plain language." />


                  <TextField
                name="termsUrl"
                type="url"
                label="Read more URL (optional)"
                placeholder="https://example.com/full-terms" />

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
                    {isSubmitting ? 'Saving…' : editing.id ? 'Save changes' : 'Add clause'}
                  </Button>
                </ModalFooter>
              </Form>
          }
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete clause"
        message="Delete this clause? It will no longer be shown to customers."
        onConfirm={() => deleting && handleDelete(deleting)}
        onClose={() => setDeleting(null)} />

    </div>);

}
