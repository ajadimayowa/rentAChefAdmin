import { Field, Formik, Form } from 'formik';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { Button } from '../components/ui/Button';
import { ApiError } from '../config/api';
import { registerClient } from '../services/auth';

interface SignUpValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const initialValues: SignUpValues = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: ''
};

const signUpSchema = Yup.object({
  fullName: Yup.string().trim().required('Full name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  password: Yup.string().min(8, 'At least 8 characters').required('Password is required'),
  confirmPassword: Yup.string().
    oneOf([Yup.ref('password')], 'Passwords must match').
    required('Confirm your password')
});

const fade = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 0.8, y: 0 }
};

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof ApiError ? err.message : fallback;

export function SignUp() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-buttons/6 blur-1xl" />

        <img
          src="/landingpageimg.jpg"
          alt="A private chef plating a gourmet dish on a marble kitchen island"
          className="absolute inset-0 h-full w-full object-cover opacity-30" />

        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-ink-950/40" />

        <div className="relative z-10 flex items-center gap-2.5 px-10 pt-10">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-light text-ink-950">
            <img src="/rentAChefIconTrans.png" alt="RentAChef" className="h-5 w-5 object-contain" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight text-white">
            Rent a Chef
          </span>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.08 }}
          className="relative z-10 px-10 pb-14">

          <motion.h2
            variants={fade}
            className="max-w-md font-heading text-3xl font-semibold leading-[1.15] tracking-tight text-white">

            Your next dinner party
            <span className="block text-buttons">starts with an account.</span>
          </motion.h2>
          <motion.p variants={fade} className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">
            Create a free account to book vetted private chefs, track your reservations and save
            your favorite menus.
          </motion.p>
        </motion.div>
      </div>

      <div className="flex w-full items-center justify-center bg-ink-50 px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm">

          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-light text-ink-950">
              <img src="/rentAChefIconTrans.png" alt="RentAChef" className="h-5 w-5 object-contain" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight text-ink-950">
              Rent a Chef
            </span>
          </Link>

          <div className="rounded-2xl border border-ink-200/80 bg-white p-6 shadow-card sm:p-8">
            <h1 className="font-heading text-2xl font-semibold text-ink-950">Create your account</h1>
            <p className="mt-1.5 text-sm text-ink-500">
              For clients booking a chef. Are you a chef?{' '}
              <a href="#" className="font-medium text-buttons">Apply here</a>.
            </p>

            <Formik
              initialValues={initialValues}
              validationSchema={signUpSchema}
              onSubmit={async (values, { setSubmitting }) => {
                setFormError(null);
                try {
                  await registerClient({
                    email: values.email,
                    password: values.password,
                    fullName: values.fullName,
                    phoneNumber: values.phoneNumber
                  });
                  toast.success('Account created. Check your email for a verification code.');
                  navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
                } catch (err) {
                  setFormError(errorMessage(err, 'Unable to create your account.'));
                } finally {
                  setSubmitting(false);
                }
              }}>

              {({ isSubmitting, errors, touched }) =>
                <Form className="mt-6 space-y-4" autoComplete="off">
                  <div>
                    <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-ink-800">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <Field
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Jordan Blake"
                        className={`w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 ${touched.fullName && errors.fullName ?
                            'border-red-300 focus:border-red-400 focus:ring-red-200' :
                            'border-ink-200 focus:border-buttons focus:ring-buttons/25'}`
                        } />

                    </div>
                    {touched.fullName && errors.fullName ?
                      <p className="mt-1 text-xs font-medium text-red-600">{errors.fullName}</p> :
                      null}
                  </div>

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
                        className={`w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 ${touched.email && errors.email ?
                            'border-red-300 focus:border-red-400 focus:ring-red-200' :
                            'border-ink-200 focus:border-buttons focus:ring-buttons/25'}`
                        } />

                    </div>
                    {touched.email && errors.email ?
                      <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p> :
                      null}
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="mb-1.5 block text-sm font-medium text-ink-800">
                      Phone number
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <Field
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className={`w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 ${touched.phoneNumber && errors.phoneNumber ?
                            'border-red-300 focus:border-red-400 focus:ring-red-200' :
                            'border-ink-200 focus:border-buttons focus:ring-buttons/25'}`
                        } />

                    </div>
                    {touched.phoneNumber && errors.phoneNumber ?
                      <p className="mt-1 text-xs font-medium text-red-600">{errors.phoneNumber}</p> :
                      null}
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-800">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <Field
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className={`w-full rounded-lg border bg-white py-2 pl-10 pr-10 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 ${touched.password && errors.password ?
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
                    {touched.password && errors.password ?
                      <p className="mt-1 text-xs font-medium text-red-600">{errors.password}</p> :
                      null}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1.5 block text-sm font-medium text-ink-800">

                      Confirm password
                    </label>
                    <div className="relative">
                      <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <Field
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className={`w-full rounded-lg border bg-white py-2 pl-10 pr-10 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 ${touched.confirmPassword && errors.confirmPassword ?
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
                    {isSubmitting ? 'Creating account…' : 'Create account'}
                  </Button>

                  <p className="text-center text-xs text-ink-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-buttons">Sign in</Link>
                  </p>
                </Form>
              }
            </Formik>
          </div>
        </motion.div>
      </div>
    </div>);

}
