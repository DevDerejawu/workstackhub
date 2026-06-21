import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  const isProduction = process.env.NODE_ENV === 'production'
  console.log('🚀 Starting database migration...')
  console.log(`📌 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`)
  console.log(`📌 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]}`)

  if (isProduction) {
    console.log('⚠️  WARNING: Running migrations on PRODUCTION database!')
    console.log('📌 Press Ctrl+C to cancel, or wait 5 seconds to continue...')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1, 
  })

  const db = drizzle(pool)

  console.log('📦 Applying migrations...')

  try {
    await migrate(db, { migrationsFolder: 'src/db/migrations' })
    console.log('✅ Migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await pool.end()
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})