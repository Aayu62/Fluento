'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api/client';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-card border border-border bg-paper p-8 shadow-card">
          <h2 className="mb-2 font-serif text-2xl font-bold text-navy text-center">Check your email</h2>
          <p className="mb-6 font-mono text-sm text-navy/60 text-center">
            We have sent a password reset link to {email}.
          </p>
          <Link href="/login" className="block w-full">
            <Button className="w-full">Return to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-card border border-border bg-paper p-8 shadow-card">
        <h2 className="mb-2 font-serif text-2xl font-bold text-navy text-center">Forgot Password</h2>
        <p className="mb-6 font-mono text-sm text-navy/60 text-center">
          Enter your email to receive a password reset link
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          {error && (
            <div className="mb-6 rounded-card border border-error/30 bg-error/5 px-4 py-3">
              <p className="font-mono text-sm text-error">{error}</p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Reset Link
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="font-mono text-sm text-navy/60">
            Remember your password?{' '}
            <Link href="/login" className="font-bold text-navy hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
