import { http, HttpResponse } from 'msw';
import pacientesSeed from './seed/pacientes.json';
import medicosSeed from './seed/medicos.json';
import especialidadesSeed from './seed/especialidades.json';
import agendaSeed from './seed/agenda_medico.json';
import turnosSeed from './seed/turnos.json';
import recetasSeed from './seed/recetas.json';

type ID = number;

let pacientes = [...pacientesSeed];
let medicos = [...medicosSeed];
let especialidades = [...especialidadesSeed];
let agenda = [...agendaSeed];
let turnos = [...turnosSeed];
let recetas = [...recetasSeed];

const nextId = (arr: {id:ID}[]) => (arr.length ? Math.max(...arr.map(x=>x.id)) + 1 : 1);
// Helpers sin tipos: garantizan objeto plano para poder usar "..."
const asObj = (x: unknown) =>
  x && typeof x === 'object' && !Array.isArray(x) ? (x as Record<string, unknown>) : {};

const readJsonObj = async (req: Request): Promise<Record<string, unknown>> => {
  try {
    const data = await req.json();
    return asObj(data);
  } catch {
    return {};
  }
};


// Helpers
function pageOf<T>(rows: T[], page = 1, size = 10) {
  const start = (page - 1) * size;
  return { data: rows.slice(start, start + size), page, size, total: rows.length };
}
function withinSchedule(medico_id: ID, iso: string, duracion_min: number) {
  const d = new Date(iso);
  const day = d.getDay(); // 0..6
  const pad = (n:number)=>String(n).padStart(2,'0');
  const hm = (h:number,m:number)=>`${pad(h)}:${pad(m)}`;
  const hh = d.getHours(), mm = d.getMinutes();
  const start = hm(hh, mm);

  const seg = agenda.filter(a=>a.medico_id===medico_id && a.dia_semana===day);
  if (!seg.length) return false;

  const addMin = (iso:string, min:number) => new Date(new Date(iso).getTime() + min*60000).toISOString();
  const end = addMin(iso, duracion_min);
  const ehh = new Date(end).getHours(), emm = new Date(end).getMinutes();
  const endStr = hm(ehh, emm);

  return seg.some(a => start >= a.hora_inicio && endStr <= a.hora_fin);
}
function overlaps(medico_id: ID, iso: string, duracion_min: number) {
  const start = new Date(iso).getTime();
  const end = start + duracion_min * 60000;
  return turnos.some(t => t.medico_id===medico_id && (() => {
    const s = new Date(t.fecha_hora).getTime();
    const e = s + t.duracion_min * 60000;
    return Math.max(s, start) < Math.min(e, end);
  })());
}

