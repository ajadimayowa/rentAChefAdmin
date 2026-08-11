export type Status = 'active' | 'inactive';
export type ApprovalStatus = 'pending' | 'approved' | 'suspended' | 'rejected';
export type BookingStatus =
'pending' |
'confirmed' |
'in_progress' |
'completed' |
'cancelled';
export type ChefTier = 'Standard' | 'Premium' | 'Executive' | 'Signature';
export type AdminRole = 'admin' | 'super_admin';

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  status: Status;
  createdAt: string;
}

export interface TermsSection {
  id: string;
  title: string;
  body: string;
  required: boolean;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  basePrice: number;
  durationHours: number;
  minGuests: number;
  maxGuests: number;
  status: Status;
  terms: TermsSection[];
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: ApprovalStatus;
  bookings: number;
  lifetimeValue: number;
  joinedAt: string;
}

export interface Admin {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
}

export interface ChefLevelRef {
  id: string;
  name: string;
  description?: string;
}

export interface Chef {
  id: string;
  name: string;
  email: string;
  phone: string;
  state:  {
    stateId:string,
    stateName:string,
  };
  city: string;
  chefLevel: ChefLevelRef | null;
  specialties: string[];
  servicesOffered: string[];
  yearsOfExperience: number;
  rating: number;
  jobsCompleted: number;
  status: ApprovalStatus;
  avatar: string;
  bio: string;
  joinedAt: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

export interface MenuCourse {
  id: string;
  course: string;
  name: string;
  description: string;
}

export interface Menu {
  id: string;
  name: string;
  cuisine: string;
  serviceId: string;
  serves: number;
  pricePerHead: number;
  courses: MenuCourse[];
  groceries: GroceryItem[];
  status: Status;
  createdAt: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  serviceIds: string[];
  menuIds: string[];
  price: number;
  durationHours: number;
  guests: number;
  perks: string[];
  status: Status;
  createdAt: string;
}

export interface Charge {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  appliesTo: 'booking' | 'grocery' | 'chef_payout' | 'package';
  status: Status;
}

export interface ChefCategoryPrice {
  id: string;
  tier: ChefTier;
  serviceId: string;
  hourlyRate: number;
  minimumHours: number;
  weekendSurchargePct: number;
  travelFee: number;
  status: Status;
}

export interface Booking {
  id: string;
  reference: string;
  userId: string;
  chefId: string;
  serviceId: string;
  menuId: string | null;
  packageId: string | null;
  date: string;
  time: string;
  guests: number;
  address: string;
  status: BookingStatus;
  serviceAmount: number;
  groceries: GroceryItem[];
  notes: string;
  createdAt: string;
}