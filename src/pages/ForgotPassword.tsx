import { Field, Formik, Form } from 'formik';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { Button } from '../components/ui/Button';
import { ApiError } from '../config/api';
import { changePasswordWithOtp, requestPasswordChangeOtp, resendPasswordChangeOtp } from '../services/auth';

interface EmailValues {
  email: string;
}

interface ResetValues {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

const emailInitialValues: EmailValues = { email: '' };
const resetInitialValues: ResetValues = { otp: '', newPassword: '', confirmPassword: '' };

const emailSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required')
});

const resetSchema = Yup.object({
  otp: Yup.string().required('Enter the code we sent you').min(4, 'Enter the full code'),
  newPassword: Yup.string().min(8, 'At least 8 characters').required('New password is required'),
  confirmPassword: Yup.string().
  oneOf([Yup.ref('newPassword')], 'Passwords must match').
  required('Confirm your new password')
});

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resending, setResending] = useState(false);

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
          {step === 'email' ?
          <>
              <h1 className="font-heading text-2xl font-semibold text-ink-950">Reset your password</h1>
              <p className="mt-1.5 text-sm text-ink-500">
                Enter your account email and we'll send you a verification code to reset your password.
              </p>

              <Formik
              key="email"
              initialValues={emailInitialValues}
              validationSchema={emailSchema}
              onSubmit={async (values, { setSubmitting }) => {
                setFormError(null);
                try {
                  await requestPasswordChangeOtp(values.email);
                  setEmail(values.email);
                  setStep('reset');
                  toast.success('We sent a verification code to your email.');
                } catch (err) {
                  setFormError(errorMessage(err, 'Could not send verification code.'));
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

                    {formError ?
                <p className="text-sm font-medium text-red-600">{formError}</p> :
                null}

                    <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                      {isSubmitting ? 'Sending code…' : 'Send verification code'}
                    </Button>

                    <p className="text-center text-xs text-ink-400">
                      Remembered your password?{' '}
                      <Link to="/login" className="font-medium text-buttons">Sign in</Link>
                    </p>
                  </Form>
              }
              </Formik>
            </> :

          <>
              <h1 className="font-heading text-2xl font-semibold text-ink-950">Enter your code</h1>
              <p className="mt-1.5 text-sm text-ink-500">
                We sent a verification code to <span className="font-medium text-ink-800">{email}</span>.
              </p>

              <Formik
              key="reset"
              initialValues={resetInitialValues}
              validationSchema={resetSchema}
              onSubmit={async (values, { setSubmitting }) => {
                setFormError(null);
                try {
                  await changePasswordWithOtp(email, values.otp, values.newPassword);
                  toast.success('Password updated. Please sign in with your new password.');
                  navigate('/login', { replace: true });
                } catch (err) {
                  setFormError(errorMessage(err, 'Could not update your password.'));
                } finally {
                  setSubmitting(false);
                }
              }}>

                {({ isSubmitting, errors, touched }) =>
              <Form className="mt-6 space-y-4">
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
                      autoComplete="one-time-code"
                      autoFocus
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

                    <div>
                      <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-ink-800">
                        New password
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                        <Field
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className={`w-full rounded-lg border bg-white py-2 pl-10 pr-10 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 ${
                      touched.newPassword && errors.newPassword ?
                      'border-red-300 focus:border-red-400 focus:ring-red-200' :
                      'border-ink-200 focus:border-buttons focus:ring-buttons/25'}`
                      } />

                        <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}>

                          {showPassword ?
                      <EyeOff className="h-4 w-4" /> :

                      <Eye className="h-4 w-4" />
                      }
                        </button>
                      </div>
                      {touched.newPassword && errors.newPassword ?
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.newPassword}</p> :
                  null}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink-800">
                        Confirm new password
                      </label>
                      <div className="relative">
                        <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                        <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className={`w-full rounded-lg border bg-white py-2 pl-10 pr-10 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 ${
                      touched.confirmPassword && errors.confirmPassword ?
                      'border-red-300 focus:border-red-400 focus:ring-red-200' :
                      'border-ink-200 focus:border-buttons focus:ring-buttons/25'}`
                      } />

                        <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-700"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>

                          {showConfirmPassword ?
                      <EyeOff className="h-4 w-4" /> :

                      <Eye className="h-4 w-4" />
                      }
                        </button>
                      </div>
                      {touched.confirmPassword && errors.confirmPassword ?
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.confirmPassword}</p> :
                  null}
                    </div>

                    {formError ?
                <p className="text-sm font-medium text-red-600">{formError}</p> :
                null}

                    <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                      {isSubmitting ? 'Saving…' : 'Reset password'}
                    </Button>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setFormError(null);
                    }}
                    className="font-medium text-ink-500 transition-colors hover:text-ink-800">

                        ← Use a different email
                      </button>
                      <button
                    type="button"
                    disabled={resending}
                    onClick={async () => {
                      setResending(true);
                      try {
                        await resendPasswordChangeOtp(email);
                        toast.success('Code resent.');
                      } catch (err) {
                        toast.error(errorMessage(err, 'Could not resend code.'));
                      } finally {
                        setResending(false);
                      }
                    }}
                    className="font-medium text-buttons transition-colors hover:text-ink-900 disabled:opacity-50">

                        {resending ? 'Resending…' : 'Resend code'}
                      </button>
                    </div>
                  </Form>
              }
              </Formik>
            </>
          }
        </div>
      </motion.div>
    </div>);

}
