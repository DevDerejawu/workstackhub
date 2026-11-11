import { 
  pgTable, 
  text, 
  uuid, 
  timestamp, 
  boolean, 
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const users = pgTable(
  'users',
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    
    email: text().notNull(),
    passwordHash: text().notNull(),
    firstName: text().notNull(),
    lastName: text().notNull(),
    avatarUrl: text(),
    
    // Email Verification 
    isVerified: boolean().notNull().default(false),
    
    // Account Security
    isActive: boolean().notNull().default(true),
    isLocked: boolean().notNull().default(false),
    adminLockedUntil: timestamp({ withTimezone: true, mode: 'date' }),
    
    // Metadata
    lastLoginAt: timestamp({ withTimezone: true, mode: 'date' }),
    lastLoginIp: text(),
    createdAt: timestamp({ withTimezone: true, mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    deletedAt: timestamp({ withTimezone: true, mode: 'date' }),
  },
  (table) => ({
    emailIdx: index('idx_users_email').on(table.email),
    createdAtIdx: index('idx_users_created_at').on(table.createdAt),
    usersActiveEmailUnique: uniqueIndex('users_active_email_unique')
      .on(table.email)
      .where(sql`${table.deletedAt} IS NULL`),
    usersSoftDeletedUnique: uniqueIndex('users_soft_deleted_email_unique')
      .on(table.email)
      .where(sql`${table.deletedAt} IS NOT NULL`),
    usersUnverifiedEmail: uniqueIndex('users_unverified_email')
      .on(table.email)
      .where(sql`${table.isVerified} IS FALSE`),
  })
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert