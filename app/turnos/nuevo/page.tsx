'use client';

import { useEffect, useState } from 'react';
import { createTurno, listPacientes, listMedicos } from '@/lib/api/endpoints';
import type { Paciente, Medico } from '@/lib/api/dto';
import { useRouter } from 'next/navigation';
import DateTimePicker from '@/components/DateTimePicker';

export default function NuevoTurnoPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [paciente_id, setPaciente] = useState<number>(0);
  const [medico_id, setMedico] = useState<number>(0);
  const [fecha_hora, setFecha] = useState<string>('');
  const [duracion_min, setDuracion] = useState<number>(30);
  const [motivo, setMotivo] = useState<string>('');

  useEffect(() => {
    (async () => {
      const [p, m] = await Promise.all([
        listPacientes('', 1, 50).then(r=>r.data),
        listMedicos()
      ]);
      setPacientes(p); setMedicos(m);
    })();
  }, []);

  async function onSubmit() {
    if (!paciente_id || !medico_id || !fecha_hora) { alert('Completá los campos obligatorios'); return; }
    await createTurno({ paciente_id, medico_id, fecha_hora: new Date(fecha_hora).toISOString(), duracion_min, motivo });
    router.push('/turnos');
  }

  return (
    <section className="grid gap-4">
      <h1 className="text-xl font-semibold">Nuevo turno</h1>
      <div className="card grid gap-3">
        <select className="input" value={paciente_id} onChange={e=>setPaciente(Number(e.target.value))}>
          <option value={0}>Seleccione paciente...</option>
          {pacientes.map(p=><option key={p.id} value={p.id}>{p.apellido}, {p.nombre} (DNI {p.dni})</option>)}
        </select>
        <select className="input" value={medico_id} onChange={e=>setMedico(Number(e.target.value))}>
          <option value={0}>Seleccione médico...</option>
          {medicos.map(m=><option key={m.id} value={m.id}>{m.apellido}, {m.nombre}</option>)}
        </select>
        <DateTimePicker value={fecha_hora} onChange={e=>setFecha(e.target.value)} />
        <input className="input" type="number" min={10} step={5} value={duracion_min} onChange={e=>setDuracion(Number(e.target.value))} />
        <input className="input" placeholder="Motivo (opcional)" value={motivo} onChange={e=>setMotivo(e.target.value)} />
        <div className="flex gap-2">
          <button className="btn" onClick={onSubmit}>Guardar</button>
        </div>
      </div>
    </section>
  );
}
