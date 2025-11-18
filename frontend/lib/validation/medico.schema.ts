import { z } from 'zod';

export const medicoSchema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  matricula: z.string().optional().or(z.literal('')),
  mail: z.string().email().optional().or(z.literal('')),
  especialidad_id: z.coerce.number().int().positive(),
});

export type MedicoInput = z.infer<typeof medicoSchema>;
