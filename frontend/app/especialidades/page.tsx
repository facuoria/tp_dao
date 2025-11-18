'use client';

import { useEffect, useState } from 'react';
import { createEspecialidad, listEspecialidades } from '@/lib/api/endpoints';
import type { Especialidad } from '@/lib/api/dto';

export default function EspecialidadesPage() {
  const [rows, setRows] = useState<Especialidad[]>([]);
  const [nombre, setNombre] = useState('');

  async function load() { setRows(await listEspecialidades()); }
  useEffect(() => { load(); }, []);

  return (
    <section className="grid gap-4">
      <h1 className="text-xl font-semibold">Especialidades</h1>

      <div className="card grid gap-3">
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Nueva especialidad"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
          <button
            className="btn"
            onClick={async () => {
              if (!nombre.trim()) return;
              await createEspecialidad({ nombre });
              setNombre('');
              await load();
            }}
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="card grid gap-3 overflow-x-auto">
        <table className="table table-fixed">
          {/* prettier-ignore */}
          <colgroup><col className="w-16"/><col/></colgroup>
          <thead>
            <tr className="text-sm">
              <th className="px-3 text-center">ID</th>
              <th className="px-3 text-left">Nombre</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(e => (
              <tr key={e.id} className="align-middle">
                <td className="px-3 text-center font-mono tabular-nums">{e.id}</td>
                <td className="px-3 text-left">{e.nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
