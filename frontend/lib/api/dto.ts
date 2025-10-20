export type ID = number;

export type Especialidad = {
  id: ID;
  nombre: string;
  created_at?: string;
};

export type Paciente = {
  id: ID;
  dni: string;
  nombre: string;
  apellido: string;
  mail?: string;
  telefono?: string;
  fecha_nacimiento?: string; // YYYY-MM-DD
  created_at?: string;
};

export type Medico = {
  id: ID;
  nombre: string;
  apellido: string;
  matricula?: string;
  mail?: string;
  especialidad_id: ID;
  created_at?: string;
};

export type EstadoTurno = 'asignado' | 'cancelado_medico' | 'cancelado_paciente' | 'atendido' | 'ausente';

export type Turno = {
  id: ID;
  paciente_id: ID;
  medico_id: ID;
  fecha_hora: string; // ISO
  duracion_min: number;
  estado: EstadoTurno; // denormalizado para el front
  estado_id: ID;       // MSW lo maneja igualmente
  motivo?: string;
  observaciones?: string;
  created_at?: string;
};

export type AgendaMedico = {
  id: ID;
  medico_id: ID;
  dia_semana: number; // 0..6
  hora_inicio: string; // "09:00"
  hora_fin: string;    // "13:00"
  duracion_min: number;
  created_at?: string;
};

export type Receta = {
  id: ID;
  turno_id?: ID | null;
  medico_id: ID;
  paciente_id: ID;
  fecha_emision: string; // YYYY-MM-DD
  indicaciones?: string;
};

export type Page<T> = {
  data: T[];
  page: number;
  size: number;
  total: number;
};
