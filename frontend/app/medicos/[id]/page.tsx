'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMedico, updateMedico, listEspecialidades } from '@/lib/api/endpoints';
import type { Medico, Especialidad } from '@/lib/api/dto';

export default function EditMedicoPage() {
  const { id } = useParams<{id: string}>();
  const router = useRouter();
  const [m, setM] = useState<Medico | null>(null);
  const [esp, setEsp] = useState<Especialidad[]>([]);

  useEffect(() => {
    (async () => {
      const [med, esps] = await Promise.all([getMedico(Number(id)), listEspecialidades()]);
      setM(med); setEsp(esps);
    })();
  }, [id]);

  if (!m) return <p>Cargando...</p>;

  return (
    <section className="grid gap-4">
      <h1 className="text-xl font-semibold">Editar médico #{id}</h1>
      <div className="card grid gap-3">
        <input className="input" value={m.nombre} onChange={e=>setM({...m, nombre:e.target.value})} />
        <input className="input" value={m.apellido} onChange={e=>setM({...m, apellido:e.target.value})} />
        <input className="input" placeholder="Matrícula" value={m.matricula||''} onChange={e=>setM({...m, matricula:e.target.value})} />
        <input className="input" placeholder="Mail" value={m.mail||''} onChange={e=>setM({...m, mail:e.target.value})} />
        <select className="input" value={m.especialidad_id} onChange={e=>setM({...m, especialidad_id: Number(e.target.value)})}>
          {esp.map(x=><option key={x.id} value={x.id}>{x.nombre}</option>)}
        </select>
        <div className="flex gap-2">
          <button className="btn" onClick={async ()=>{ await updateMedico(m.id, m); router.push('/medicos'); }}>Guardar</button>
        </div>
      </div>
    </section>
  );
}
