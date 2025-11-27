import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Turnero Médico',
  description: 'Turnero m\u00e9dico con API real',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
