import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { errorLogger } from '@/utils/error.logger.js'
async function main() {
  const isProduction = process.env.NODE_ENV === 'production'
  errorLogger.info('🚀 Starting database migration...')
  errorLogger.info(`📌 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`)
  errorLogger.info(`📌 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]}`)
errorLogger.info(`📌 Database: ${process.env.DATABASE_URL}`)

  if (isProduction) {
    errorLogger.info('⚠️  WARNING: Running migrations on PRODUCTION database!')
    errorLogger.info('📌 Press Ctrl+C to cancel, or wait 5 seconds to continue...')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1, 
  })

  const db = drizzle(pool)

  errorLogger.info('📦 Applying migrations...')

  try {
    await migrate(db, { migrationsFolder: 'src/db/migrations' })
    errorLogger.info('✅ Migrations completed successfully!')
  } catch (error) {
    throw error
  } finally {
    await pool.end()
  }

  process.exit(0)
}

main().catch((err) => {
  errorLogger.error('❌ Migration failed: '+ err)
  process.exit(1)
})