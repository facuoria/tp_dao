import { z } from 'zod';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const toMinutes = (time: string) => {
  const [hh = '0', mm = '0'] = time.split(':');
  return Number(hh) * 60 + Number(mm);
};

export const agendaSchema = z.object({
  dia_semana: z.coerce.number().int().min(0).max(6),
  hora_inicio: z.string().regex(TIME_REGEX, 'Hora inv\u00e1lida (usar HH:MM)'),
  hora_fin: z.string().regex(TIME_REGEX, 'Hora inv\u00e1lida (usar HH:MM)'),
  duracion_min: z.coerce.number().int().positive('La duraci\u00f3n debe ser mayor a 0'),
}).refine(({ hora_inicio, hora_fin }) => toMinutes(hora_inicio) < toMinutes(hora_fin), {
  message: 'La hora fin debe ser mayor a la hora de inicio',
  path: ['hora_fin'],
}).refine(
  ({ hora_inicio, hora_fin, duracion_min }) =>
    duracion_min <= toMinutes(hora_fin) - toMinutes(hora_inicio),
  { message: 'La duraci\u00f3n debe caber entre inicio y fin', path: ['duracion_min'] },
);

export type AgendaInput = z.infer<typeof agendaSchema>;
