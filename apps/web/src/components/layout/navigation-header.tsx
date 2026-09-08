'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';

export function NavigationHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const links = [
    { href: '/journal', label: 'Journal' },
    { href: '/calls', label: 'Voice Calls' },
    { href: '/practice/image-study', label: 'Image Studies' },
    { href: '/practice/thought-exercise', label: 'Thought Exercises' },
  ];

  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-[#D8D0C0] bg-[#F7F3EB]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-8">
          <Link href="/journal" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#17324D]">
              Fluento
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href as any}
                  className={`rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-[#17324D] font-semibold text-white'
                      : 'text-[#17324D]/80 hover:bg-[#F2EBDD] hover:text-[#17324D]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden font-mono text-xs text-[#17324D]/70 sm:inline-block">
              {user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-full border border-[#D8D0C0] px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-[#17324D] transition-colors hover:border-[#17324D] hover:bg-[#17324D] hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
