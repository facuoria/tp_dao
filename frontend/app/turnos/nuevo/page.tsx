'use client';

import { useEffect, useMemo, useState } from 'react';
import { createTurno, listPacientes, listMedicos, listAgenda, listTurnos } from '@/lib/api/endpoints';
import type { Paciente, Medico, AgendaMedico, Turno } from '@/lib/api/dto';
import { useRouter } from 'next/navigation';

// En la BD: 0=Lunes..6=Domingo. En JS: 0=Domingo..6=Sábado.
const jsDayToAgenda = (jsDay: number) => (jsDay + 6) % 7;
const fmtDateLabel = (dateStr: string) =>
  new Intl.DateTimeFormat('es-AR', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(`${dateStr}T00:00:00`));

const pad = (n: number) => String(n).padStart(2, '0');
const hmToMinutes = (hhmm: string) => {
  const [hh = '0', mm = '0'] = hhmm.split(':');
  return Number(hh) * 60 + Number(mm);
};
const toHm = (mins: number) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

export default function NuevoTurnoPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [agenda, setAgenda] = useState<AgendaMedico[]>([]);
  const [turnosDelDia, setTurnosDelDia] = useState<Turno[]>([]);
  const [paciente_id, setPaciente] = useState<number>(0);
  const [medico_id, setMedico] = useState<number>(0);
  const [fecha, setFecha] = useState<string>(''); // YYYY-MM-DD
  const [hora, setHora] = useState<string>('');   // HH:MM
  const [duracion_min, setDuracion] = useState<number>(30);
  const [motivo, setMotivo] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      const [p, m] = await Promise.all([
        listPacientes('', 1, 50).then((r) => r.data),
        listMedicos(),
      ]);
      setPacientes(p);
      setMedicos(m);
    })();
  }, []);

  // Cargar agenda al cambiar médico
  useEffect(() => {
    (async () => {
      setAgenda([]);
      setFecha('');
      setHora('');
      setError('');
      if (!medico_id) return;
      const rows = await listAgenda(medico_id);
      setAgenda(rows);
      if (rows.length) {
        setDuracion(rows[0].duracion_min || 30);
      } else {
        setError('El médico no tiene agenda cargada.');
      }
    })();
  }, [medico_id]);

  // Cargar turnos del día seleccionado para descartar superpuestos
  useEffect(() => {
    (async () => {
      setTurnosDelDia([]);
      if (!medico_id || !fecha) return;
      const desde = `${fecha}T00:00:00`;
      const hasta = `${fecha}T23:59:59`;
      const rows = await listTurnos({ medicoId: medico_id, desde, hasta }) as Turno[];
      // El backend actual solo filtra por estado; filtramos por médico y día en el front
      const mismosDia = rows.filter((t) => {
        const d = new Date((t as any).fecha_hora.replace(' ', 'T'));
        const isoDay = d.toISOString().slice(0, 10);
        return t.medico_id === medico_id && isoDay === fecha;
      });
      setTurnosDelDia(mismosDia);
    })();
  }, [medico_id, fecha, duracion_min]);

  const fechasDisponibles = useMemo(() => {
    if (!agenda.length) return [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const agendaDays = new Set(agenda.map((a) => a.dia_semana));
    const res: string[] = [];
    for (let i = 0; i < 60; i++) { // mirar 60 días hacia adelante
      const d = new Date(today.getTime() + i * 86400000);
      const agendaDay = jsDayToAgenda(d.getDay());
      if (agendaDays.has(agendaDay)) {
        res.push(d.toISOString().slice(0, 10));
      }
    }
    return res;
  }, [agenda]);

  const horasDisponibles = useMemo(() => {
    if (!fecha || !duracion_min) return [];
    const agendaDay = jsDayToAgenda(new Date(`${fecha}T00:00:00`).getDay());
    const segs = agenda.filter((a) => a.dia_semana === agendaDay);
    const slots: string[] = [];

    // helper para descartar superposiciones con turnos existentes (usa duración real de cada turno)
    const overlapsTurno = (hhmm: string) => {
      const startSlot = hmToMinutes(hhmm);
      const endSlot = startSlot + duracion_min;
      return turnosDelDia.some(t => {
        const d = new Date(t.fecha_hora.replace(' ', 'T'));
        const startTurno = d.getHours() * 60 + d.getMinutes();
        const endTurno = startTurno + t.duracion_min;
        return startSlot < endTurno && endSlot > startTurno;
      });
    };

    segs.forEach((seg) => {
      const start = hmToMinutes(seg.hora_inicio.slice(0, 5));
      const end = hmToMinutes(seg.hora_fin.slice(0, 5));
      for (let t = start; t + duracion_min <= end; t += duracion_min) {
        const hm = toHm(t);
        if (!overlapsTurno(hm)) slots.push(hm);
      }
    });
    return Array.from(new Set(slots)).sort();
  }, [agenda, fecha, duracion_min, turnosDelDia]);

  async function onSubmit() {
    setError('');
    if (!paciente_id || !medico_id || !fecha || !hora) { alert('Completá los campos obligatorios'); return; }
    if (!horasDisponibles.includes(hora)) { setError('Seleccioná un horario válido.'); return; }
    try {
      await createTurno({
        paciente_id,
        medico_id,
        fecha_hora: `${fecha}T${hora}:00`,
        duracion_min,
        motivo,
      });
      router.push('/turnos');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'No se pudo guardar el turno');
    }
  }

  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-gray-500">Asignación de turnos</p>
          <h1 className="text-xl font-semibold">Nuevo turno</h1>
        </div>
      </div>

      <div className="card grid gap-4">
        {error && <div className="alert alert-error text-sm">{error}</div>}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Paciente</label>
            <select className="input" value={paciente_id} onChange={(e) => setPaciente(Number(e.target.value))}>
              <option value={0}>Seleccione paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.apellido}, {p.nombre} (DNI {p.dni})</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Médico</label>
            <select className="input" value={medico_id} onChange={(e) => setMedico(Number(e.target.value))}>
              <option value={0}>Seleccione médico...</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>{m.apellido}, {m.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Fecha</label>
            <select className="input" value={fecha} onChange={(e) => { setFecha(e.target.value); setHora(''); }}>
              <option value="">{agenda.length ? 'Seleccione fecha...' : 'Cargue agenda del médico'}</option>
              {fechasDisponibles.map((d) => (
                <option key={d} value={d}>{fmtDateLabel(d)}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Duración (min)</label>
            <input
              className="input"
              type="number"
              min={5}
              step={5}
              value={duracion_min}
              onChange={(e) => { setDuracion(Number(e.target.value)); setHora(''); }}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Horario disponible</label>
            <select className="input" value={hora} onChange={(e) => setHora(e.target.value)} disabled={!horasDisponibles.length}>
              <option value="">{horasDisponibles.length ? 'Seleccione horario...' : 'Sin horarios para esa fecha'}</option>
              {horasDisponibles.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Motivo (opcional)</label>
          <input className="input" placeholder="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </div>

        <div className="flex gap-2">
          <button className="btn" onClick={onSubmit}>Guardar</button>
        </div>
      </div>
    </section>
  );
}
