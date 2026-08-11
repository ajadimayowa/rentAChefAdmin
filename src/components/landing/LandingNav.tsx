import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const links = [
{ href: '#experiences', label: 'Experiences' },
{ href: '#how', label: 'How it works' },
{ href: '#chefs', label: 'Our chefs' },
{ href: '#stories', label: 'Stories' }];


export function LandingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-light text-ink-950">
            <img src="/rentAChefIconTrans.png" alt="RentAChef" className="h-5 w-5 object-contain" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight text-white">
            Rent a Chef
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((l) =>
          <a
            key={l.href}
            href={l.href}
            className="text-sm text-ink-300 transition-colors hover:text-white">
            
              {l.label}
            </a>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-sm text-ink-300 transition-colors hover:text-white">

            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5">

            Create account
          </Link>
          <a
            href="#book"
            className="rounded-lg bg-buttons px-4 py-2.5 text-sm font-medium text-ink-950 transition-colors hover:bg-amber-400">

            Book a chef
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-white md:hidden">
          
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ?
      <div className="border-t border-white/10 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((l) =>
          <a
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 text-sm text-ink-300 hover:bg-white/5 hover:text-white">
            
                {l.label}
              </a>
          )}
            <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-sm text-ink-300 hover:bg-white/5 hover:text-white">

              Sign in
            </Link>
            <Link
            to="/signup"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 text-sm text-ink-300 hover:bg-white/5 hover:text-white">

              Create account
            </Link>
            <a
            href="#book"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-lg bg-buttons px-4 py-2.5 text-center text-sm font-medium text-ink-950">
            
              Book a chef
            </a>
          </nav>
        </div> :
      null}
    </header>);

}