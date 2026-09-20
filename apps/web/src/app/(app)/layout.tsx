import { cookies } from 'next/headers';
import AppLayoutClient from './layout.client';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('fluento_token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) {
      redirect('/login');
    }

    const data = await res.json();
    return <AppLayoutClient user={data.user}>{children}</AppLayoutClient>;
  } catch (err) {
    redirect('/login');
  }
}

