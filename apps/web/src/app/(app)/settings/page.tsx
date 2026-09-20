'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { authApi } from '@/lib/api/auth.api';

export default function SettingsPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get('/users/me');
        if (mounted && data) {
          setEmail(data.user?.email || '');
          setFullName(data.user?.fullName || '');
          // If we had notificationPrefs returned in profile, we'd set them here
          // For now, assuming default true/false
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { mounted = false; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      await apiClient.patch('/users/me', {
        fullName,
        notificationPrefs: { pushEnabled, emailEnabled },
      });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } catch {}
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8 flex items-center justify-center">
        <p className="font-mono text-sm text-[#17324D]/50">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl flex flex-col gap-6">
        <header className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs">
          <h1 className="font-serif text-3xl font-bold text-[#17324D]">Settings</h1>
          <p className="mt-2 font-mono text-sm text-[#17324D]/70">Manage your profile and preferences.</p>
        </header>

        <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="rounded-xl border border-[#D8D0C0] bg-[#F7F3EB]/50 px-4 py-3 font-mono text-sm text-[#17324D]/50"
              />
              <p className="font-mono text-[10px] text-[#17324D]/40">Email cannot be changed directly.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-xl border border-[#D8D0C0] bg-white px-4 py-3 font-mono text-sm text-[#17324D] focus:border-[#C4623B] focus:outline-none focus:ring-1 focus:ring-[#C4623B]"
              />
            </div>
            
            <hr className="border-[#D8D0C0]/50" />
            
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60 mb-4">Notifications</h3>
              
              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={(e) => setPushEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-[#D8D0C0] text-[#5D8A6A] focus:ring-[#5D8A6A]"
                />
                <span className="font-mono text-sm text-[#17324D]">Push Notifications</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-[#D8D0C0] text-[#5D8A6A] focus:ring-[#5D8A6A]"
                />
                <span className="font-mono text-sm text-[#17324D]">Email Notifications</span>
              </label>
            </div>

            {message && (
              <div className={`rounded-xl p-4 text-sm font-mono ${message.includes('success') ? 'bg-[#5D8A6A]/10 text-[#5D8A6A]' : 'bg-[#B85450]/10 text-[#B85450]'}`}>
                {message}
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B85450] hover:underline"
              >
                Sign Out
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#C4623B] px-8 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
