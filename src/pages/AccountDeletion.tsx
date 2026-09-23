import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Formik, useField } from 'formik';
import * as Yup from 'yup';
import { CheckCircle2, Trash2, UserX } from 'lucide-react';
import { LandingNav } from '../components/landing/LandingNav';
import { TextAreaField, TextField } from '../components/form/Fields';
import { Button } from '../components/ui/Button';
import { SUPPORT_EMAIL } from './PrivacyPolicy';

type RequestType = 'delete_account' | 'delete_specific_data';

interface DeletionRequest {
  email: string;
  phone: string;
  requestType: RequestType | '';
  details: string;
}

const requestTypes: {value: RequestType;label: string;description: string;icon: React.ReactNode;}[] = [
{
  value: 'delete_account',
  label: 'Delete my account and associated data',
  description: 'Permanently close your RentAChef account and remove your personal data.',
  icon: <UserX className="h-5 w-5" />
},
{
  value: 'delete_specific_data',
  label: 'Delete specific personal data',
  description: 'Keep your account, but remove certain personal information.',
  icon: <Trash2 className="h-5 w-5" />
}];


const schema = Yup.object({
  email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
  phone: Yup.string().
  trim().
  matches(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number').
  required('Phone number is required'),
  requestType: Yup.string().oneOf(['delete_account', 'delete_specific_data'], 'Select a request type').required('Select a request type'),
  details: Yup.string().
  trim().
  when('requestType', {
    is: 'delete_specific_data',
    then: (s) => s.required('Describe the information you want removed'),
    otherwise: (s) => s
  })
});

function RequestTypeField() {
  const [field, meta, helpers] = useField<DeletionRequest['requestType']>('requestType');
  const showError = Boolean(meta.touched && meta.error);
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-ink-800">Request type</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {requestTypes.map((t) => {
          const selected = field.value === t.value;
          return (
            <label
              key={t.value}
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
              selected ? 'border-buttons bg-amber-50/60 ring-2 ring-buttons/25' : 'border-ink-200 bg-white hover:border-ink-300'}`
              }>
              <input
                type="radio"
                name="requestType"
                value={t.value}
                checked={selected}
                onChange={() => helpers.setValue(t.value)}
                onBlur={() => helpers.setTouched(true)}
                className="sr-only" />
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                selected ? 'bg-buttons text-ink-950' : 'bg-ink-100 text-ink-600'}`
                }>
                {t.icon}
              </span>
              <span>
                <span className="block text-sm font-medium text-ink-900">{t.label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{t.description}</span>
              </span>
            </label>);

        })}
      </div>
      {showError && <p className="mt-1.5 text-xs text-red-600">{meta.error}</p>}
    </fieldset>);

}

function buildMailto(values: DeletionRequest) {
  const type = requestTypes.find((t) => t.value === values.requestType);
  const subject = `Data deletion request: ${type?.label ?? ''}`;
  const body = [
  `Request type: ${type?.label ?? ''}`,
  `Account email: ${values.email.trim()}`,
  `Account phone: ${values.phone.trim()}`,
  '',
  'Details / additional information:',
  values.details.trim() || '(none)'].
  join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function AccountDeletion() {
  const [submitted, setSubmitted] = useState<DeletionRequest | null>(null);

  return (
    <div className="w-full bg-ink-50">
      <LandingNav />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-sm font-medium text-buttons">Legal</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
          RentAChef Account &amp; Data Deletion
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500">
          RentAChef users can request deletion of their account or specific personal data
          associated with their account.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-950 text-white">
              <UserX className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-heading text-base font-semibold text-ink-950">
              Delete your entire account
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              To permanently delete your RentAChef account and associated personal data, submit
              the form below and select “Delete my account.”
            </p>
          </section>
          <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-950 text-white">
              <Trash2 className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-heading text-base font-semibold text-ink-950">
              Delete specific data
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              If you want to keep your account but request deletion of certain personal
              information, select “Delete specific data” and describe the information you want
              removed.
            </p>
          </section>
        </div>

        <section
          id="request-form"
          className="mt-8 scroll-mt-24 rounded-2xl border border-ink-200 bg-white p-6 shadow-card sm:p-8">
          <h2 className="font-heading text-lg font-semibold text-ink-950">Request form</h2>

          {submitted ?
          <div className="mt-6 flex flex-col items-start gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-ink-900">Your email app should now be open</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">
                    Send the prefilled email to complete your request. If nothing opened, email{' '}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-buttons hover:underline">
                      {SUPPORT_EMAIL}
                    </a>{' '}
                    from <span className="font-medium text-ink-800">{submitted.email}</span> with
                    your request details.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                href={buildMailto(submitted)}
                className="inline-flex h-10 items-center rounded-lg bg-buttons px-4 text-sm font-medium text-ink-950 hover:bg-amber-600 hover:text-white">
                  Open email again
                </a>
                <Button variant="secondary" onClick={() => setSubmitted(null)}>
                  Start a new request
                </Button>
              </div>
            </div> :

          <Formik<DeletionRequest>
            initialValues={{ email: '', phone: '', requestType: '', details: '' }}
            validationSchema={schema}
            onSubmit={(values) => {
              window.location.href = buildMailto(values);
              setSubmitted(values);
            }}>
              {({ values }) =>
            <Form className="mt-6 space-y-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField
                  name="email"
                  type="email"
                  label="Email address associated with account"
                  placeholder="you@example.com" />
                    <TextField
                  name="phone"
                  type="tel"
                  label="Phone number associated with account"
                  placeholder="+234 800 000 0000" />
                  </div>

                  <RequestTypeField />

                  <TextAreaField
                name="details"
                rows={4}
                label="Details / additional information"
                placeholder={
                values.requestType === 'delete_specific_data' ?
                'Describe the information you want removed (e.g. saved addresses, profile photo, reviews).' :
                'Anything else we should know (optional).'
                } />

                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    Submit Request
                  </Button>
                </Form>
            }
            </Formik>
          }
        </section>

        <div className="mt-8 space-y-3 text-sm leading-relaxed text-ink-500">
          <p>We may contact you to verify account ownership before processing your request.</p>
          <p>
            Some information may be retained where required for legal, security, fraud-prevention,
            accounting, or regulatory purposes. Details are available in our{' '}
            <Link to="/privacy-policy#retention" className="font-medium text-buttons hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>);

}
