'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { NavigationHeader } from '@/components/layout/navigation-header';
import { IncomingCallModal } from '@/components/calls/incoming-call-modal';
import type { User } from '@fluento/shared';

export default function AppLayoutClient({ children, user }: { children: React.ReactNode; user: User | null }) {
  const { setAuth, isAuthenticated } = useAuthStore();
  const initialized = useRef(false);

  if (!initialized.current && user) {
    setAuth(user, '');
    initialized.current = true;
  }

  useEffect(() => {
    if (user && !isAuthenticated) {
      setAuth(user, '');
    }
  }, [user, isAuthenticated, setAuth]);

  return (
    <div className="relative min-h-screen bg-paper">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(#D8D0C0 1px, transparent 1px), linear-gradient(90deg, #D8D0C0 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.15,
        }}
      />
      <div className="relative z-10">
        <NavigationHeader />
        <IncomingCallModal />
        {children}
      </div>
    </div>
  );
}
