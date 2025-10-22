// frontend/lib/api/endpoints.ts
import { api } from './client';
import type { Page, Paciente, Medico, Especialidad, Turno, Receta, ID } from './dto';

// PACIENTES
export const listPacientes = (q = '', page = 1, size = 10) =>
  api<Page<Paciente>>('/api/pacientes', { searchParams: { search: q, page, size } });

export const getPaciente = (id: ID) =>
  api<Paciente>(`/api/pacientes/${id}`);

export const createPaciente = (data: Partial<Paciente>) =>
  api<Paciente>('/api/pacientes', { method: 'POST', body: JSON.stringify(data) });

export const updatePaciente = (id: ID, data: Partial<Paciente>) =>
  api<Paciente>(`/api/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deletePaciente = (id: ID) =>
  api<void>(`/api/pacientes/${id}`, { method: 'DELETE' });

// MÉDICOS y ESPECIALIDADES
export const listMedicos = (search = '') =>
  api<Medico[]>('/api/medicos', { searchParams: { search } });

export const getMedico = (id: ID) =>
  api<Medico>(`/api/medicos/${id}`);

export const createMedico = (data: Partial<Medico>) =>
  api<Medico>('/api/medicos', { method: 'POST', body: JSON.stringify(data) });

export const updateMedico = (id: ID, data: Partial<Medico>) =>
  api<Medico>(`/api/medicos/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteMedico = (id: ID) =>
  api<void>(`/api/medicos/${id}`, { method: 'DELETE' });

export const listEspecialidades = () =>
  api<Especialidad[]>('/api/especialidades');

export const createEspecialidad = (data: Partial<Especialidad>) =>
  api<Especialidad>('/api/especialidades', { method: 'POST', body: JSON.stringify(data) });

// TURNOS
export const listTurnos = (params: {
  medicoId?: ID; pacienteId?: ID; desde?: string; hasta?: string; estado?: string;
} = {}) =>
  api<Turno[]>('/api/turnos', { searchParams: params });

export const createTurno = (data: Partial<Turno>) =>
  api<Turno>('/api/turnos', { method: 'POST', body: JSON.stringify(data) });

export const getTurno = (id: ID) =>
  api<Turno>(`/api/turnos/${id}`);

export const patchEstadoTurno = (id: ID, estado: string) =>
  api<Turno>(`/api/turnos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) });

// RECETAS
export const listRecetas = (params: { turnoId?: ID; pacienteId?: ID; medicoId?: ID } = {}) =>
  api<Receta[]>('/api/recetas', { searchParams: params });

export const createReceta = (data: Partial<Receta>) =>
  api<Receta>('/api/recetas', { method: 'POST', body: JSON.stringify(data) });
