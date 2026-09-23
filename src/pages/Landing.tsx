import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LandingNav } from '../components/landing/LandingNav';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Experiences } from '../components/landing/Experiences';
import { ChefsShowcase } from '../components/landing/ChefsShowcase';
import { Testimonials } from '../components/landing/Testimonials';
import { CtaFooter } from '../components/landing/CtaFooter';

export function Landing() {
  const { hash } = useLocation();

  // Scroll to the section named in the URL hash (e.g. footer links to "/#meal-prep").
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <div className="w-full bg-white">
      <LandingNav />
      <main>
        <Hero />
        <HowItWorks />
        <Experiences />
        <ChefsShowcase />
        <Testimonials />
        <CtaFooter />
      </main>
    </div>);

}