'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { LoginSchema, type LoginDto } from '@fluento/shared';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({ resolver: zodResolver(LoginSchema) });

  const { mutate, isPending, error } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(
        {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName,
          createdAt: '',
          updatedAt: '',
        },
        data.accessToken,
      );
      localStorage.setItem('fluento_token', data.accessToken);
      localStorage.setItem('fluento_refresh', data.refreshToken);
      router.push('/journal');
    },
  });

  const serverError =
    error instanceof Error ? error.message : error ? 'Login failed. Please try again.' : null;

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 text-center">
        <p className="text-metadata mb-3 text-navy/50">COMMUNICATION TRAINING</p>
        <h1 className="font-serif text-4xl font-bold text-navy">Fluento</h1>
        <p className="mt-3 font-mono text-sm text-navy/60">Sign in to continue your practice</p>
      </div>

      <div className="rounded-card border border-border bg-paper p-8 shadow-card">
        <p className="text-metadata mb-6 text-navy/50">SIGN IN</p>

        {serverError && (
          <div className="mb-6 rounded-card border border-error/30 bg-error/5 px-4 py-3">
            <p className="font-mono text-sm text-error">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href={{ pathname: '/forgot-password' }}
                className="font-mono text-xs text-navy/50 underline-offset-2 hover:text-accent hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button type="submit" loading={isPending} className="mt-2 w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-mono text-sm text-navy/60">
            Don&apos;t have an account?{' '}
            <Link href={{ pathname: '/register' }} className="text-accent underline-offset-2 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
