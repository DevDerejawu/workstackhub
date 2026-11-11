import { pgTable, text, uuid, timestamp, integer, index} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users.js'

export const emailLogs = pgTable(
  'email_logs',
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    
    email: text().notNull(), 
    
    type: text().notNull()
      .$type<'verification' | 'password_reset' | 'account_restore' | 'security_alert' | 'welcome'| 'invitation'>(),
    
    tokenHash: text().notNull().unique('email_logs_token_hash_unique'),
    
    expiresAt: timestamp({ withTimezone: true, mode: 'date' }).notNull(),
    
    status: text().notNull().default('pending')
      .$type<'pending' | 'sent' | 'failed' | 'used' | 'expired'>(),
    
    attempts: integer().notNull().default(0),
    
    lastAttemptAt: timestamp({ withTimezone: true, mode: 'date' }),
    
    errorMessage: text(),
    
    jobId: text(),
    
    usedAt: timestamp({ withTimezone: true, mode: 'date' }),
    
    createdAt: timestamp({ withTimezone: true, mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    
    updatedAt: timestamp({ withTimezone: true, mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    tokenHashIdx: index('idx_email_logs_token_hash').on(table.tokenHash),
    userIdTypeIdx: index('idx_email_logs_user_type').on(table.userId, table.type),
    statusIdx: index('idx_email_logs_status').on(table.status),
    expiresIdx: index('idx_email_logs_expires').on(table.expiresAt),
  })
)

export type EmailLog = typeof emailLogs.$inferSelect
export type NewEmailLog = typeof emailLogs.$inferInsert