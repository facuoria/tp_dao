'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listTurnos, listPacientes, listMedicos } from '@/lib/api/endpoints';
import type { Turno, Paciente, Medico } from '@/lib/api/dto';

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

  // Cargar diccionarios de nombres (1 vez)
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

      <div className="card grid gap-3 overflow-x-auto">
        <div className="flex gap-2">
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

        <table className="table table-fixed">
          {/* prettier-ignore */}
          <colgroup><col className="w-16"/><col className="w-[28ch]"/><col className="w-[28ch]"/><col className="w-[26ch]"/><col className="w-[18ch]"/><col className="w-20"/></colgroup>

          <thead>
            <tr className="text-sm">
              <th className="px-3 text-center">ID</th>
              <th className="px-3 text-left">Paciente</th>
              <th className="px-3 text-left">Médico</th>
              <th className="px-3 text-left">Fecha/Hora</th>
              <th className="px-3 text-left">Estado</th>
              <th className="px-3 text-right"></th>
            </tr>
          </thead>

          <tbody>
            {rows.map(t => (
              <tr key={t.id} className="align-middle">
                <td className="px-3 text-center font-mono tabular-nums">{t.id}</td>
                <td className="px-3 text-left">{pacNames[t.paciente_id] || `#${t.paciente_id}`}</td>
                <td className="px-3 text-left">{medNames[t.medico_id] || `#${t.medico_id}`}</td>
                <td className="px-3 text-left">{new Date(t.fecha_hora).toLocaleString()}</td>
                <td className="px-3 text-left capitalize">{t.estado.replace('_',' ')}</td>
                <td className="px-3 text-right whitespace-nowrap">
                  <Link className="link" href={`/turnos/${t.id}`}>Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
