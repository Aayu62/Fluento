import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('fluento_token')?.value;

    if (token) {
      // Call NestJS backend to invalidate
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/logout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
      }).catch(() => {
        // Ignore network errors on logout
      });
    }

    // Clear HTTP-Only cookies
    cookieStore.delete('fluento_token');
    cookieStore.delete('fluento_refresh');

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
