import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

const IDLE_LIMIT_MS = 2 * 60 * 1000;
const WARNING_COUNTDOWN_S = 60;
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'wheel', 'touchstart'] as const;
const ACTIVITY_THROTTLE_MS = 1000;

export function IdleTimeoutGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_COUNTDOWN_S);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsLeftRef = useRef(WARNING_COUNTDOWN_S);
  const lastActivityResetRef = useRef(0);
  const warningOpenRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    idleTimerRef.current = null;
    countdownRef.current = null;
  }, []);

  const handleLogout = useCallback((reason: 'timeout' | 'manual') => {
    clearTimers();
    warningOpenRef.current = false;
    setWarningOpen(false);
    logout();
    navigate('/', { replace: true });
    toast[reason === 'timeout' ? 'info' : 'success'](
      reason === 'timeout' ?
      "You've been signed out due to inactivity." :
      'Signed out.'
    );
  }, [clearTimers, logout, navigate]);

  const startCountdown = useCallback(() => {
    secondsLeftRef.current = WARNING_COUNTDOWN_S;
    setSecondsLeft(WARNING_COUNTDOWN_S);
    warningOpenRef.current = true;
    setWarningOpen(true);

    countdownRef.current = setInterval(() => {
      secondsLeftRef.current -= 1;
      setSecondsLeft(secondsLeftRef.current);
      if (secondsLeftRef.current <= 0) {
        handleLogout('timeout');
      }
    }, 1000);
  }, [handleLogout]);

  const scheduleIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(startCountdown, IDLE_LIMIT_MS);
  }, [startCountdown]);

  // Once the countdown is showing, passive activity (a stray mousemove) no
  // longer dismisses it — the user must explicitly choose to stay signed in.
  const registerActivity = useCallback(() => {
    if (warningOpenRef.current) return;
    const now = Date.now();
    if (now - lastActivityResetRef.current < ACTIVITY_THROTTLE_MS) return;
    lastActivityResetRef.current = now;
    scheduleIdleTimer();
  }, [scheduleIdleTimer]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      warningOpenRef.current = false;
      setWarningOpen(false);
      return;
    }

    scheduleIdleTimer();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, registerActivity, { passive: true }));

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, registerActivity));
      clearTimers();
    };
  }, [isAuthenticated, registerActivity, scheduleIdleTimer, clearTimers]);

  const handleStaySignedIn = () => {
    warningOpenRef.current = false;
    setWarningOpen(false);
    scheduleIdleTimer();
  };

  if (!isAuthenticated) return null;

  return (
    <Modal open={warningOpen} onClose={handleStaySignedIn} title="Still there?" size="md">
      <div className="flex gap-4 px-6 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm leading-relaxed text-ink-600">
          You've been inactive for a while. For your security, you'll be signed out in{' '}
          <span className="font-semibold text-ink-900">{secondsLeft}s</span> unless you choose to
          stay signed in.
        </p>
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={() => handleLogout('manual')}>
          Log out now
        </Button>
        <Button onClick={handleStaySignedIn}>Stay signed in</Button>
      </ModalFooter>
    </Modal>);

}
