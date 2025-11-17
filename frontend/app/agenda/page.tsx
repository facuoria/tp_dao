'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listAgenda, listEspecialidades, listMedicos } from '@/lib/api/endpoints';
import type { AgendaMedico, Especialidad, Medico } from '@/lib/api/dto';

const dayName = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function AgendaPage() {
  const [q, setQ] = useState('');
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [esp, setEsp] = useState<Record<number, string>>({});
  const [agendaMap, setAgendaMap] = useState<Record<number, AgendaMedico[]>>({});

  useEffect(() => {
    listEspecialidades().then((rows: Especialidad[]) =>
      setEsp(Object.fromEntries(rows.map((e) => [Number(e.id), e.nombre])))
    );
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const meds = await listMedicos(q);
      if (!active) return;
      setMedicos(meds);
      const pairs = await Promise.all(
        meds.map(async (m) => [Number(m.id), await listAgenda(m.id)] as const)
      );
      if (!active) return;
      setAgendaMap(Object.fromEntries(pairs));
    })();
    return () => {
      active = false;
    };
  }, [q]);

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Agenda</h1>
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
          <colgroup><col className="w-16"/><col/><col className="w-[24ch]"/><col className="w-[28ch]"/><col className="w-32"/></colgroup>
          <thead>
            <tr className="text-sm">
              <th className="px-3 text-center">ID</th>
              <th className="px-3 text-left">Médico</th>
              <th className="px-3 text-left">Especialidad</th>
              <th className="px-3 text-left">Franjas cargadas</th>
              <th className="px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medicos.map((m) => {
              const slots = agendaMap[Number(m.id)] || [];
              return (
                <tr key={m.id} className="align-middle">
                  <td className="px-3 text-center font-mono tabular-nums">{m.id}</td>
                  <td className="px-3 text-left">{m.apellido}, {m.nombre}</td>
                  <td className="px-3 text-left">{esp[Number(m.especialidad_id)] || '-'}</td>
                  <td className="px-3 text-left">
                    {slots.length ? slots.map(s => `${dayName[s.dia_semana]} ${s.hora_inicio}-${s.hora_fin}`).join('; ') : 'Sin agenda'}
                  </td>
                  <td className="px-3 text-right whitespace-nowrap">
                    <Link className="link" href={`/medicos/${m.id}/agenda`}>Gestionar</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
