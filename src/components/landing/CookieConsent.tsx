import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'rac_cookie_consent';

export type CookieConsentChoice = 'all' | 'essential';

/** The visitor's stored choice, or null if they haven't chosen yet. Check this before loading any non-essential tracking. */
export function getCookieConsent(): CookieConsentChoice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'all' || value === 'essential' ? value : null;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Short delay so the banner doesn't compete with the hero animation.
    const t = window.setTimeout(() => setVisible(getCookieConsent() === null), 800);
    return () => window.clearTimeout(t);
  }, []);

  const choose = (choice: CookieConsentChoice) => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Storage unavailable (private mode etc.) — just hide for this visit.
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible &&
      <motion.div
        role="dialog"
        aria-live="polite"
        aria-label="Cookie and privacy consent"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-ink-200 bg-white p-5 shadow-2xl sm:inset-x-6 sm:bottom-6 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex flex-1 gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <Cookie className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-sm font-semibold text-ink-950">We value your privacy</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">
                  We use cookies to keep you signed in, remember your preferences and understand how
                  our site is used. By clicking “Accept all”, you agree to our use of cookies and our{' '}
                  <Link to="/privacy-policy#cookies" className="font-medium text-buttons hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2 sm:flex-col">
              <button
              type="button"
              onClick={() => choose('all')}
              className="flex-1 rounded-lg bg-buttons px-4 py-2.5 text-sm font-medium text-ink-950 transition-colors hover:bg-amber-400">
                Accept all
              </button>
              <button
              type="button"
              onClick={() => choose('essential')}
              className="flex-1 rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-50">
                Essential only
              </button>
            </div>
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}
