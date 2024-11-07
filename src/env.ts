import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    DATABASE_LOCAL_URL: z.string().min(1),
    NODE_ENV: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_LOCAL_URL: process.env.DATABASE_LOCAL_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
})
