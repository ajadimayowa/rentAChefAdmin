import React from 'react';
import { LandingNav } from '../components/landing/LandingNav';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Experiences } from '../components/landing/Experiences';
import { ChefsShowcase } from '../components/landing/ChefsShowcase';
import { Testimonials } from '../components/landing/Testimonials';
import { CtaFooter } from '../components/landing/CtaFooter';

export function Landing() {
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