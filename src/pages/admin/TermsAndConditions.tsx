import React, { useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Pencil, Plus, ScrollText, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { CheckboxField, TextAreaField, TextField } from '../../components/form/Fields';
import { useAdminData } from '../../contexts/AdminDataContext';
import { uid } from '../../utils/format';
import type { TermsSection } from '../../types';

const schema = Yup.object({
  title: Yup.string().required('Clause title is required').max(80, 'Keep the title short'),
  body: Yup.string().required('Clause text is required').min(20, 'Add a bit more detail')
});

export function TermsAndConditions() {
  const { services, saveService } = useAdminData();
  const [selectedId, setSelectedId] = useState(services[0]?.id ?? '');
  const [editing, setEditing] = useState<TermsSection | null>(null);
  const [deleting, setDeleting] = useState<TermsSection | null>(null);

  const service = useMemo(
    () => services.find((s) => s.id === selectedId) ?? services[0],
    [services, selectedId]
  );

  const persist = (terms: TermsSection[]) => {
    if (!service) return;
    saveService({ ...service, terms });
  };

  if (!service) {
    return (
      <div>
        <PageHeader
          title="Terms & Conditions"
          description="Attach the clauses customers must accept before a service is confirmed." />
        
        <Card className="px-6 py-16 text-center">
          <p className="font-heading text-[15px] font-semibold text-ink-900">No services yet</p>
          <p className="mt-1 text-sm text-ink-500">
            Create a service first, then attach its terms here.
          </p>
        </Card>
      </div>);

  }

  return (
    <div>
      <PageHeader
        title="Terms & Conditions"
        description="Attach the clauses customers must accept before a service is confirmed."
        action={
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setEditing({ id: '', title: '', body: '', required: true })}>
          
            Add clause
          </Button>
        } />
      

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardHeader title="Services" description="Select a service to manage its terms" />
          <ul className="p-2">
            {services.map((s) => {
              const active = s.id === service.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    active ? 'bg-ink-950 text-white' : 'text-ink-700 hover:bg-ink-100'}`
                    }>
                    
                    <span className="truncate">{s.name}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                      active ? 'bg-white/15 text-white' : 'bg-ink-100 text-ink-600'}`
                      }>
                      
                      {s.terms.length}
                    </span>
                  </button>
                </li>);

            })}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title={`${service.name} — terms`}
            description={`${service.terms.length} clause${
            service.terms.length === 1 ? '' : 's'} shown at checkout`
            } />
          

          {service.terms.length === 0 ?
          <div className="flex flex-col items-center px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">
                <ScrollText className="h-6 w-6" />
              </span>
              <p className="mt-4 font-heading text-[15px] font-semibold text-ink-900">
                No clauses attached
              </p>
              <p className="mt-1 max-w-sm text-sm text-ink-500">
                Customers booking this service will only see the platform-wide terms.
              </p>
              <Button
              className="mt-5"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setEditing({ id: '', title: '', body: '', required: true })}>
              
                Add the first clause
              </Button>
            </div> :

          <ol className="divide-y divide-ink-100">
              {service.terms.map((term, i) =>
            <li key={term.id} className="flex gap-4 px-5 py-5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-100 font-heading text-xs font-semibold text-ink-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-[15px] font-semibold text-ink-950">
                        {term.title}
                      </h3>
                      <Badge tone={term.required ? 'brand' : 'neutral'}>
                        {term.required ? 'Must accept' : 'Informational'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{term.body}</p>
                  </div>
                  <div className="flex shrink-0 items-start gap-1">
                    <button
                  type="button"
                  onClick={() => setEditing(term)}
                  aria-label={`Edit ${term.title}`}
                  className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-900">
                  
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                  type="button"
                  onClick={() => setDeleting(term)}
                  aria-label={`Delete ${term.title}`}
                  className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600">
                  
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
            )}
            </ol>
          }
        </Card>
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit clause' : 'Add clause'}
        description={`Applies to ${service.name}`}
        size="md">
        
        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={(values) => {
            const next = values.id ?
            service.terms.map((t) => t.id === values.id ? values : t) :
            [...service.terms, { ...values, id: uid('trm') }];
            persist(next);
            setEditing(null);
          }}>
          
            <Form>
              <div className="space-y-4 px-6 py-5">
                <TextField name="title" label="Clause title" placeholder="Cancellation Policy" />
                <TextAreaField
                name="body"
                label="Clause text"
                rows={5}
                placeholder="Describe the condition in plain language." />
              
                <CheckboxField
                name="required"
                label="Customer must explicitly accept"
                hint="Required clauses block checkout until they are ticked." />
              
              </div>
              <ModalFooter>
                <Button variant="secondary" type="button" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">{editing.id ? 'Save clause' : 'Add clause'}</Button>
              </ModalFooter>
            </Form>
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete clause"
        message={`Remove “${deleting?.title}” from ${service.name}?`}
        onConfirm={() =>
        deleting && persist(service.terms.filter((t) => t.id !== deleting.id))
        }
        onClose={() => setDeleting(null)} />
      
    </div>);

}