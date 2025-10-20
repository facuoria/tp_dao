'use client';

import { useEffect, useState } from 'react';
import { createReceta, listPacientes, listMedicos, listTurnos } from '@/lib/api/endpoints';
import type { Paciente, Medico, Turno } from '@/lib/api/dto';
import { useRouter } from 'next/navigation';

export default function NuevaRecetaPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [paciente_id, setPaciente] = useState<number>(0);
  const [medico_id, setMedico] = useState<number>(0);
  const [turno_id, setTurno] = useState<number | ''>('');
  const [fecha_emision, setFecha] = useState<string>('');
  const [indicaciones, setInd] = useState<string>('');

  useEffect(() => {
    (async ()=>{
      const [p, m, t] = await Promise.all([
        listPacientes('',1,50).then(r=>r.data),
        listMedicos(),
        listTurnos({}),
      ]);
      setPacientes(p); setMedicos(m); setTurnos(t);
    })();
  }, []);

  async function onSubmit() {
    if (!paciente_id || !medico_id || !fecha_emision) { alert('Faltan campos'); return; }
    await createReceta({
      paciente_id, medico_id,
      turno_id: turno_id === '' ? null : Number(turno_id),
      fecha_emision, indicaciones
    });
    router.push('/recetas');
  }

  return (
    <section className="grid gap-4">
      <h1 className="text-xl font-semibold">Nueva receta</h1>
      <div className="card grid gap-3">
        <select className="input" value={paciente_id} onChange={e=>setPaciente(Number(e.target.value))}>
          <option value={0}>Paciente...</option>
          {pacientes.map(p=><option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
        </select>
        <select className="input" value={medico_id} onChange={e=>setMedico(Number(e.target.value))}>
          <option value={0}>Médico...</option>
          {medicos.map(m=><option key={m.id} value={m.id}>{m.apellido}, {m.nombre}</option>)}
        </select>
        <select className="input" value={turno_id} onChange={e=>setTurno(e.target.value === '' ? '' : Number(e.target.value))}>
          <option value="">(Opcional) Turno...</option>
          {turnos.map(t=><option key={t.id} value={t.id}>#{t.id} — Pac {t.paciente_id} — Med {t.medico_id}</option>)}
        </select>
        <input className="input" type="date" value={fecha_emision} onChange={e=>setFecha(e.target.value)} />
        <textarea className="input" rows={4} placeholder="Indicaciones" value={indicaciones} onChange={e=>setInd(e.target.value)} />
        <button className="btn" onClick={onSubmit}>Guardar</button>
      </div>
    </section>
  );
}
