'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTurno, patchEstadoTurno } from '@/lib/api/endpoints';
import type { Turno } from '@/lib/api/dto';

const estados = ['asignado','cancelado_medico','cancelado_paciente','atendido','ausente'] as const;

export default function VerTurnoPage() {
  const { id } = useParams<{id: string}>();
  const [t, setT] = useState<Turno | null>(null);

  async function load() { setT(await getTurno(Number(id))); }
  useEffect(() => { load(); }, [id]);

  if (!t) return <p>Cargando...</p>;

  return (
    <section className="grid gap-4">
      <h1 className="text-xl font-semibold">Turno #{t.id}</h1>
      <div className="card grid gap-2">
        <div>Paciente: {t.paciente_id}</div>
        <div>Médico: {t.medico_id}</div>
        <div>Fecha/Hora: {new Date(t.fecha_hora).toLocaleString()}</div>
        <div>Estado actual: <b>{t.estado}</b></div>
        <div className="flex flex-wrap gap-2 pt-2">
          {estados.map(e => (
            <button key={e} className="btn-outline" onClick={async ()=>{
              await patchEstadoTurno(t.id, e); await load();
            }}>{e}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
