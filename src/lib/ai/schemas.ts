import { z } from 'zod'

export const itemAnalysisSchema = z.object({
  title: z.string().max(120),
  summary: z.string().max(500),
  category: z.enum(['Development', 'AI', 'Design', 'Business', 'Research', 'Personal', 'Other']),
  tags: z.array(z.string().max(30)).max(7),
})

export type ItemAnalysis = z.infer<typeof itemAnalysisSchema>
