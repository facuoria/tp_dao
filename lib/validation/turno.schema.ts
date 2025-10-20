import { z } from 'zod';

export const turnoSchema = z.object({
  paciente_id: z.coerce.number().int().positive(),
  medico_id: z.coerce.number().int().positive(),
  fecha_hora: z.string().min(10), // ISO
  duracion_min: z.coerce.number().int().positive().default(30),
  motivo: z.string().optional().or(z.literal('')),
  observaciones: z.string().optional().or(z.literal('')),
});

export type TurnoInput = z.infer<typeof turnoSchema>;
