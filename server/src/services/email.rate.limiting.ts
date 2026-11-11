import { redisApi } from "@/utils/ioredis.js";
type EmailRateLimitType = 
  | "security_alert" 
  | "verification" 
  | "password_reset" 
  | "account_restore" 
  | "invitation";
const emailRateLimitConfigMapping: Record<EmailRateLimitType, { maxEmail: number; ttlSeconds: number }> ={
  security_alert:{
    maxEmail: 2,
    ttlSeconds: 60 * 60,
  },
  verification: {
    maxEmail: 20,
    ttlSeconds: 24 * 60 * 60,
  },
  password_reset: {
    maxEmail: 3,
    ttlSeconds: 24 * 60 * 60,
  },
  account_restore: {
    maxEmail: 2,
    ttlSeconds: 24 * 60 * 60,
  },
  invitation: {
    maxEmail: 20,
    ttlSeconds: 24 * 60 * 60,
  }
}
export class EmailRateLimiting {
  private readonly redis = redisApi();
  async checkAndIncrementRateLimit(
    type: EmailRateLimitType,
    email: string,
  ): Promise<boolean> {
    const key = `email:rate:limit:${type}:${email}`;
    const current = await this.redis.get(key);
    const maxEmail = emailRateLimitConfigMapping[type]['maxEmail'];
    const ttlSeconds = emailRateLimitConfigMapping[type]['ttlSeconds']
    if (current && parseInt(current, 10) >= maxEmail) {
      return false;
    }
    
    // increment and set TTL
    const pipe = this.redis.pipeline();
    pipe.incr(key);
    pipe.expire(key, ttlSeconds);
    await pipe.exec();
    return true;
  }

  async resetRateLimit(type: EmailRateLimitType, email: string): Promise<void> {
    const key = `email:rate:limit:${type}:${email}`;
    await this.redis.del(key);
  }
}

export const emailRateLimitingInstance = new EmailRateLimiting();