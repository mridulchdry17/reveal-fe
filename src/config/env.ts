import { z } from 'zod'

const schema = z.object({
  // Production builds must set it (.env.production); only dev falls back to the local API.
  VITE_API_URL: import.meta.env.PROD ? z.url() : z.url().default('http://localhost:8000'),
  VITE_COLLEGE_NAME: z.string().min(1).default('your college'),
  // Where students write to reclaim an enrollment number or delete their data.
  // Contact lines are hidden until this is set.
  VITE_CONTACT_EMAIL: z.union([z.email(), z.literal('')]).default(''),
})

export const env = schema.parse(import.meta.env)
