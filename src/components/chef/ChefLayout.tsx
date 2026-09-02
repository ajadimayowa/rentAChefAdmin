import {
  Bell,
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  User,
  UtensilsCrossed,
  X } from
'lucide-react';
import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
{ to: '/chef', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
{ to: '/chef/bookings', label: 'My Bookings', icon: <CalendarCheck className="h-4 w-4" /> },
{ to: '/chef/menus', label: 'My Menus', icon: <UtensilsCrossed className="h-4 w-4" /> },
{ to: '/chef/profile', label: 'My Profile', icon: <User className="h-4 w-4" /> }];


function SidebarContent({ onNavigate }: {onNavigate?: () => void;}) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col bg-ink-950 text-ink-300">
      <Link
        to="/chef"
        className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5"
        onClick={onNavigate}>

        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-light text-ink-950">
          <img src="/rentAChefIconTrans.png" alt="RentAChef" className="h-5 w-5 object-contain" />
        </span>
        <span>
          <span className="block font-heading text-[15px] font-semibold leading-tight text-white">
            Rent a Chef
          </span>
          <span className="block text-[11px] uppercase tracking-[0.18em] text-buttons">
            Chef Portal
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-5" aria-label="Chef">
        {navItems.map((item) =>
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/chef'}
          onClick={onNavigate}
          className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive ?
          'bg-buttons text-ink-950 font-medium' :
          'text-ink-300 hover:bg-white/5 hover:text-white'}`
          }>

            {item.icon}
            {item.label}
          </NavLink>
        )}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-heading text-sm font-semibold text-white">
            {user?.name.slice(0, 2).toUpperCase() ?? 'CH'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name ?? 'Chef'}</p>
            <p className="truncate text-xs text-ink-400">{user?.email}</p>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => {
              logout();
              navigate('/', { replace: true });
            }}
            className="rounded-lg p-2 text-ink-400 hover:bg-white/5 hover:text-white">

            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>);

}

export function ChefLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const current = navItems.find((i) => i.to === location.pathname)?.label ?? 'Dashboard';

  return (
    <div className="flex min-h-screen w-full bg-ink-50">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <SidebarContent />
        </div>
      </aside>

      {open ?
      <div className="fixed inset-0 z-40 lg:hidden">
          <div
          className="absolute inset-0 bg-ink-950/60"
          onClick={() => setOpen(false)}
          aria-hidden="true" />

          <div className="absolute inset-y-0 left-0 w-72">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div> :
      null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
            className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden">

            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-400">Chef</p>
            <p className="truncate font-heading text-sm font-semibold text-ink-950">{current}</p>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-ink-600 hover:bg-ink-100">

            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-buttons" />
          </button>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>);

}
