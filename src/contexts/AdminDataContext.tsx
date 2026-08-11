import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as seed from '../data/seed';
import type {
  AppUser,
  ApprovalStatus,
  Booking,
  BookingStatus,
  Charge,
  Chef,
  ChefCategoryPrice,
  Menu,
  Package,
  Service,
  ServiceCategory } from
'../types';
import { groceryTotal, uid } from '../utils/format';

export interface BookingTotals {
  service: number;
  grocery: number;
  groceryFee: number;
  platformFee: number;
  extras: number;
  total: number;
}

interface AdminDataValue {
  categories: ServiceCategory[];
  services: Service[];
  users: AppUser[];
  chefs: Chef[];
  menus: Menu[];
  packages: Package[];
  charges: Charge[];
  chefPrices: ChefCategoryPrice[];
  bookings: Booking[];
  saveCategory: (value: ServiceCategory) => void;
  removeCategory: (id: string) => void;
  saveService: (value: Service) => void;
  removeService: (id: string) => void;
  saveUser: (value: AppUser) => void;
  removeUser: (id: string) => void;
  setUserStatus: (id: string, status: ApprovalStatus) => void;
  saveChef: (value: Chef) => void;
  removeChef: (id: string) => void;
  setChefStatus: (id: string, status: ApprovalStatus) => void;
  saveMenu: (value: Menu) => void;
  removeMenu: (id: string) => void;
  savePackage: (value: Package) => void;
  removePackage: (id: string) => void;
  saveCharge: (value: Charge) => void;
  removeCharge: (id: string) => void;
  saveChefPrice: (value: ChefCategoryPrice) => void;
  removeChefPrice: (id: string) => void;
  saveBooking: (value: Booking) => void;
  removeBooking: (id: string) => void;
  setBookingStatus: (id: string, status: BookingStatus) => void;
  calcBookingTotals: (booking: Booking) => BookingTotals;
  lookup: {
    userName: (id: string) => string;
    chefName: (id: string) => string;
    serviceName: (id: string) => string;
    categoryName: (id: string) => string;
    menuName: (id: string | null) => string;
    packageName: (id: string | null) => string;
  };
}

const AdminDataContext = createContext<AdminDataValue | null>(null);

function upsert<T extends {id: string;}>(list: T[], value: T): T[] {
  const exists = list.some((item) => item.id === value.id);
  return exists ? list.map((item) => item.id === value.id ? value : item) : [value, ...list];
}

