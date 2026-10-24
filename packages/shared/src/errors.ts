import { z } from 'zod'

export const apiErrorSchema = z.object({
  error: z.string(),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
})

export type ApiError = z.infer<typeof apiErrorSchema>
