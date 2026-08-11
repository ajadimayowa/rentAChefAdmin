import { Field, Form, Formik } from 'formik';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Mail, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Button } from '../components/ui/Button';
import { ApiError } from '../config/api';
import { verifyEmail } from '../services/auth';

type Status = 'verifying' | 'success' | 'form';

interface FormValues {
  email: string;
  otp: string;
}

const validationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  otp: Yup.string().required('Enter the code from your email')
});

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

export function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryEmail = searchParams.get('email') ?? '';
  const queryOtp = searchParams.get('otp') ?? '';

  const [status, setStatus] = useState<Status>(queryEmail && queryOtp ? 'verifying' : 'form');
  const [formError, setFormError] = useState<string | null>(null);
  const attemptedAutoVerify = useRef(false);

  useEffect(() => {
    if (!queryEmail || !queryOtp || attemptedAutoVerify.current) return;
    attemptedAutoVerify.current = true;

    verifyEmail(queryEmail, queryOtp).
    then(() => setStatus('success')).
    catch((err) => {
      setFormError(errorMessage(err, 'That link is invalid or has expired.'));
      setStatus('form');
    });
  }, [queryEmail, queryOtp]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-ink-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm">

        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-light text-ink-950">
            <img src="/rentAChefIconTrans.png" alt="RentAChef" className="h-5 w-5 object-contain" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight text-ink-950">
            Rent a Chef
          </span>
        </Link>

        <div className="rounded-2xl border border-ink-200/80 bg-white p-6 shadow-card sm:p-8">
          {status === 'verifying' &&
          <div className="flex flex-col items-center py-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-buttons" />
              <h1 className="mt-4 font-heading text-xl font-semibold text-ink-950">
                Verifying your email…
              </h1>
              <p className="mt-1.5 text-sm text-ink-500">Hang tight, this only takes a second.</p>
            </div>
          }

          {status === 'success' &&
          <div className="flex flex-col items-center py-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </span>
              <h1 className="mt-4 font-heading text-xl font-semibold text-ink-950">
                Email verified
              </h1>
              <p className="mt-1.5 text-sm text-ink-500">
                Your email has been confirmed. You can now sign in to your account.
              </p>
              <Button className="mt-6 w-full" size="lg" onClick={() => navigate('/login')}>
                Go to sign in
              </Button>
            </div>
          }

          {status === 'form' &&
          <>
              <h1 className="font-heading text-2xl font-semibold text-ink-950">Verify your email</h1>
              <p className="mt-1.5 text-sm text-ink-500">
                Enter the code we emailed you to confirm your address.
              </p>

              {formError &&
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm font-medium text-red-600">{formError}</p>
                </div>
            }

              <Formik<FormValues>
              initialValues={{ email: queryEmail, otp: queryOtp }}
              enableReinitialize
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting }) => {
                setFormError(null);
                try {
                  await verifyEmail(values.email, values.otp);
                  setStatus('success');
                } catch (err) {
                  setFormError(errorMessage(err, 'Invalid or expired code.'));
                } finally {
                  setSubmitting(false);
                }
              }}>

                {({ isSubmitting, errors, touched }) =>
              <Form className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-800">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                        <Field
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className={`w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 ${
                      touched.email && errors.email ?
                      'border-red-300 focus:border-red-400 focus:ring-red-200' :
                      'border-ink-200 focus:border-buttons focus:ring-buttons/25'}`
                      } />

                      </div>
                      {touched.email && errors.email ?
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p> :
                  null}
                    </div>

                    <div>
                      <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-ink-800">
                        Verification code
                      </label>
                      <div className="relative">
                        <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                        <Field
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      placeholder="123456"
                      className={`w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm tracking-widest text-ink-900 placeholder:text-ink-400 placeholder:tracking-normal transition-colors focus:outline-none focus:ring-2 ${
                      touched.otp && errors.otp ?
                      'border-red-300 focus:border-red-400 focus:ring-red-200' :
                      'border-ink-200 focus:border-buttons focus:ring-buttons/25'}`
                      } />

                      </div>
                      {touched.otp && errors.otp ?
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.otp}</p> :
                  null}
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                      {isSubmitting ? 'Verifying…' : 'Verify email'}
                    </Button>

                    <p className="text-center text-xs text-ink-400">
                      Already verified? <Link to="/login" className="font-medium text-buttons">Sign in</Link>
                    </p>
                  </Form>
              }
              </Formik>
            </>
          }
        </div>
      </motion.div>
    </div>);

}
