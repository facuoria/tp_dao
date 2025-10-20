'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Inicio' },
  { href: '/pacientes', label: 'Pacientes' },
  { href: '/medicos', label: 'Médicos' },
  { href: '/especialidades', label: 'Especialidades' },
  { href: '/turnos', label: 'Turnos' },
  { href: '/recetas', label: 'Recetas' },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-gray-200 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur z-50">
      <div className="container flex items-center h-14 gap-4">
        <div className="font-bold">Turnero Médico</div>
        <ul className="flex gap-3 text-sm">
          {tabs.map(t => {
            const active = pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href));
            return (
              <li key={t.href}>
                <Link href={t.href} className={active ? 'link font-semibold' : 'link'}>
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
