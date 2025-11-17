'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listMedicos, deleteMedico, listEspecialidades } from '@/lib/api/endpoints';
import type { Medico, Especialidad } from '@/lib/api/dto';

export default function MedicosPage() {
  const [q, setQ] = useState('');
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [esp, setEsp] = useState<Record<number, string>>({});

  useEffect(() => {
    listEspecialidades().then((e: Especialidad[]) =>
      setEsp(Object.fromEntries(e.map((x) => [x.id, x.nombre])))
    );
  }, []);

  useEffect(() => {
    listMedicos(q).then(setMedicos);
  }, [q]);

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Médicos</h1>
        <Link href="/medicos/nuevo" className="btn">Nuevo médico</Link>
      </div>

      <div className="card grid gap-4 overflow-hidden">
        <input
          className="input"
          placeholder="Buscar por nombre, apellido o especialidad..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="overflow-x-auto rounded-lg border border-gray-200/60 dark:border-neutral-800/60">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 dark:bg-neutral-900/70 text-sm text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2 text-center font-semibold">ID</th>
                <th className="px-4 py-2 text-left font-semibold">Nombre</th>
                <th className="px-4 py-2 text-left font-semibold">Especialidad</th>
                <th className="px-4 py-2 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
              {medicos.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/70 dark:hover:bg-neutral-900/50">
                  <td className="px-4 py-3 text-center font-mono tabular-nums text-sm">{m.id}</td>
                  <td className="px-4 py-3">{m.apellido}, {m.nombre}</td>
                  <td className="px-4 py-3">{esp[m.especialidad_id] || '-'}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                    <Link className="btn-outline text-sm" href={`/medicos/${m.id}/agenda`}>Agenda</Link>
                    <Link className="btn-outline text-sm" href={`/medicos/${m.id}`}>Editar</Link>
                    <button
                      className="btn-outline text-sm text-red-600 border-red-300 dark:border-red-700"
                      onClick={async () => {
                        if (confirm('¿Eliminar médico?')) {
                          await deleteMedico(m.id);
                          setMedicos(await listMedicos(q));
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {medicos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">No hay médicos para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
