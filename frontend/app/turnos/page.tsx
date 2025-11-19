'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listTurnos, listPacientes, listMedicos } from '@/lib/api/endpoints';
import type { Turno, Paciente, Medico } from '@/lib/api/dto';

const fmtDateTime = (val: string) => {
  const normalized = val.includes('T') ? val : val.replace(' ', 'T');
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleString();
};

export default function TurnosPage() {
  const [rows, setRows] = useState<Turno[]>([]);
  const [estado, setEstado] = useState<string>('');
  const [pacNames, setPacNames] = useState<Record<number, string>>({});
  const [medNames, setMedNames] = useState<Record<number, string>>({});

  async function loadTurnos() {
    const data = await listTurnos({ estado: estado || undefined });
    setRows(data);
  }

  useEffect(() => { loadTurnos(); }, [estado]);

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
        <h1 className="text-xl font-semibold">Turnos</h1>
        <Link href="/turnos/nuevo" className="btn">Nuevo turno</Link>
      </div>

      <div className="card grid gap-4 overflow-hidden">
        <div className="flex flex-wrap gap-2 items-center">
          <select className="input max-w-xs" value={estado} onChange={e=>setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="asignado">Asignado</option>
            <option value="cancelado_medico">Cancelado por médico</option>
            <option value="cancelado_paciente">Cancelado por paciente</option>
            <option value="atendido">Atendido</option>
            <option value="ausente">Ausente</option>
          </select>
          <button className="btn-outline" onClick={loadTurnos}>Refrescar</button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200/60 dark:border-neutral-800/60">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 dark:bg-neutral-900/70 text-sm text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2 text-center font-semibold">ID</th>
                <th className="px-4 py-2 text-left font-semibold">Paciente</th>
                <th className="px-4 py-2 text-left font-semibold">Médico</th>
                <th className="px-4 py-2 text-left font-semibold">Fecha/Hora</th>
                <th className="px-4 py-2 text-left font-semibold">Estado</th>
                <th className="px-4 py-2 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
              {rows.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/70 dark:hover:bg-neutral-900/50">
                  <td className="px-4 py-3 text-center font-mono tabular-nums text-sm">{t.id}</td>
                  <td className="px-4 py-3">{pacNames[t.paciente_id] || `#${t.paciente_id}`}</td>
                  <td className="px-4 py-3">{medNames[t.medico_id] || `#${t.medico_id}`}</td>
                  <td className="px-4 py-3 text-sm">{fmtDateTime(t.fecha_hora)}</td>
                  <td className="px-4 py-3 capitalize">{t.estado.replace('_',' ')}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link className="btn-outline text-sm" href={`/turnos/${t.id}`}>Ver</Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">No hay turnos para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
