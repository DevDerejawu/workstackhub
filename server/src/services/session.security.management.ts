import { UserModel } from "@/models/auth.model.js";
import { emailQueue } from "@/utils/email.queue.js";
import { getDeviceFingerprint } from "@/utils/fingerPrint.js";
import { redisApi } from "@/utils/ioredis.js";
import { type EmailTemplateParams } from "../email.templates/security.alert.js";
import { emailRateLimitingInstance } from "./email.rate.limiting.js";
import { generateToken, hashToken } from "@/utils/manage.crypto.js";

export class SessionManagement {
  private readonly refreshExpirySeconds = Number(
    process.env.JWT_REFRESH_EXPIRES_IN,
  );
  private readonly redis = redisApi();

  async createSession(
    req: Req,
    decoded: AppType.AuthSchemaType["TokenPayload"],
  ): Promise<void> {
    const deviceFingerprint = getDeviceFingerprint(req);
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip || req.socket?.remoteAddress || "";
    const sessionKey = `session:${decoded.tokenId}`;
    const userSetKey = `user:devices:${decoded.userId}`;
    const oldSession = await this.getSessionMetadata(decoded.tokenId);
    const sessionData: AppType.AuthSchemaType["sessionDataType"] = {
      deviceFingerprint,
      userId: decoded.userId,
      userAgent,
      ipAddress,
      tokenId: decoded.tokenId,
      isLocked: "false",
      createdAt: oldSession?.createdAt || new Date().toISOString(),
    };

    // Instantiate the multi (transactional) pipeline.
    const transaction = this.redis.multi();
    transaction.hset(
      sessionKey,
      sessionData as Record<string, string | number>,
    );
    transaction.expire(sessionKey, this.refreshExpirySeconds);
    transaction.sadd(userSetKey, decoded.tokenId);

    await transaction.exec();
  }

  
   // Get session metadata by tokenId.
  async getSessionMetadata(
    tokenId: string,
  ): Promise<AppType.AuthSchemaType["sessionDataType"] | null> {
    const data = (await this.redis.hgetall(
      `session:${tokenId}`
    )) as AppType.AuthSchemaType["sessionDataType"];

    if (Object.keys(data).length === 0) {
      return null;
    }

    return data;
  }
   // Remove a specific session (logout from one device).
  async removeSession(userId: string, tokenId: string): Promise<void> {
    const pipeline = this.redis.pipeline();
    pipeline.srem(`user:devices:${userId}`, tokenId);
    pipeline.del(`session:${tokenId}`);
    await pipeline.exec();
  }

  
   // Revoke all sessions for a user (logout from all devices).
  async revokeAllSessions(userId: string): Promise<string[]> {
    const pipeline = this.redis.pipeline();
    const userSetKey = `user:devices:${userId}`;
    const tokenIds = await this.redis.smembers(userSetKey);
    if (tokenIds.length > 0) {
      for (const tokenId of tokenIds) {
        pipeline.del(`session:${tokenId}`);
      }
      pipeline.del(userSetKey);

      await pipeline.exec();
    }
    return tokenIds;
  }

   //Get the number of active sessions (devices) for a user.
  async getSessionCount(userId: string): Promise<number> {
    const count = await this.redis.scard(`user:devices:${userId}`);
    return count;
  }
   // Get all active sessions for a user.
  async getUserSessions(
    userId: string,
  ): Promise<AppType.AuthSchemaType["sessionDataType"][]> {
    const userSetKey = `user:devices:${userId}`;
    const tokenIds = await this.redis.smembers(userSetKey);

    const sessions: AppType.AuthSchemaType["sessionDataType"][] = [];

    for (const tokenId of tokenIds) {
      const session = await this.getSessionMetadata(tokenId);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  // LOGIN ATTEMPTS
    async setLoginAttempts(userId: string, loginAttempts: number): Promise<void> {
    await this.redis.set(`loginAttempts:${userId}`, loginAttempts);
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    await this.redis.del(`loginAttempts:${userId}`);
  }

  async getLoginAttempts(userId: string): Promise<number> {
    const attempts = await this.redis.get(`loginAttempts:${userId}`);
    return attempts ? Number(attempts) : 0;
  }

  async incrLoginAttempts(userId: string): Promise<void> {
    await this.redis.incr(`loginAttempts:${userId}`);
  }

  // ACCOUNT LOCKING
  async lockAccountDueToSuspiciousActivity(userId: string): Promise<void> {
    await this.redis.set(`securityLock:${userId}`, userId, "EX", 3600);
    await this.revokeAllSessions(userId);
  }

   //* Lock an account for 60 minutes due to too many failed login attempts.
  async lockAccountDueToLoginAttempts(userId: string): Promise<void> {
    await this.redis.set(`lockAccount:${userId}`, userId, "EX", 3600);
    await this.revokeAllSessions(userId);
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const [loginLock, securityLock] = await Promise.all([
      this.redis.get(`lockAccount:${userId}`),
      this.redis.get(`securityLock:${userId}`),
    ]);

    return !!(loginLock || securityLock);
  }

  async unlockAccount(userId: string): Promise<void> {
    const pipeline = this.redis.pipeline();
    pipeline.del(`lockAccount:${userId}`);
    pipeline.del(`securityLock:${userId}`);
    await pipeline.exec();
  }

  
  async queueSecurityAlert(
    userId: string,
    alertType: EmailTemplateParams["type"],
    req: Req,
    customMessage?: string,
    config?:{email:string, name:string}
  ): Promise<void> {
    let user;
    // 2. Fetch user details.
    if(!config){
       user= await UserModel.findById(userId);
    }
    else{
      user={
        email:config.email,
        firstName:config.name
      }
    }
    if (!user) return; 
    
    const isNotRateLimitReached = await emailRateLimitingInstance.checkAndIncrementRateLimit('security_alert', user.email)

    if(!isNotRateLimitReached) return;

    // 3. Generate a secure token for password reset (used in email).
    const token = generateToken();
    const hashedToken = hashToken(token);
    await UserModel.createEmailLog(userId, user.email, "security_alert", hashedToken, new Date(Date.now() + 24 * 60 * 60 * 1000));
    // 4. Build device info.
    const deviceInfo: EmailTemplateParams["deviceInfo"] = {
      ip: req.ip || req.socket?.remoteAddress || "Unknown",
      userAgent: req.headers["user-agent"] || "Unknown",
      timestamp: new Date().toISOString(),
    };

    // 5. Queue the email.
    await emailQueue.add("security-alert", {
      type: "security-alert",
      to: user.email,
      name: user.firstName,
      token,
      alertType,
      deviceInfo,
      customMessage,
    });

    
  }

 
}