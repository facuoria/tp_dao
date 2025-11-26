'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '@/components/FormField';
import { agendaSchema, type AgendaInput } from '@/lib/validation/agenda.schema';
import { getAgendaItem, getMedico, listAgenda, updateAgendaItem } from '@/lib/api/endpoints';
import type { AgendaMedico, Medico } from '@/lib/api/dto';

const dayName = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const normalizeTime = (t: string) => t.split(':').slice(0, 2).join(':');
const toMinutes = (t: string) => {
  const [hh = '0', mm = '0'] = t.split(':');
  return Number(hh) * 60 + Number(mm);
};

export default function EditAgendaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [slot, setSlot] = useState<AgendaMedico | null>(null);
  const [medico, setMedico] = useState<Medico | null>(null);
  const [agenda, setAgenda] = useState<AgendaMedico[]>([]);

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } =
    useForm<AgendaInput>({ resolver: zodResolver(agendaSchema) });

  useEffect(() => {
    (async () => {
      const current = await getAgendaItem(Number(id));
      setSlot(current as AgendaMedico);
      reset({
        dia_semana: current.dia_semana,
        hora_inicio: normalizeTime(current.hora_inicio),
        hora_fin: normalizeTime(current.hora_fin),
        duracion_min: current.duracion_min,
      });
      const [m, rows] = await Promise.all([
        getMedico(Number(current.medico_id)),
        listAgenda(Number(current.medico_id)),
      ]);
      setMedico(m as Medico);
      setAgenda(rows as AgendaMedico[]);
    })();
  }, [id, reset]);

  if (!slot) return <p>Cargando...</p>;

  async function onSubmit(values: AgendaInput) {
    const payload = {
      ...values,
      hora_inicio: normalizeTime(values.hora_inicio),
      hora_fin: normalizeTime(values.hora_fin),
    };

    const conflict = agenda.find((a) => {
      if (a.id === slot.id || a.dia_semana !== payload.dia_semana) return false;
      const newStart = toMinutes(payload.hora_inicio);
      const newEnd = toMinutes(payload.hora_fin);
      const existingStart = toMinutes(normalizeTime(a.hora_inicio));
      const existingEnd = toMinutes(normalizeTime(a.hora_fin));
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (conflict) {
      setError('hora_inicio', {
        message: `Se superpone con la franja ${normalizeTime(conflict.hora_inicio)} - ${normalizeTime(conflict.hora_fin)}`,
      });
      return;
    }

    try {
      await updateAgendaItem(slot.id, payload);
      router.push(`/medicos/${slot.medico_id}/agenda`);
    } catch (err: any) {
      setError('hora_inicio', { message: err?.message || 'No se pudo guardar la agenda' });
    }
  }

  return (
    <section className="grid gap-4">
      <div>
        <p className="text-sm text-gray-500">Médico #{medico?.id ?? slot.medico_id}</p>
        <h1 className="text-xl font-semibold">
          {medico ? `Editar franja de ${medico.apellido}, ${medico.nombre}` : 'Editar franja'}
        </h1>
      </div>
      <form className="card grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Día de la semana" error={errors.dia_semana?.message}>
          <select className="input" {...register('dia_semana', { valueAsNumber: true })}>
            {dayName.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
        </FormField>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Hora inicio" error={errors.hora_inicio?.message}>
            <input className="input" type="time" step={300} {...register('hora_inicio')} />
          </FormField>
          <FormField label="Hora fin" error={errors.hora_fin?.message}>
            <input className="input" type="time" step={300} {...register('hora_fin')} />
          </FormField>
        </div>
        <FormField label="Duración del turno (minutos)" error={errors.duracion_min?.message}>
          <input
            className="input"
            type="number"
            min={5}
            step={5}
            {...register('duracion_min', { valueAsNumber: true })}
          />
        </FormField>
        <div className="flex gap-2">
          <button className="btn" disabled={isSubmitting} type="submit">Guardar</button>
          <button className="btn-outline" type="button" onClick={() => router.back()}>Cancelar</button>
        </div>
      </form>
    </section>
  );
}
