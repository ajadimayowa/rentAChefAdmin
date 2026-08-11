import { Field, Formik, Form } from 'formik';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Star } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { Button } from '../components/ui/Button';
import { ApiError } from '../config/api';
import { requestLoginOtp, verifyLoginOtp, type BackendUserType } from '../services/auth';
import { roleHome, useAuthStore, type UserRole } from '../store/authStore';

interface CredentialsValues {
  email: string;
  password: string;
}

interface OtpValues {
  otp: string;
}

const credentialsInitialValues: CredentialsValues = { email: '', password: '' };
const otpInitialValues: OtpValues = { otp: '' };

const credentialsSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().required('Password is required')
});

const otpSchema = Yup.object({
  otp: Yup.string().required('Enter the code we sent you').min(4, 'Enter the full code')
});

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 }
};

// Every user type signs in through the same form/endpoint; this just maps the
// backend's userType onto the frontend's role-based routing.
const roleForUserType: Record<BackendUserType, UserRole> = {
  Customer: 'client',
  Chef: 'chef',
  Admin: 'admin'
};

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

export function Login() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resending, setResending] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname;

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-light/10 blur-3xl" />

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

            Restaurant-grade dining,
            <span className="block text-buttons">cooked in your kitchen.</span>
          </motion.h2>
          <motion.p variants={fade} className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">
            Sign in to manage bookings, menus and clients — or find the chef for your next
            occasion.
          </motion.p>

          <motion.div
            variants={fade}
            className="mt-8 w-full max-w-sm rounded-xl border border-white/10 bg-ink-900/80 p-4 backdrop-blur">

            <div className="flex items-center gap-1 text-buttons">
              {Array.from({ length: 5 }).map((_, i) =>
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
              )}
            </div>
            <p className="mt-2 text-sm leading-snug text-ink-200">
              “Six courses, zero cleanup. It felt like a Michelin room in our dining room.”
            </p>
            <p className="mt-2 text-xs text-ink-400">Sofia M. · Miami</p>
          </motion.div>
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
            {step === 'credentials' ?
            <>
                <h1 className="font-heading text-2xl font-semibold text-ink-950">Welcome back</h1>
                <p className="mt-1.5 text-sm text-ink-500">
                  Login in with your registered email address.
                </p>

                <Formik
                key="credentials"
                initialValues={credentialsInitialValues}
                validationSchema={credentialsSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  setFormError(null);
                  try {
                    await requestLoginOtp(values.email, values.password);
                    setEmail(values.email);
                    setPassword(values.password);
                    setStep('otp');
                    toast.success('We sent a login code to your email.');
                  } catch (err) {
                    setFormError(errorMessage(err, 'Unable to sign in.'));
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
                        <label
                      htmlFor="password"
                      className="mb-1.5 block text-sm font-medium text-ink-800">

                          Password
                        </label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                          <Field
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`w-full rounded-lg border bg-white py-2 pl-10 pr-10 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 ${
                        touched.password && errors.password ?
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

                      {formError ?
                  <p className="text-sm font-medium text-red-600">{formError}</p> :
                  null}

                      <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                        {isSubmitting ? 'Sending code…' : 'Continue'}
                      </Button>
                    </Form>
                }
                </Formik>
              </> :

            <>
                <h1 className="font-heading text-2xl font-semibold text-ink-950">Enter your code</h1>
                <p className="mt-1.5 text-sm text-ink-500">
                  We sent a login code to <span className="font-medium text-ink-800">{email}</span>.
                </p>

                <Formik
                key="otp"
                initialValues={otpInitialValues}
                validationSchema={otpSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  setFormError(null);
                  try {
                    const res = await verifyLoginOtp(email, values.otp);
                    const user = {
                      id: res.payload.id,
                      name: res.payload.fullName,
                      email: res.payload.email,
                      role: roleForUserType[res.payload.userType]
                    };
                    login(user, res.token);
                    toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
                    navigate(from ?? roleHome(user.role), { replace: true });
                  } catch (err) {
                    console.log({seeLoginErrro:err});
                    setFormError(errorMessage(err, 'Invalid or expired code.'));
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

                      {formError ?
                  <p className="text-sm font-medium text-red-600">{formError}</p> :
                  null}

                      <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                        {isSubmitting ? 'Verifying…' : 'Verify & sign in'}
                      </Button>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <button
                      type="button"
                      onClick={() => {
                        setStep('credentials');
                        setFormError(null);
                      }}
                      className="font-medium text-ink-500 transition-colors hover:text-ink-800">

                          ← Use a different account
                        </button>
                        <button
                      type="button"
                      disabled={resending}
                      onClick={async () => {
                        setResending(true);
                        try {
                          await requestLoginOtp(email, password);
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
      </div>
    </div>);

}
