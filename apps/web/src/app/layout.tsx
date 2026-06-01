import type { Metadata } from 'next';
import { Providers } from '@/lib/providers/query-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Fluento — Communication Training',
  description: 'Practice real conversations. Build real confidence.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
