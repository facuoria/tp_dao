'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '@/components/FormField';
import { agendaSchema, type AgendaInput } from '@/lib/validation/agenda.schema';
import { createAgendaItem, getMedico, listAgenda } from '@/lib/api/endpoints';
import type { AgendaMedico, Medico } from '@/lib/api/dto';

const dayName = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const normalizeTime = (t: string) => t.split(':').slice(0, 2).join(':');

export default function NuevaAgendaPage() {
  const { id } = useParams<{ id: string }>();
  const medicoId = Number(id);
  const router = useRouter();

  const [medico, setMedico] = useState<Medico | null>(null);
  const [existing, setExisting] = useState<AgendaMedico[]>([]);

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<AgendaInput>({
      resolver: zodResolver(agendaSchema),
      defaultValues: { dia_semana: 0, duracion_min: 30 },
    });

  useEffect(() => {
    (async () => {
      const [m, agenda] = await Promise.all([getMedico(medicoId), listAgenda(medicoId)]);
      setMedico(m as Medico);
      setExisting(agenda as AgendaMedico[]);
    })();
  }, [medicoId]);

  async function onSubmit(values: AgendaInput) {
    const payload = {
      ...values,
      hora_inicio: normalizeTime(values.hora_inicio),
      hora_fin: normalizeTime(values.hora_fin),
    };

    const duplicate = existing.some(
      (a) =>
        a.dia_semana === payload.dia_semana &&
        normalizeTime(a.hora_inicio) === payload.hora_inicio
    );
    if (duplicate) {
      setError('hora_inicio', { message: 'Ya existe una franja para ese día a esa hora' });
      return;
    }

    await createAgendaItem(medicoId, payload);
    router.push(`/medicos/${id}/agenda`);
  }

  return (
    <section className="grid gap-4">
      <div>
        <p className="text-sm text-gray-500">Médico #{medico?.id ?? medicoId}</p>
        <h1 className="text-xl font-semibold">
          {medico ? `Agregar franja a ${medico.apellido}, ${medico.nombre}` : 'Agregar franja'}
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
