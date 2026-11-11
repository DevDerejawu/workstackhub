import { eq, and, isNull, gt, desc, count,inArray } from "drizzle-orm";
import { db } from "@/db/index.js";
import { users, emailLogs, type User, type EmailLog } from "@/db/tables/index.js";
// Minimal user and log data  token validation
type TokenUserMinimal = Pick<User, 'id' | 'email' | 'firstName' | 'isVerified' | 'isLocked' | 'adminLockedUntil' | 'deletedAt'>;
type LogMinimal = Pick<EmailLog, 'id' | 'type' | 'tokenHash' | 'expiresAt' | 'status'>

//  token lookup
type TokenLookupResult = {
  user: TokenUserMinimal;
  log:LogMinimal
};

export class UserModel {
   static async createUserWithVerification(
    userData: Omit<AppType.AuthSchemaType['Register'], "password"> & { passwordHash: string },
    tokenHash: string,
    expiresAt: Date,
  ): Promise<Pick<User, 'id' | 'lastName' |"firstName" | 'email'>>{
    
      return await db.transaction(async (tx) => {
      // 1. Insert user
      const [user] = await tx
        .insert(users)
        .values(userData)
        .returning({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        });

     
      // 3. Insert email log
      await tx.insert(emailLogs).values({
        userId: user.id,
        email: user.email,
        type: 'verification',
        tokenHash,
        expiresAt,
        status: 'pending',
      });

      return user;
    });
    
  }


  static async findById(id: string): Promise<TokenUserMinimal | null> {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        isVerified: users.isVerified,
        isLocked: users.isLocked,
        adminLockedUntil: users.adminLockedUntil,
        deletedAt: users.deletedAt,
      })
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)));
    return user || null;
  }

  static async findByEmail(email: string): Promise<Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'isVerified' | 'isLocked' | 'adminLockedUntil' | 'deletedAt' | 'passwordHash'>| null> {
    const [user] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName:users.lastName,
        email: users.email,
        isVerified: users.isVerified,
        isLocked: users.isLocked,
        adminLockedUntil: users.adminLockedUntil,
        deletedAt: users.deletedAt,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email));
    return user || null;
  }

  static async update(id: string, data: Partial<User>): Promise<void> {
    await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  // ---------- Token Lookup Methods ----------

  private static async findTokenLog(
    tokenHash: string,
    type: EmailLog['type'],
    includeDeleted: boolean = false,
    status:EmailLog['status'][]
  ): Promise<TokenLookupResult | null> {
    const conditions = [
      eq(emailLogs.tokenHash, tokenHash),
      eq(emailLogs.type, type),
      inArray(emailLogs.status, status),
      gt(emailLogs.expiresAt, new Date()),
      
    ];

    if (!includeDeleted) {
      conditions.push(isNull(users.deletedAt));
    }

    const result = await db
      .select({
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          isVerified: users.isVerified,
          isLocked: users.isLocked,
          adminLockedUntil: users.adminLockedUntil,
          deletedAt: users.deletedAt,
        },
        log: {
          id: emailLogs.id,
          type: emailLogs.type,
          tokenHash: emailLogs.tokenHash,
          expiresAt: emailLogs.expiresAt,
          status: emailLogs.status,
        },
      })
      .from(emailLogs)
      .innerJoin(users, eq(emailLogs.userId, users.id))
      .where(and(...conditions))
      .limit(1);

    return result.length ? result[0] : null;
  }

  static async findByVerificationToken(token: string, status:EmailLog['status'][]=['sent']): Promise<TokenLookupResult | null> {
    return this.findTokenLog(token, 'verification', false, status);
  }

  static async findByResetToken(token: string, status:EmailLog['status'][]=['sent']): Promise<TokenLookupResult | null> {
    return this.findTokenLog(token, 'password_reset', false, status);
  }

  static async findByRestoreToken(token: string, status:EmailLog['status'][]=['sent']): Promise<TokenLookupResult | null> {
    return this.findTokenLog(token, 'account_restore', true, status); 
  }
  static async findByTokenForJobProcessor(token:string, type:EmailLog['type'], status:EmailLog['status'][]=['pending']){
    return this.findTokenLog(token, type, true, status);
  }
  
  // ---------- Email Log Management ----------
  static async createEmailLog(
    userId: string,
    email: string,
    type: EmailLog['type'],
    tokenHash: string,
    expiresAt: Date,
  ): Promise<{ id: string }> {
    const [log] = await db
      .insert(emailLogs)
      .values({
        userId,
        email,
        type,
        tokenHash,
        expiresAt,
        status: 'pending',
      })
      .returning({ id: emailLogs.id });
    return log;
  }

//update email_logs
  static async updateEmailLog(
    logId: string,
    userId:string,
    updateData: Partial<EmailLog>,
  ): Promise<void> {
    
    await db.update(emailLogs)
      .set(updateData)
      .where(and(eq(emailLogs.id, logId), eq(emailLogs.userId, userId)));
  }

  
  static async countRecentEmailLogs(
    userId: string,
    type: EmailLog['type'],
    since: Date,
  ): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.userId, userId),
          eq(emailLogs.type, type),
          gt(emailLogs.createdAt, since)
        )
      );
    return result?.count ?? 0;
  }

  
  static async findActiveTokenLog(
    userId: string,
    type: EmailLog['type'],
  ): Promise<Pick<EmailLog, 'id' | 'status' | 'expiresAt'> | null> {
    const [log] = await db
      .select({
        id: emailLogs.id,
        status: emailLogs.status,
        expiresAt: emailLogs.expiresAt,
      })
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.userId, userId),
          eq(emailLogs.type, type),
          eq(emailLogs.status, 'sent'),
          gt(emailLogs.expiresAt, new Date())
        )
      )
      .orderBy(desc(emailLogs.createdAt))
      .limit(1);
    return log || null;
  }


 

static async findLatestTokensByEmail(
  email: string,
  types: EmailLog["type"][]
): Promise<
  Pick<EmailLog, "id" | "status" | "expiresAt" | "tokenHash" | "type" | 'attempts'>[]
> {
  const result = await db
    .selectDistinctOn([emailLogs.type], {
      id: emailLogs.id,
      status: emailLogs.status,
      expiresAt: emailLogs.expiresAt,
      tokenHash: emailLogs.tokenHash,
      type: emailLogs.type,
      attempts:emailLogs.attempts
    })
    .from(emailLogs)
    .where(
      and(
        eq(emailLogs.email, email),
        inArray(emailLogs.type, types),
        gt(emailLogs.expiresAt, new Date())
      )
    )
    .orderBy(
      emailLogs.type,
      desc(emailLogs.createdAt)
    );

  return result;
}
}