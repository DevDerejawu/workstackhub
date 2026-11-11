export const constraintMaps: Record<string, string> = {
  // Users table – unique indexes with WHERE clauses
  'users_active_email_unique':
    'This email address is already registered to an active account.',
  'users_soft_deleted_email_unique':
    'This email address is associated with a deleted account. Please contact support.',
  'users_unverified_email':
    'This email address is already registered but not yet verified. Please check your inbox or request a new verification email.',

  // Email logs table – unique constraints
  'email_logs_token_hash_unique':
    'This token has already been used or is invalid. Please request a new one.',
  'idx_email_logs_active_unique':
    'Email is already sent. Please check your inbox, but it may take a few minutes.',
};