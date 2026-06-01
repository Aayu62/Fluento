'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !token) {
      router.replace('/login');
    }
  }, [isAuthenticated, token, router]);

  if (!isAuthenticated && !token) return null;

  return (
    <div className="relative min-h-screen bg-paper">
      {/* DESIGN.md §8 — notebook grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(#D8D0C0 1px, transparent 1px), linear-gradient(90deg, #D8D0C0 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.15,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
