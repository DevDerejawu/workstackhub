import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './tables/index.js'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle({
  client: pool,
  schema: schema,
  casing: 'snake_case', 
})

export type Db = typeof db