export const handlers = [
  // Pacientes
  http.get('/api/pacientes', ({ request }) => {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const page = Number(url.searchParams.get('page') || '1');
    const size = Number(url.searchParams.get('size') || '10');
    let rows = [...pacientes];
    if (search) {
      rows = rows.filter(p =>
        p.dni.includes(search) ||
        p.nombre.toLowerCase().includes(search) ||
        p.apellido.toLowerCase().includes(search)
      );
    }
    return HttpResponse.json(pageOf(rows, page, size));
  }),
  http.get('/api/pacientes/:id', ({ params }) => {
    const p = pacientes.find(x => x.id === Number(params.id));
    return p ? HttpResponse.json(p) : HttpResponse.json({ detail:'Not found' }, { status:404 });
  }),
  http.post('/api/pacientes', async ({ request }) => {
    const body = await readJsonObj(request);
    const p = { id: nextId(pacientes), ...body };
    pacientes.push(p as any);
    return HttpResponse.json(p, { status: 201 });
  }),

  http.put('/api/pacientes/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const idx = pacientes.findIndex(x => x.id === id);
    if (idx < 0) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    const body = await readJsonObj(request);
    pacientes[idx] = { ...pacientes[idx], ...body } as any;
    return HttpResponse.json(pacientes[idx]);
  }),
  http.delete('/api/pacientes/:id', ({ params }) => {
    const id = Number(params.id);
    pacientes = pacientes.filter(x=>x.id!==id);
    return new HttpResponse(null, { status:204 });
  }),

  // Medicos
  http.get('/api/medicos', () => HttpResponse.json(medicos)),
  http.get('/api/medicos/:id', ({ params }) => {
    const m = medicos.find(x=>x.id===Number(params.id));
    return m ? HttpResponse.json(m) : HttpResponse.json({detail:'Not found'},{status:404});
  }),
  // GET /api/medicos (con search) — deja el que ya pusimos
  http.post('/api/medicos', async ({ request }) => {
    const body = await readJsonObj(request);
    const m = { id: nextId(medicos), ...body };
    medicos.push(m as any);
    return HttpResponse.json(m, { status: 201 });
  }),

  http.put('/api/medicos/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const idx = medicos.findIndex(x => x.id === id);
    if (idx < 0) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    const body = await readJsonObj(request);
    medicos[idx] = { ...medicos[idx], ...body } as any;
    return HttpResponse.json(medicos[idx]);
  }),

  http.delete('/api/medicos/:id', ({ params }) => {
    const id = Number(params.id);
    medicos = medicos.filter(x=>x.id!==id);
    return new HttpResponse(null, { status:204 });
  }),
  http.get('/api/medicos/:id/agenda', ({ params }) => {
    const rows = agenda.filter(a=>a.medico_id===Number(params.id));
    return HttpResponse.json(rows);
  }),

  // Especialidades
  // Especialidades
  http.get('/api/especialidades', () => HttpResponse.json(especialidades)),

  http.post('/api/especialidades', async ({ request }) => {
    const body = await readJsonObj(request);
    const nombre = String((body as any).nombre ?? '').trim();
    if (!nombre) {
      return HttpResponse.json({ detail: 'Nombre requerido' }, { status: 400 });
    }
    const e = { id: nextId(especialidades), nombre };
    especialidades.push(e as any);
    return HttpResponse.json(e, { status: 201 });
  }),

  // Turnos
  http.get('/api/turnos', ({ request }) => {
    const url = new URL(request.url);
    const medicoId = url.searchParams.get('medicoId');
    const pacienteId = url.searchParams.get('pacienteId');
    const desde = url.searchParams.get('desde');
    const hasta = url.searchParams.get('hasta');
    const estado = url.searchParams.get('estado');
    let rows = [...turnos];
    if (medicoId) rows = rows.filter(t=>t.medico_id===Number(medicoId));
    if (pacienteId) rows = rows.filter(t=>t.paciente_id===Number(pacienteId));
    if (desde) rows = rows.filter(t=>new Date(t.fecha_hora)>=new Date(desde));
    if (hasta) rows = rows.filter(t=>new Date(t.fecha_hora)<=new Date(hasta));
    if (estado) rows = rows.filter(t=>t.estado===estado);
    return HttpResponse.json(rows);
  }),
  http.get('/api/turnos/:id', ({ params }) => {
    const t = turnos.find(x=>x.id===Number(params.id));
    return t ? HttpResponse.json(t) : HttpResponse.json({detail:'Not found'},{status:404});
  }),
  http.post('/api/turnos', async ({ request }) => {
    const body = await readJsonObj(request);

    const medico_id = Number((body as any).medico_id ?? 0);
    const fecha_hora = String((body as any).fecha_hora ?? '');
    const duracion_min = Number((body as any).duracion_min ?? 30);

    if (!withinSchedule(medico_id, fecha_hora, duracion_min))
      return HttpResponse.json({ detail: 'Fuera de agenda del médico' }, { status: 400 });
    if (overlaps(medico_id, fecha_hora, duracion_min))
      return HttpResponse.json({ detail: 'Se superpone con otro turno' }, { status: 409 });

    const t = {
      id: nextId(turnos),
      estado: 'asignado',
      estado_id: 1,
      created_at: new Date().toISOString(),
      ...body,
      medico_id,
      fecha_hora,
      duracion_min,
    };
    turnos.push(t as any);
    return HttpResponse.json(t, { status: 201 });
  }),

  http.patch('/api/turnos/:id/estado', async ({ params, request }) => {
    const id = Number(params.id);
    const idx = turnos.findIndex(x => x.id === id);
    if (idx < 0) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });

    const body = await readJsonObj(request);
    const estado = String((body as any).estado ?? '');

    const valid = ['asignado','cancelado_medico','cancelado_paciente','atendido','ausente'];
    if (!valid.includes(estado)) {
      return HttpResponse.json({ detail: 'Estado inválido' }, { status: 400 });
    }

    turnos[idx] = { ...turnos[idx], estado };
    return HttpResponse.json(turnos[idx]);
  }),

  // Recetas
  http.get('/api/recetas', ({ request }) => {
    const url = new URL(request.url);
    const turnoId = url.searchParams.get('turnoId');
    const pacienteId = url.searchParams.get('pacienteId');
    const medicoId = url.searchParams.get('medicoId');
    let rows = [...recetas];
    if (turnoId) rows = rows.filter(r=>r.turno_id===Number(turnoId));
    if (pacienteId) rows = rows.filter(r=>r.paciente_id===Number(pacienteId));
    if (medicoId) rows = rows.filter(r=>r.medico_id===Number(medicoId));
    return HttpResponse.json(rows);
  }),
  http.post('/api/recetas', async ({ request }) => {
    const body = await readJsonObj(request);
    const r = { id: nextId(recetas), ...body };
    recetas.push(r as any);
    return HttpResponse.json(r, { status: 201 });
  }),

];
