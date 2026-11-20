import { z } from 'zod'

const schema = z.object({
  VITE_API_URL: z.url().default('http://localhost:8000'),
  VITE_COLLEGE_NAME: z.string().min(1).default('your college'),
})

export const env = schema.parse(import.meta.env)
