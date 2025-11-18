'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '@/components/FormField';
import { medicoSchema, type MedicoInput } from '@/lib/validation/medico.schema';
import { createMedico, listEspecialidades } from '@/lib/api/endpoints';
import type { Especialidad } from '@/lib/api/dto';

export default function NuevoMedicoPage() {
  const router = useRouter();
  const [esp, setEsp] = useState<Especialidad[]>([]);
  useEffect(() => { listEspecialidades().then(setEsp); }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<MedicoInput>({ resolver: zodResolver(medicoSchema) });

  return (
    <section className="grid gap-4">
      <h1 className="text-xl font-semibold">Nuevo médico</h1>
      <form className="card grid gap-4" onSubmit={handleSubmit(async (values)=>{
        await createMedico(values);
        router.push('/medicos');
      })}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Nombre" error={errors.nombre?.message}>
            <input className="input" {...register('nombre')} />
          </FormField>
          <FormField label="Apellido" error={errors.apellido?.message}>
            <input className="input" {...register('apellido')} />
          </FormField>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Matrícula" error={errors.matricula?.message}>
            <input className="input" {...register('matricula')} />
          </FormField>
          <FormField label="Mail" error={errors.mail?.message}>
            <input className="input" {...register('mail')} />
          </FormField>
        </div>
        <FormField label="Especialidad" error={errors.especialidad_id?.message}>
          <select className="input" {...register('especialidad_id', { valueAsNumber: true })}>
            <option value="">Seleccione...</option>
            {esp.map(e=> <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </FormField>

        <button className="btn" disabled={isSubmitting} type="submit">Guardar</button>
      </form>
    </section>
  );
}
