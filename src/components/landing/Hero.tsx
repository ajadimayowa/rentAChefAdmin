import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 }
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-950 pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div
        aria-hidden="true"
        className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-buttons/10 blur-3xl" />
      
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.08 }}>
          <motion.span
            variants={fade}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-buttons">
            
            Private chefs, on demand
          </motion.span>

          <motion.h1
            variants={fade}
            className="mt-6 font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl">
            
            Restaurant-grade dining,
            <span className="block text-buttons">cooked in your kitchen.</span>
          </motion.h1>

          <motion.p variants={fade} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
            Book vetted professional chefs for tasting menus, dinner parties, weddings and weekly
            meal prep. Groceries sourced, courses plated, kitchen left spotless.
          </motion.p>

          <motion.div variants={fade} id="book" className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#experiences"
              className="inline-flex items-center gap-2 rounded-lg bg-buttons px-6 py-3.5 text-[15px] font-medium text-ink-950 transition-colors hover:bg-amber-400">
              
              Find your chef
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-white/5">
              
              How it works
            </a>
          </motion.div>

          <motion.dl
            variants={fade}
            className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
            
            {[
            { value: '1,200+', label: 'Dinners served' },
            { value: '180', label: 'Vetted chefs' },
            { value: '4.9', label: 'Average rating' }].
            map((stat) =>
            <div key={stat.label}>
                <dt className="font-heading text-2xl font-semibold text-white">{stat.value}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wide text-ink-400">{stat.label}</dd>
              </div>
            )}
          </motion.dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative">
          
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <img
              src="/landingpageimg.jpg"
              alt="A private chef plating a gourmet dish on a marble kitchen island"
              className="h-full w-full object-cover" />
            
          </div>

          <div className="absolute -bottom-6 -left-4 hidden w-64 rounded-xl border border-white/10 bg-ink-900/95 p-4 backdrop-blur sm:block">
            <div className="flex items-center gap-1 text-buttons">
              {Array.from({ length: 5 }).map((_, i) =>
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
              )}
            </div>
            <p className="mt-2 text-sm leading-snug text-ink-200">
              “Six courses, zero cleanup. It felt like a Michelin room in our dining room.”
            </p>
            <p className="mt-2 text-xs text-ink-400">Sofia M. · Miami</p>
          </div>
        </motion.div>
      </div>
    </section>);

}