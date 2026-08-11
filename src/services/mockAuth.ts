import * as seed from '../data/seed';
import type { AuthUser } from '../store/authStore';
import { uid } from '../utils/format';

const ADMIN_CREDENTIALS = { email: 'admin@rentachef.com', password: 'admin123' };
const CHEF_CREDENTIALS = { email: 'chef@rentachef.com', password: 'chef123' };
const USER_CREDENTIALS = { email: 'user@rentachef.com', password: 'user123' };

export interface LoginResult {
  user: AuthUser;
  token: string;
}

export function mockLogin(email: string, password: string): LoginResult {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    return {
      user: { id: 'admin_1', name: 'Alexis Dune', email: normalizedEmail, role: 'admin' },
      token: `admin.${uid('tok')}`
    };
  }

  if (normalizedEmail === CHEF_CREDENTIALS.email && password === CHEF_CREDENTIALS.password) {
    const demoChef = seed.chefs[0];
    return {
      user: { id: demoChef.id, name: demoChef.name, email: normalizedEmail, role: 'chef', avatar: demoChef.avatar },
      token: `chef.${uid('tok')}`
    };
  }

  if (normalizedEmail === USER_CREDENTIALS.email && password === USER_CREDENTIALS.password) {
    const demoClient = seed.users[0];
    return {
      user: { id: demoClient.id, name: demoClient.name, email: normalizedEmail, role: 'client' },
      token: `client.${uid('tok')}`
    };
  }

  const chef = seed.chefs.find((c) => c.email.toLowerCase() === normalizedEmail);
  if (chef) {
    if (chef.status !== 'approved') {
      throw new Error('Your chef account is not approved yet.');
    }
    return {
      user: { id: chef.id, name: chef.name, email: chef.email, role: 'chef', avatar: chef.avatar },
      token: `chef.${uid('tok')}`
    };
  }

  const client = seed.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (client) {
    if (client.status !== 'approved') {
      throw new Error('Your account is not approved yet.');
    }
    return {
      user: { id: client.id, name: client.name, email: client.email, role: 'client' },
      token: `client.${uid('tok')}`
    };
  }

  throw new Error('No account found for that email address.');
}
