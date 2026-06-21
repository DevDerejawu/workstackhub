import { 
  pgTable, 
  text, 
  uuid, 
  timestamp, 
  boolean, 
  integer,
  index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Users Table
export const users = pgTable(
  'users',
  {
    // Primary Key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    
    // Basic Info
    email: text('email')
      .notNull()
      .unique('users_email_unique'),  // ← Explicit constraint name!
    
    passwordHash: text('password_hash')
      .notNull(),
    
    firstName: text('first_name')
      .notNull(),
    
    lastName: text('last_name')
      .notNull(),
    
    avatarUrl: text('avatar_url'),
    
    // Email Verification
    isVerified: boolean('is_verified')
      .default(false),
    
    verificationToken: text('verification_token')
      .unique('users_verification_token_unique'),  // ← Explicit constraint name!
    
    verificationTokenExpiresAt: timestamp('verification_token_expires_at', {
      withTimezone: true,
      mode: 'date',
    }),
    
    // Password Reset
    resetToken: text('reset_token')
      .unique('users_reset_token_unique'),  // ← Explicit constraint name!
    
    resetTokenExpiresAt: timestamp('reset_token_expires_at', {
      withTimezone: true,
      mode: 'date',
    }),
    
    // Account Security
    isActive: boolean('is_active')
      .default(true),
    
    isLocked: boolean('is_locked')
      .default(false),
    
    failedLoginAttempts: integer('failed_login_attempts')
      .default(0),
    
    lockedUntil: timestamp('locked_until', {
      withTimezone: true,
      mode: 'date',
    }),
    
    // Metadata
    lastLoginAt: timestamp('last_login_at', {
      withTimezone: true,
      mode: 'date',
    }),
    
    lastLoginIp: text('last_login_ip'),
    
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'date',
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    
    deletedAt: timestamp('deleted_at', {
      withTimezone: true,
      mode: 'date',
    }),
  },
  (table) => ({
    // Indexes
    emailIdx: index('idx_users_email').on(table.email),
    verificationTokenIdx: index('idx_users_verification_token').on(table.verificationToken),
    resetTokenIdx: index('idx_users_reset_token').on(table.resetToken),
    createdAtIdx: index('idx_users_created_at').on(table.createdAt),
  })
)

// Export type for TypeScript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert