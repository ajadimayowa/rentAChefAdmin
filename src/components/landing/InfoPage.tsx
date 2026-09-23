import React, { useEffect } from 'react';
import { LandingNav } from './LandingNav';
import { SiteFooter } from './SiteFooter';

export function InfoPage({
  eyebrow,
  title,
  intro,
  children





}: {eyebrow: string;title: string;intro?: React.ReactNode;children: React.ReactNode;}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="w-full bg-ink-50">
      <LandingNav />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-sm font-medium text-buttons">{eyebrow}</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
          {title}
        </h1>
        {intro &&
        <div className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500">{intro}</div>
        }
        <div className="mt-10">{children}</div>
      </main>
      <SiteFooter />
    </div>);

}

export function InfoCard({ children, className = '' }: {children: React.ReactNode;className?: string;}) {
  return (
    <div className={`rounded-2xl border border-ink-200 bg-white p-6 shadow-card sm:p-8 ${className}`}>
      {children}
    </div>);

}

export function InfoSection({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <section>
      <h2 className="font-heading text-base font-semibold text-ink-950">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink-600">{children}</div>
    </section>);

}

export function MailLink({ email, children }: {email: string;children?: React.ReactNode;}) {
  return (
    <a href={`mailto:${email}`} className="font-medium text-buttons hover:underline">
      {children ?? email}
    </a>);

}
