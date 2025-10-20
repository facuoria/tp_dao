import { z } from 'zod';

export const recetaSchema = z.object({
  turno_id: z.coerce.number().int().optional().nullable(),
  medico_id: z.coerce.number().int().positive(),
  paciente_id: z.coerce.number().int().positive(),
  fecha_emision: z.string().min(10), // YYYY-MM-DD
  indicaciones: z.string().optional().or(z.literal('')),
});

export type RecetaInput = z.infer<typeof recetaSchema>;