export function AdminDataProvider({ children }: {children: React.ReactNode;}) {
  const [categories, setCategories] = useState<ServiceCategory[]>(seed.serviceCategories);
  const [services, setServices] = useState<Service[]>(seed.services);
  const [users, setUsers] = useState<AppUser[]>(seed.users);
  const [chefs, setChefs] = useState<Chef[]>(seed.chefs);
  const [menus, setMenus] = useState<Menu[]>(seed.menus);
  const [packages, setPackages] = useState<Package[]>(seed.packages);
  const [charges, setCharges] = useState<Charge[]>(seed.charges);
  const [chefPrices, setChefPrices] = useState<ChefCategoryPrice[]>(seed.chefCategoryPrices);
  const [bookings, setBookings] = useState<Booking[]>(seed.bookings);

  function makeSaver<T extends {id: string;}>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  list: T[],
  label: string)
  {
    return (value: T) => {
      const isNew = !list.some((item) => item.id === value.id);
      setter((prev) => upsert(prev, value));
      toast.success(isNew ? `${label} created` : `${label} updated`);
    };
  }

  const calcBookingTotals = useCallback(
    (booking: Booking): BookingTotals => {
      const service = booking.serviceAmount;
      const grocery = groceryTotal(booking.groceries);
      const active = charges.filter((c) => c.status === 'active');
      const apply = (base: number, scope: Charge['appliesTo']) =>
      active.
      filter((c) => c.appliesTo === scope).
      reduce((sum, c) => sum + (c.type === 'percentage' ? base * c.value / 100 : c.value), 0);
      const groceryFee = active.
      filter((c) => c.appliesTo === 'grocery').
      reduce(
        (sum, c) => sum + (c.type === 'percentage' ? grocery * c.value / 100 : c.value),
        0
      );
      const bookingCharges = apply(service, 'booking');
      const platformFee = active.
      filter((c) => c.appliesTo === 'booking' && c.type === 'percentage').
      reduce((sum, c) => sum + service * c.value / 100, 0);
      const extras = bookingCharges - platformFee;
      return {
        service,
        grocery,
        groceryFee,
        platformFee,
        extras,
        total: service + grocery + groceryFee + platformFee + extras
      };
    },
    [charges]
  );

  const lookup = useMemo(
    () => ({
      userName: (id: string) => users.find((u) => u.id === id)?.name ?? 'Unassigned',
      chefName: (id: string) => chefs.find((c) => c.id === id)?.name ?? 'Unassigned',
      serviceName: (id: string) => services.find((s) => s.id === id)?.name ?? '—',
      categoryName: (id: string) => categories.find((c) => c.id === id)?.name ?? '—',
      menuName: (id: string | null) => id ? menus.find((m) => m.id === id)?.name ?? '—' : '—',
      packageName: (id: string | null) =>
      id ? packages.find((p) => p.id === id)?.name ?? '—' : '—'
    }),
    [users, chefs, services, categories, menus, packages]
  );

  const value: AdminDataValue = {
    categories,
    services,
    users,
    chefs,
    menus,
    packages,
    charges,
    chefPrices,
    bookings,
    saveCategory: makeSaver(setCategories, categories, 'Category'),
    removeCategory: (id) => {
      setCategories((prev) => prev.filter((i) => i.id !== id));
      toast.success('Category deleted');
    },
    saveService: makeSaver(setServices, services, 'Service'),
    removeService: (id) => {
      setServices((prev) => prev.filter((i) => i.id !== id));
      toast.success('Service deleted');
    },
    saveUser: makeSaver(setUsers, users, 'User'),
    removeUser: (id) => {
      setUsers((prev) => prev.filter((i) => i.id !== id));
      toast.success('User removed');
    },
    setUserStatus: (id, status) => {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
      toast.success(`User ${status}`);
    },
    saveChef: makeSaver(setChefs, chefs, 'Chef'),
    removeChef: (id) => {
      setChefs((prev) => prev.filter((i) => i.id !== id));
      toast.success('Chef removed');
    },
    setChefStatus: (id, status) => {
      setChefs((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
      toast.success(`Chef ${status}`);
    },
    saveMenu: makeSaver(setMenus, menus, 'Menu'),
    removeMenu: (id) => {
      setMenus((prev) => prev.filter((i) => i.id !== id));
      toast.success('Menu deleted');
    },
    savePackage: makeSaver(setPackages, packages, 'Package'),
    removePackage: (id) => {
      setPackages((prev) => prev.filter((i) => i.id !== id));
      toast.success('Package deleted');
    },
    saveCharge: makeSaver(setCharges, charges, 'Charge'),
    removeCharge: (id) => {
      setCharges((prev) => prev.filter((i) => i.id !== id));
      toast.success('Charge deleted');
    },
    saveChefPrice: makeSaver(setChefPrices, chefPrices, 'Pricing rule'),
    removeChefPrice: (id) => {
      setChefPrices((prev) => prev.filter((i) => i.id !== id));
      toast.success('Pricing rule deleted');
    },
    saveBooking: makeSaver(setBookings, bookings, 'Booking'),
    removeBooking: (id) => {
      setBookings((prev) => prev.filter((i) => i.id !== id));
      toast.success('Booking deleted');
    },
    setBookingStatus: (id, status) => {
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      toast.success('Booking status updated');
    },
    calcBookingTotals,
    lookup
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData(): AdminDataValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within an AdminDataProvider');
  return ctx;
}

export { uid };