import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import MSWClientProvider from './_providers/msw-client';

export const metadata: Metadata = {
  title: 'Turnero Médico',
  description: 'Demo Front + Fake API (MSW)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <MSWClientProvider>
          <Navbar />
          <main className="container py-6">{children}</main>
        </MSWClientProvider>
      </body>
    </html>
  );
}
