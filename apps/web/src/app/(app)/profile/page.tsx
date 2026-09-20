'use client';

import { useAuthStore } from '@/lib/stores/auth.store';
import { User, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get('/users/me');
        if (mounted && data) {
          setProfileData(data);
        }
      } catch (err) {
        console.warn('Failed to load profile details', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { mounted = false; };
  }, []);

  const fullName = user?.fullName || profileData?.user?.fullName || 'User';
  const email = user?.email || profileData?.user?.email || 'Not logged in';
  const username = `@${fullName.toLowerCase().replace(/\s+/g, '')}`;

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-12">
        <header>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#17324D]/60">
            ACCOUNT
          </p>
          <h1 className="mt-1 font-serif text-4xl font-bold text-[#17324D]">
            Profile
          </h1>
        </header>

        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#17324D] shadow-[0_8px_30px_rgb(196,98,59,0.2)]">
            <span className="text-5xl font-bold text-[#F7F3EB]">
              {fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#17324D]">{fullName}</h2>
            <p className="font-mono text-lg text-[#17324D]/60">{username}</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDF8F5]">
              <User size={24} className="text-[#C4623B]" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">
                Full Name
              </p>
              <p className="mt-1 text-lg font-semibold text-[#17324D]">{fullName}</p>
            </div>
          </div>

          <div className="my-6 ml-20 h-px bg-[#F3F4F6]" />

          <div className="flex items-center gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDF8F5]">
              <Mail size={24} className="text-[#C4623B]" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">
                Email Address
              </p>
              <p className="mt-1 text-lg font-semibold text-[#17324D]">{email}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
