'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listRecetas, listPacientes, listMedicos } from '@/lib/api/endpoints';
import type { Receta, Paciente, Medico } from '@/lib/api/dto';

export default function RecetasPage() {
  const [rows, setRows] = useState<Receta[]>([]);
  const [pacNames, setPacNames] = useState<Record<number, string>>({});
  const [medNames, setMedNames] = useState<Record<number, string>>({});

  useEffect(() => { listRecetas().then(setRows); }, []);
  useEffect(() => {
    (async () => {
      const [p, m] = await Promise.all([
        listPacientes('', 1, 500).then(r => r.data as Paciente[]),
        listMedicos().then(r => r as Medico[]),
      ]);
      setPacNames(Object.fromEntries(p.map(x => [x.id, `${x.apellido}, ${x.nombre}`])));
      setMedNames(Object.fromEntries(m.map(x => [x.id, `${x.apellido}, ${x.nombre}`])));
    })();
  }, []);

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recetas</h1>
        <Link className="btn" href="/recetas/nuevo">Nueva receta</Link>
      </div>

      <div className="card grid gap-3 overflow-x-auto">
        <table className="table table-fixed">
          {/* prettier-ignore */}
          <colgroup><col className="w-16"/><col className="w-[28ch]"/><col className="w-[28ch]"/><col className="w-[14ch]"/><col className="w-20"/></colgroup>

          <thead>
            <tr className="text-sm">
              <th className="px-3 text-center">ID</th>
              <th className="px-3 text-left">Paciente</th>
              <th className="px-3 text-left">Médico</th>
              <th className="px-3 text-left">Fecha</th>
              <th className="px-3 text-left">Turno</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="align-middle">
                <td className="px-3 text-center font-mono tabular-nums">{r.id}</td>
                <td className="px-3 text-left">{pacNames[r.paciente_id] || `#${r.paciente_id}`}</td>
                <td className="px-3 text-left">{medNames[r.medico_id] || `#${r.medico_id}`}</td>
                <td className="px-3 text-left">{r.fecha_emision}</td>
                <td className="px-3 text-left">{r.turno_id ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
