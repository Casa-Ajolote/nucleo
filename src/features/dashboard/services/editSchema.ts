import { z } from 'zod'

export const editItemSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .max(120, 'Máximo 120 caracteres'),
  category: z.string().nullable(),
  tags: z.array(z.string()),
  folder_id: z.string().nullable(),
})

export type EditItemSchema = z.infer<typeof editItemSchema>
