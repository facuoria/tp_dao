import { z } from 'zod';

const DNI_REGEX = /^\d{7,8}$/;
const PHONE_REGEX = /^\d{7,15}$/; // solo dígitos (AR u otros, rango amplio)
const today = new Date(); today.setHours(0,0,0,0);

export const pacienteSchema = z.object({
  dni: z.string().trim().regex(DNI_REGEX, 'DNI inválido: usar solo dígitos (7–8)'),

  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),

  mail: z.string().email('Email inválido').optional().or(z.literal('')),

  // Teléfono: opcional. Si se informa, debe ser solo dígitos y 7–15 caracteres
  telefono: z.string().optional().or(z.literal('')).refine(
    (v) => !v || PHONE_REGEX.test(v),
    { message: 'Teléfono inválido: usar solo dígitos (7–15)' }
  ),

  fecha_nacimiento: z.string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || new Date(v).setHours(0,0,0,0) <= today.getTime(), {
      message: 'La fecha no puede ser futura',
    }),
});

export type PacienteInput = z.infer<typeof pacienteSchema>;
