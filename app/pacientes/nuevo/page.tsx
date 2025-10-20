'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '@/components/FormField';
import { pacienteSchema, type PacienteInput } from '@/lib/validation/paciente.schema';
import { createPaciente } from '@/lib/api/endpoints';
import { useRouter } from 'next/navigation';

export default function NuevoPacientePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<PacienteInput>({ resolver: zodResolver(pacienteSchema) });

  return (
    <section className="grid gap-4">
      <h1 className="text-xl font-semibold">Nuevo paciente</h1>
      <form className="card grid gap-4" onSubmit={handleSubmit(async (values)=>{
        await createPaciente(values);
        router.push('/pacientes');
      })}>
        <FormField label="DNI" error={errors.dni?.message}>
          <input
            className="input"
            inputMode="numeric"
            maxLength={8}
            pattern="\d*"
            onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ''); }}
            {...register('dni', {
              setValueAs: (v) => (v ?? '').replace(/\D/g, ''), // asegura solo dígitos antes de validar
            })}
          />
        </FormField>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Nombre" error={errors.nombre?.message}>
            <input className="input" {...register('nombre')} />
          </FormField>
          <FormField label="Apellido" error={errors.apellido?.message}>
            <input className="input" {...register('apellido')} />
          </FormField>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Mail" error={errors.mail?.message}>
            <input className="input" {...register('mail')} />
          </FormField>
          <FormField label="Teléfono" error={errors.telefono?.message}>
            <input
              className="input"
              inputMode="numeric"
              maxLength={15}
              pattern="\d*"
              placeholder="Solo números"
              onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ''); }}
              {...register('telefono', {
                setValueAs: (v) => (v ?? '').replace(/\D/g, ''), // quita espacios, +, guiones, etc.
              })}
            />
          </FormField>
        </div>
        <FormField label="Fecha de nacimiento" error={errors.fecha_nacimiento?.message}>
          <input
            className="input"
            type="date"
            max={new Date().toISOString().slice(0, 10)} // evita elegir una fecha futura
            {...register('fecha_nacimiento')}
          />
        </FormField>


        <div className="flex gap-2">
          <button className="btn" disabled={isSubmitting} type="submit">Guardar</button>
        </div>
      </form>
    </section>
  );
}
