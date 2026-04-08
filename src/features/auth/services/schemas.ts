import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Este campo es obligatorio')
    .email('Ingresa un email válido'),
  password: z.string().min(1, 'Este campo es obligatorio'),
})

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Este campo es obligatorio')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export type LoginSchema = z.infer<typeof loginSchema>
export type SignupSchema = z.infer<typeof signupSchema>
