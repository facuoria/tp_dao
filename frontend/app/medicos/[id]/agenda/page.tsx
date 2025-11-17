'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { deleteAgendaItem, getMedico, listAgenda } from '@/lib/api/endpoints';
import type { AgendaMedico, Medico } from '@/lib/api/dto';

const dayName = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const fmtTime = (t?: string) => (t || '').split(':').slice(0, 2).join(':');

export default function AgendaMedicoPage() {
  const { id } = useParams<{ id: string }>();
  const medicoId = Number(id);

  const [medico, setMedico] = useState<Medico | null>(null);
  const [rows, setRows] = useState<AgendaMedico[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [m, a] = await Promise.all([getMedico(medicoId), listAgenda(medicoId)]);
    setMedico(m as Medico);
    setRows(a as AgendaMedico[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, [medicoId]);

  if (loading) return <p>Cargando...</p>;

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Médico #{medico?.id ?? medicoId}</p>
          <h1 className="text-xl font-semibold">{medico ? `${medico.apellido}, ${medico.nombre}` : 'Agenda'}</h1>
        </div>
        <Link className="btn" href={`/medicos/${id}/agenda/nueva`}>Agregar franja</Link>
      </div>

      <div className="card grid gap-3 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-600">Sin agenda cargada aún.</p>
        ) : (
          <table className="table table-fixed">
            {/* prettier-ignore */}
            <colgroup><col className="w-24"/><col className="w-28"/><col className="w-28"/><col className="w-24"/><col className="w-32"/></colgroup>
            <thead>
              <tr className="text-sm">
                <th className="px-3 text-left">Día</th>
                <th className="px-3 text-left">Inicio</th>
                <th className="px-3 text-left">Fin</th>
                <th className="px-3 text-left">Duración</th>
                <th className="px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="align-middle">
                  <td className="px-3 text-left">{dayName[a.dia_semana]}</td>
                  <td className="px-3 text-left font-mono tabular-nums">{fmtTime(a.hora_inicio)}</td>
                  <td className="px-3 text-left font-mono tabular-nums">{fmtTime(a.hora_fin)}</td>
                  <td className="px-3 text-left">{a.duracion_min} min</td>
                  <td className="px-3 text-right whitespace-nowrap">
                    <Link className="link mr-3" href={`/agenda/${a.id}`}>Editar</Link>
                    <button
                      className="link text-red-600"
                      onClick={async () => {
                        if (confirm('¿Eliminar franja de agenda?')) {
                          await deleteAgendaItem(a.id);
                          await load();
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
        )}
      </div>
    </section>
  );
}
