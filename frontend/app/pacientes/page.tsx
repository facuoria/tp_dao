'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listPacientes, deletePaciente } from '@/lib/api/endpoints';
import type { Paciente } from '@/lib/api/dto';

export default function PacientesPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{rows: Paciente[]; total: number}>({ rows: [], total: 0 });
  const size = 10;

  async function load() {
    const res = await listPacientes(q, page, size);
    setData({ rows: res.data, total: res.total });
  }
  useEffect(() => { load(); }, [q, page]);

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pacientes</h1>
        <Link href="/pacientes/nuevo" className="btn">Nuevo paciente</Link>
      </div>

      <div className="card grid gap-3 overflow-x-auto">
        <input
          className="input"
          placeholder="Buscar por DNI, nombre o apellido..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <table className="table table-fixed">
          {/* prettier-ignore */}
          <colgroup><col className="w-16"/><col className="w-28"/><col/><col className="w-[26ch]"/><col className="w-28"/></colgroup>
          <thead>
            <tr className="text-sm">
              <th className="px-3 text-center">ID</th>
              <th className="px-3 text-center">DNI</th>
              <th className="px-3 text-left">Nombre</th>
              <th className="px-3 text-left">Mail</th>
              <th className="px-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((p) => (
              <tr key={p.id} className="align-middle">
                <td className="px-3 text-center font-mono tabular-nums">{p.id}</td>
                <td className="px-3 text-center font-mono tabular-nums">{p.dni}</td>
                <td className="px-3 text-left">{p.apellido}, {p.nombre}</td>
                <td className="px-3 text-left"><span className="block truncate">{p.mail || '-'}</span></td>
                <td className="px-3 text-right whitespace-nowrap">
                  <Link className="link mr-3" href={`/pacientes/${p.id}`}>Editar</Link>
                  <button className="link text-red-600" onClick={async () => {
                    if (confirm('¿Eliminar paciente?')) { await deletePaciente(p.id); await load(); }
                  }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between text-sm">
          <span>Total: {data.total}</span>
          <div className="flex gap-2">
            <button className="btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
            <button className="btn-outline" disabled={page * size >= data.total} onClick={() => setPage(p => p + 1)}>Siguiente</button>
          </div>
        </div>
      </div>

    </section>
  );
}
