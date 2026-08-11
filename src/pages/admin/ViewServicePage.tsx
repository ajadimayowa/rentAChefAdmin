import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  ScrollText,
  ShoppingBag,
  Trash2,
  UploadCloud,
  UtensilsCrossed } from
'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TextAreaField } from '../../components/form/Fields';
import {
  getService,
  listServiceCategories,
  type AdminService } from
'../../services/admin/adminServices';
import {
  createServiceTerm,
  deleteServiceTerm,
  listServiceTerms,
  updateServiceTerm,
  type ServiceTerm } from
'../../services/admin/termsServices';
import { formatDate, titleCase } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const termSchema = Yup.object({
  description: Yup.string().required('Add the clause text').max(1000, 'Keep it under 1000 characters')
});

export function ViewServicePage() {
  const { id } = useParams<{id: string;}>();
  const [service, setService] = useState<AdminService | null>(null);
  const [terms, setTerms] = useState<ServiceTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [termsLoading, setTermsLoading] = useState(true);
  const [editingTerm, setEditingTerm] = useState<ServiceTerm | 'new' | null>(null);
  const [deletingTerm, setDeletingTerm] = useState<ServiceTerm | null>(null);

  const loadTerms = (serviceId: string) => {
    setTermsLoading(true);
    listServiceTerms(serviceId).
    then((res) => setTerms(res.payload)).
    catch((err) => toast.error(errorMessage(err, 'Could not load terms & conditions.'))).
    finally(() => setTermsLoading(false));
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    listServiceCategories().
    then((catRes) => {
      const categoryNamesById = new Map(catRes.payload.map((c) => [c.id, c.name]));
      return getService(id, categoryNamesById);
    }).
    then((res) => setService(res.payload)).
    catch((err) => toast.error(errorMessage(err, 'Could not load this service.'))).
    finally(() => setLoading(false));
    loadTerms(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeleteTerm = async (term: ServiceTerm) => {
    try {
      await deleteServiceTerm(term.id);
      setTerms((prev) => prev.filter((t) => t.id !== term.id));
      toast.success('Clause removed.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete this clause.'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        <p className="mt-3 text-sm text-ink-500">Loading service…</p>
      </div>);

  }

  if (!service || !id) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-heading text-lg font-semibold text-ink-900">Service not found</p>
        <Link to="/admin/services" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-buttons">
          <ArrowLeft className="h-4 w-4" /> Back to services
        </Link>
      </div>);

  }

  return (
    <div>
      <Link
        to="/admin/services"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">

        <ArrowLeft className="h-4 w-4" /> Back to services
      </Link>

      <PageHeader
        title={service.name}
        description={service.description || 'No description added yet.'}
        action={
        <div className="flex items-center gap-2">
            <Badge tone="neutral">{service.categoryName}</Badge>
            <Badge tone={service.isActive ? 'success' : 'neutral'}>{service.isActive ? 'Active' : 'Inactive'}</Badge>
          </div>
        } />


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Service details" />
            <div className="grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-ink-400">Workflow</p>
                <p className="mt-0.5 text-ink-800">{service.workflow || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Booking type</p>
                <p className="mt-0.5 text-ink-800">
                  {service.bookingType ? titleCase(service.bookingType) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Eligible chef levels</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {service.allowedChefLevels.length ?
                  service.allowedChefLevels.map((l) =>
                  <Badge key={l} tone="neutral">{titleCase(l)}</Badge>
                  ) :

                  <span className="text-ink-500">Any</span>
                  }
                </div>
              </div>
              <div>
                <p className="text-xs text-ink-400">Created</p>
                <p className="mt-0.5 text-ink-800">{formatDate(service.createdAt)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Capabilities" />
            <div className="grid grid-cols-1 gap-3 p-5 text-sm sm:grid-cols-3">
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${service.supportsChefMenu ? 'border-buttons/40 bg-buttons/10 text-ink-900' : 'border-ink-200 text-ink-400'}`}>
                <UtensilsCrossed className="h-4 w-4 shrink-0" />
                Chef menu
              </div>
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${service.supportsCustomerMenuUpload ? 'border-buttons/40 bg-buttons/10 text-ink-900' : 'border-ink-200 text-ink-400'}`}>
                <UploadCloud className="h-4 w-4 shrink-0" />
                Customer upload
              </div>
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${service.supportsProcurement ? 'border-buttons/40 bg-buttons/10 text-ink-900' : 'border-ink-200 text-ink-400'}`}>
                <ShoppingBag className="h-4 w-4 shrink-0" />
                Procurement
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Terms & conditions"
              description="Clauses shown to the customer before booking this service"
              action={
              <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setEditingTerm('new')}>
                  Add terms
                </Button>
              } />

            {termsLoading ?
            <p className="px-5 py-10 text-center text-sm text-ink-500">Loading terms…</p> :
            terms.length === 0 ?
            <div className="flex flex-col items-center px-5 py-10 text-center">
                <ScrollText className="h-6 w-6 text-ink-300" />
                <p className="mt-3 text-sm text-ink-500">No terms added to this service yet.</p>
              </div> :

            <ul className="divide-y divide-ink-100">
                {terms.map((term) =>
              <li key={term.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                    <p className="text-sm leading-relaxed text-ink-700">{term.description}</p>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                    type="button"
                    onClick={() => setEditingTerm(term)}
                    aria-label="Edit clause"
                    className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900">

                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                    type="button"
                    onClick={() => setDeletingTerm(term)}
                    aria-label="Delete clause"
                    className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600">

                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
              )}
              </ul>
            }
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Icon" />
            <div className="flex items-center justify-center p-8 text-4xl">
              {service.icon || '—'}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(editingTerm)}
        onClose={() => setEditingTerm(null)}
        title={editingTerm === 'new' ? 'Add terms & conditions' : 'Edit clause'}
        description="Shown to the customer before they confirm a booking for this service."
        size="md">

        {editingTerm ?
        <Formik
          initialValues={{ description: editingTerm === 'new' ? '' : editingTerm.description }}
          validationSchema={termSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if (editingTerm === 'new') {
                const res = await createServiceTerm(id, values.description);
                setTerms((prev) => [res.payload, ...prev]);
                toast.success('Clause added.');
              } else {
                const res = await updateServiceTerm(editingTerm.id, values.description);
                setTerms((prev) => prev.map((t) => t.id === res.payload.id ? res.payload : t));
                toast.success('Clause updated.');
              }
              setEditingTerm(null);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save this clause.'));
            } finally {
              setSubmitting(false);
            }
          }}>

            {({ isSubmitting }) =>
          <Form>
                <div className="px-6 py-5">
                  <TextAreaField
                name="description"
                label="Clause text"
                rows={5}
                placeholder="Describe the condition in plain language." />

                </div>
                <ModalFooter>
                  <Button
                variant="secondary"
                type="button"
                disabled={isSubmitting}
                onClick={() => setEditingTerm(null)}>

                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : editingTerm === 'new' ? 'Add clause' : 'Save changes'}
                  </Button>
                </ModalFooter>
              </Form>
          }
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingTerm)}
        title="Delete clause"
        message="Delete this clause? It will no longer be shown to customers booking this service."
        onConfirm={() => deletingTerm && handleDeleteTerm(deletingTerm)}
        onClose={() => setDeletingTerm(null)} />

    </div>);

}
