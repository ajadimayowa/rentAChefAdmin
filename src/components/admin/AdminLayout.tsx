import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarCheck,
  ChefHat,
  ClipboardList,
  Coins,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu as MenuIcon,
  Package as PackageIcon,
  ScrollText,
  ShieldCheck,
  Tags,
  Users,
  UtensilsCrossed,
  X } from
'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navGroups: {title: string;items: NavItem[];}[] = [
{
  title: 'Overview',
  items: [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/admin/bookings', label: 'Bookings', icon: <CalendarCheck className="h-4 w-4" /> }]

},
{
  title: 'Catalogue',
  items: [
  { to: '/admin/services', label: 'Services', icon: <UtensilsCrossed className="h-4 w-4" /> },
  { to: '/admin/categories', label: 'Service Categories', icon: <Tags className="h-4 w-4" /> },
  { to: '/admin/menus', label: 'Menus & Groceries', icon: <ClipboardList className="h-4 w-4" /> },
  { to: '/admin/packages', label: 'Packages', icon: <PackageIcon className="h-4 w-4" /> }]

},
{
  title: 'People',
  items: [
  { to: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { to: '/admin/chefs', label: 'Chefs', icon: <ChefHat className="h-4 w-4" /> },
  { to: '/admin/admins', label: 'Admins', icon: <ShieldCheck className="h-4 w-4" /> }]

},
{
  title: 'Commerce',
  items: [
  { to: '/admin/charges', label: 'Charges & Pricing', icon: <Coins className="h-4 w-4" /> },
  { to: '/admin/chef-pricing', label: 'Chef Tier Pricing', icon: <Layers className="h-4 w-4" /> },
  { to: '/admin/terms', label: 'Terms & Conditions', icon: <ScrollText className="h-4 w-4" /> }]

}];


function SidebarContent({ onNavigate }: {onNavigate?: () => void;}) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col bg-ink-950 text-ink-300">
      <Link
        to="/"
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
            Admin Portal
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Admin">
        {navGroups.map((group) =>
        <div key={group.title}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) =>
            <li key={item.to}>
                  <NavLink
                to={item.to}
                end={item.to === '/admin'}
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
                </li>
            )}
            </ul>
          </div>
        )}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-heading text-sm font-semibold text-white">
            {user?.name.slice(0, 2).toUpperCase() ?? 'AD'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name ?? 'Admin'}</p>
            <p className="truncate text-xs text-ink-400">{user?.email ?? 'Operations Admin'}</p>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="rounded-lg p-2 text-ink-400 hover:bg-white/5 hover:text-white">

            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>);

}

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const current =
  navGroups.flatMap((g) => g.items).find((i) => i.to === location.pathname)?.label ?? 'Dashboard';

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
            <p className="text-xs text-ink-400">Admin</p>
            <p className="truncate font-heading text-sm font-semibold text-ink-950">{current}</p>
          </div>
          <Link
            to="/"
            className="hidden rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-ink-50 sm:block">
            
            View site
          </Link>
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