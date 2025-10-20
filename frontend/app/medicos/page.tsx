'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listMedicos, deleteMedico, listEspecialidades } from '@/lib/api/endpoints';
import type { Medico, Especialidad } from '@/lib/api/dto';

export default function MedicosPage() {
  const [q, setQ] = useState('');                   // 👈 buscador
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [esp, setEsp] = useState<Record<number, string>>({});

  useEffect(() => {
    listEspecialidades().then((e: Especialidad[]) =>
      setEsp(Object.fromEntries(e.map((x) => [x.id, x.nombre])))
    );
  }, []);

  // recargar al cambiar q
  useEffect(() => {
    listMedicos(q).then(setMedicos);
  }, [q]);

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Médicos</h1>
        <Link href="/medicos/nuevo" className="btn">Nuevo médico</Link>
      </div>

      <div className="card grid gap-3 overflow-x-auto">
        <input
          className="input"
          placeholder="Buscar por nombre, apellido o especialidad..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <table className="table table-fixed">
          {/* prettier-ignore */}
          <colgroup><col className="w-16"/><col/><col className="w-[26ch]"/><col className="w-28"/></colgroup>
          <thead>
            <tr className="text-sm">
              <th className="px-3 text-center">ID</th>
              <th className="px-3 text-left">Nombre</th>
              <th className="px-3 text-left">Especialidad</th>
              <th className="px-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {medicos.map((m) => (
              <tr key={m.id} className="align-middle">
                <td className="px-3 text-center font-mono tabular-nums">{m.id}</td>
                <td className="px-3 text-left">{m.apellido}, {m.nombre}</td>
                <td className="px-3 text-left">{esp[m.especialidad_id] || '-'}</td>
                <td className="px-3 text-right whitespace-nowrap">
                  <Link className="link mr-3" href={`/medicos/${m.id}`}>Editar</Link>
                  <button
                    className="link text-red-600"
                    onClick={async () => {
                      if (confirm('¿Eliminar médico?')) {
                        await deleteMedico(m.id);
                        setMedicos(await listMedicos(q)); // refrescar manteniendo filtro
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
