import { api, setToken } from '../config/api';

export interface RegisterPayload {
  id: string;
  email: string;
  fullName: string;
  userType: 'Customer';
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  payload: RegisterPayload;
}

export interface ClientSignupInput {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

/** Client/customer signup. On success the backend emails (and texts) an OTP —
 * route the user to /verify-email to complete the flow. */
export function registerClient(input: ClientSignupInput): Promise<RegisterResponse> {
  return api.post<RegisterResponse>('/auth/register', input);
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export function verifyEmail(email: string, otp: string): Promise<MessageResponse> {
  return api.post<MessageResponse>('/auth/verify-email', { email, otp });
}

export interface RequestLoginOtpResponse {
  success: boolean;
  message: string;
  payload: {
    email: string;
    expiresAt: string;
  };
}

/** Step 1 of the single login flow shared by every user type: password → OTP sent. */
export function requestLoginOtp(email: string, password: string): Promise<RequestLoginOtpResponse> {
  return api.post<RequestLoginOtpResponse>('/auth/login', { email, password });
}

export type BackendUserType = 'Customer' | 'Chef' | 'Admin';

/** Shape of `payload` on a successful /auth/verify-loginOtp response — fields beyond
 * `userType` vary by type (e.g. `role` for Admin, `staffId` for Chef). */
export interface UnifiedAuthPayload {
  id: string;
  email: string;
  fullName: string;
  userType: BackendUserType;
  role?: string;
  staffId?: string;
  isPasswordUpdated?: boolean;
  formattedCategories?: { label: string; value: string }[];
  formattedServices?: { name: string; id: string }[];
}

export interface VerifyLoginOtpResponse {
  success: boolean;
  message: string;
  token: string;
  payload: UnifiedAuthPayload;
}

/** Step 2: OTP → token. The token carries `userType` so route guards can branch on it. */
export async function verifyLoginOtp(email: string, otp: string): Promise<VerifyLoginOtpResponse> {
  const res = await api.post<VerifyLoginOtpResponse>('/auth/verify-loginOtp', { email, otp });
  setToken(res.token);
  return res;
}

export function requestPasswordChangeOtp(email: string): Promise<MessageResponse> {
  return api.post<MessageResponse>('/auth/request-password-reset-otp', { email });
}

export function resendPasswordChangeOtp(email: string): Promise<{ message: string }> {
  return api.post<{ message: string }>('/auth/resend-password-reset-otp', { email });
}

export function changePasswordWithOtp(
email: string,
otp: string,
newPassword: string)
: Promise<MessageResponse> {
  return api.post<MessageResponse>('/auth/reset-password-with-otp', { email, otp, newPassword });
}

export function whoami<T = unknown>(): Promise<{ user: T }> {
  return api.get<{ user: T }>('/auth/me');
}

export function logout(): void {
  setToken(null);
}
