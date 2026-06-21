import {
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
  index,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users.js'

// Workspaces Table
export const workspaces = pgTable(
  'workspaces',
  {
    // Primary Key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    
    // Basic Info
    name: text('name')
      .notNull(),
    
    slug: text('slug')
      .notNull()
      .unique('slug_workspaces_unique'),  // ← Explicit constraint name!
    
    type: text('type')
      .default('personal')
      .notNull(),
    
    avatarUrl: text('avatar_url'),
    
    settings: jsonb('settings')
      .default(sql`'{}'::jsonb`),
    
    // Foreign Key: created_by references users.id
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    
    // Metadata
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
    slugIdx: index('idx_workspaces_slug').on(table.slug),
    createdByIdx: index('idx_workspaces_created_by').on(table.createdBy),
    typeIdx: index('idx_workspaces_type').on(table.type),
    createdAtIdx: index('idx_workspaces_created_at').on(table.createdAt),
    
    // Check Constraints (using sql)
    nameCheck: check('name_workspaces_check', sql`length(trim(${table.name})) >= 1`),
    typeCheck: check('type_workspaces_check', sql`${table.type} IN ('personal', 'team')`),
    slugCheck: check('slug_workspaces_check', sql`${table.slug} ~ '^[a-z0-9-]+$'`),
  })
)

// Export types
export type Workspace = typeof workspaces.$inferSelect
export type NewWorkspace = typeof workspaces.$inferInsert