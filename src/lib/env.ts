import {z} from "zod"

const envSchema = z.object({
    client_id: z.string(),
    client_secret: z.string()
})

export const env = envSchema.parse({
    client_id: process.env.client_id,
    client_secret: process.env.client_secret
})