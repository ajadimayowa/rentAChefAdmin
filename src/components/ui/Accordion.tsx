import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenIds?: string[];
}

/** A list of independently expandable/collapsible entries — each item toggles on
 * its own, any number can be open at once. Used for long-form policy/FAQ content
 * where a reader wants to scan titles and open only what's relevant. */
export function Accordion({ items, defaultOpenIds = [] }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpenIds));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);else next.add(id);
      return next;
    });
  };

  return (
    <div className="divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-white shadow-card">
      {items.map((item) => {
        const open = openIds.has(item.id);
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-ink-50/60 sm:px-6">

              <span className="font-heading text-sm font-semibold text-ink-950 sm:text-base">
                {item.title}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200 ${
                open ? 'rotate-180' : ''}`
                } />

            </button>
            <AnimatePresence initial={false}>
              {open ?
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden">

                  <div className="px-5 pb-5 text-sm leading-relaxed text-ink-600 sm:px-6">
                    {item.content}
                  </div>
                </motion.div> :
              null}
            </AnimatePresence>
          </div>);

      })}
    </div>);

}
