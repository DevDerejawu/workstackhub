import { emailQueue } from "@/utils/email.queue.js";
import { generateToken, hashToken } from "@/utils/manage.crypto.js";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { UserModel } from "@/models/auth.model.js";
import { AppError, ErrorFactory } from "@/errors/app.error.js";
import { TokenService } from "@/utils/token.service.js";
import {
  ERROR_CODES,
  HTTP_STATUS,
} from "@/errors/constants/error.constants.js";
import { emailRateLimitingInstance } from "./email.rate.limiting.js";
import { User } from "@/db/tables/users.js";

export class AuthService extends TokenService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly RESET_DURATION_HOURS = 1;
  private readonly RESTORE_DURATION_HOURS = 24;
  private readonly VERIFICATION_DURATION_HOURS = 24;
  
  // REGISTER
 async register(data: AppType.AuthSchemaType["Register"]): Promise<null> {
  // 1. Generate token and hash password
  const plainToken = generateToken();
  const tokenHash= hashToken(plainToken);
  const passwordHash = await bcrypt.hash(data.password, 12);
  const expiresAt = new Date(Date.now() + this.VERIFICATION_DURATION_HOURS * 3600000);

  // 2. Create user + email log in one transaction
  const user = await UserModel.createUserWithVerification(
    {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      passwordHash,
    },
    tokenHash,
    expiresAt
  );

  // 3. Queue verification email
  await emailQueue.add("verification", {
    type: "verification",
    to: user.email,
    name: `${user.firstName} ${user.lastName}`,
    token: plainToken,
  });

  return null;
}

  //  LOGIN  
  async login(data: AppType.AuthSchemaType["Login"], res: Res, req: Req): Promise<void> {
    const { email, password } = data;
    const ip = req.ip || "Unknown";

    // Step 1: Check if already authenticated
    try {
      const decoded = await this.authenticateAndRefresh(
        req.cookies?.accessToken,
        req.cookies?.refreshToken,
        res,
        req
      );
      if (decoded) {
        throw new AppError(
          "You are already logged in.",
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.UNAUTHORIZED
        );
      }
    } catch (err) {
      // If it's an unauthenticated error, that's expected here - it means the
      // user is not currently logged in, so let them proceed to login.
      if (!(err instanceof AppError && err.code === ERROR_CODES.UNAUTHENICATED && err.statusCode === HTTP_STATUS.UNAUTHORIZED)) {
        throw err;
      }
    }

    // Step 2: Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw ErrorFactory.unauthorized("Invalid email or password.");
    }

    // Step 3: Check if the account is locked due to security reasons
    const isAccountLockedWithSecurityIssues = await this.isAccountLocked(user.id);
    if (isAccountLockedWithSecurityIssues) {
      throw ErrorFactory.unauthorized("This account is locked due to security issues.");
    }

    // Step 4: Check Redis login attempts
    const attempts = await this.getLoginAttempts(user.id);
    if (attempts >= this.MAX_FAILED_ATTEMPTS) {
      await this.lockAccountDueToLoginAttempts(user.id);
      await this.revokeAllSessions(user.id);
      this.clearTokens(res);
      throw ErrorFactory.unauthorized("This account is temporarily locked.");
    }

    // Step 5: Check if account is admin-locked
    const isAccountLockedWithAdmin = user.isLocked && user.adminLockedUntil && user.adminLockedUntil > new Date();

    if (isAccountLockedWithAdmin) {
      throw ErrorFactory.unauthorized("This account is locked by an administrator.");
    }

    // Step 6: Validate password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
  // Increment attempts in Redis
  await this.incrLoginAttempts(user.id);
  const newAttempts = attempts + 1;
  if (newAttempts >= this.MAX_FAILED_ATTEMPTS) {
    // Lock account in Redis
    await this.lockAccountDueToLoginAttempts(user.id);
    
    // Generate a password-reset token and store it in email_logs to notify the real user.
    await this.queueSecurityAlert(user.id, "ACCOUNT_LOCKED", req,  "Too many failed login attempts. Account locked for 60 minutes.",{email:user.email, name:user.firstName});
    const resetToken = generateToken();
    const resetTokenExpiresAt = new Date(Date.now() + this.RESET_DURATION_HOURS * 3600000);
    await UserModel.createEmailLog(
      user.id,
      user.email,
      'password_reset',
      resetToken,
      resetTokenExpiresAt
    );
    
    // Queue security alert email (with the reset token)
    await emailQueue.add("security-alert", {
      type: "security-alert",
      to: user.email,
      name: `${user.firstName}`,
      token: resetToken,
      alertType: "ACCOUNT_LOCKED",
      deviceInfo: {
        ip,
        userAgent: req.headers["user-agent"] || "Unknown",
        timestamp: new Date().toISOString(),
      },
      customMessage: "Too many failed login attempts. Account locked for 30 minutes.",
    });

    throw ErrorFactory.unauthorized("Account locked due to too many failed attempts.");
  }
  throw ErrorFactory.unauthorized("Invalid email or password.");
}

    // Step 7: Check email verification
    if (!user.isVerified) {
    const active = await UserModel.findActiveTokenLog(user.id, 'verification');
    if (active) {
      const remainingMs = active.expiresAt.getTime() - Date.now();
      const hours = Math.floor(remainingMs / 3600000);
      const minutes = Math.floor((remainingMs % 3600000) / 60000);
      const timeMessage =
        hours > 0 ? `${hours}h ${minutes}m` : minutes > 0 ? `${minutes}m` : "less than a minute";
      throw new AppError(
        `Please verify your email. The verification link expires in ${timeMessage}.`,
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.UNVERIFIED_EMAIL,
        {expiresIn:remainingMs}
      );
    }
    // No active token
    throw new AppError(
      "Email not verified. Please request a new verification link.",
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.UNVERIFIED_EMAIL,
      { user:{email:user.email, firstName:user.firstName}}
    );
  }

    // Step 8: Check soft deletion
    if (user.deletedAt) {
      throw new AppError(
        "Account is deleted. You can restore it to regain access.",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.RECOVER_ACCOUNT,
        { id: user.id }
      );
    }

    // Step 9: Reset login attempts in Redis 
    if (attempts > 0) {
      await this.setLoginAttempts(user.id, 0);
    }

    // Step 10: Generate tokens and create session
    const newTokenId = randomUUID();
    await this.generateAndSetTokens(
      { userId: user.id, tokenId: newTokenId },
      req,
      res
    );
  }

  // LOGOUT
  async logout(res: Res, user:{id:string, tokenId:string}): Promise<void> {
    await this.removeSession(user.id, user.tokenId);
    this.clearTokens(res);
  }
  // VERIFY EMAIL
  async verifyEmail(req: Req, res: Res): Promise<void> {
  const { token } = req.body;
  console.log('plaintoken', token);
  console.log('Hahes token', hashToken(token))

  // 1. Look up the token in email_logs
  const result = await UserModel.findByVerificationToken(hashToken(token));
  if (!result) {
    throw ErrorFactory.badRequest("Invalid or expired verification tokennk.");
  }
  const { user, log } = result;
// 2. Update user isVerified to true
  await UserModel.update(user.id, {
    isVerified: true,
  });

  // 3. Mark the token as used
  await UserModel.updateEmailLog(log.id, user.id, {status: "used"});

  // 4. Reset the rate limit for verification 
  await emailRateLimitingInstance.resetRateLimit('verification', user.email);

  // 5. Generate tokens and create session
  const newTokenId = randomUUID();
  await this.generateAndSetTokens(
    { userId: user.id, tokenId: newTokenId },
    req,
    res
  );
}

  
  // FORGOT PASSWORD
 async forgotPassword(req: Req): Promise<string | null> {
  const user = await UserModel.findByEmail(req.body.email);
  if (!user) {
    return null;
  }
  const allowed = await emailRateLimitingInstance.checkAndIncrementRateLimit(
    'password_reset',
    user.email,
  );

  if (!allowed) {
     throw new AppError('Too many password reset requests. Please try again later.', HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODES.EMAIL_RATE_LIMIT_EXCEEDED);
  }

  // Admin lock
  if (user.isLocked && user.adminLockedUntil && user.adminLockedUntil > new Date()) {
    throw ErrorFactory.unauthorized("This account is locked by an administrator.");
  }

  const emailLogs = await UserModel.findLatestTokensByEmail(user.email, [
    'password_reset',
    'account_restore',
  ]);
  const resetLog = emailLogs.find((log) => log.type === 'password_reset');
  const accountRetoreLog = emailLogs.find((log) => log.type === 'account_restore');
  
  if(resetLog && (resetLog.status === 'sent' || resetLog.status==='pending')){
    throw ErrorFactory.unauthorized("A password reset link has already been sent to this email address, please check your inbox, it maight take a few minutes.");
  }

  // Security lock (Redis)
  if (await this.isAccountLocked(user.id)) {
    // Generate reset token with urgent message
    const plainToken = generateToken();
    const expiresAt = new Date(Date.now() + this.RESET_DURATION_HOURS * 3600000);
    if(resetLog && resetLog.status === 'failed'){
      await UserModel.updateEmailLog(resetLog.id, user.id, {attempts:resetLog.attempts + 1, lastAttemptAt: new Date(), updatedAt:new Date()})
    }else{
      await UserModel.createEmailLog(user.id, user.email, 'password_reset', hashToken(plainToken), expiresAt);
    }
    
    await emailQueue.add("password-reset", {
      type: "password-reset",
      to: user.email,
      name: user.firstName,
      token: plainToken,
      message: "Your account is locked due to security issues. Resetting your password will unlock it and keep your account secure, as we have detected unusual activity.",
    });
    return null;
  }

  // Not verified – allow reset verify in one link
  if (!user.isVerified) {
    const plainToken = generateToken();
    const expiresAt = new Date(Date.now() + this.RESET_DURATION_HOURS * 3600000);
    if(resetLog && resetLog.status === 'failed'){
      await UserModel.updateEmailLog(resetLog.id, user.id, {attempts:resetLog.attempts + 1, lastAttemptAt: new Date(), updatedAt:new Date()})
    }else{
      await UserModel.createEmailLog(user.id, user.email, 'password_reset', hashToken(plainToken), expiresAt);
    }
    await emailQueue.add("password-reset", {
      type: "password-reset",
      to: user.email,
      name: `${user.firstName} ${user.lastName}`,
      token: plainToken,
      message: "Your email is not verified. Resetting your password will also verify your email.",
    });
    return null;
  }

  if(accountRetoreLog && (accountRetoreLog.status === 'sent' || accountRetoreLog.status==='pending')){
     throw ErrorFactory.unauthorized("A reset link has already been sent to this email address, please check your inbox, it maight take a few minutes.");
  }
  // Soft‑deleted
  if (user.deletedAt) {
    const plainToken = generateToken();
    const expiresAt = new Date(Date.now() + this.RESTORE_DURATION_HOURS * 3600000);
     if(accountRetoreLog && accountRetoreLog.status === 'failed'){
      await UserModel.updateEmailLog(accountRetoreLog.id, user.id, {attempts:accountRetoreLog.attempts + 1, lastAttemptAt: new Date(), updatedAt:new Date(), expiresAt, tokenHash: hashToken(plainToken)});
    }else{
      await UserModel.createEmailLog(user.id, user.email, 'account_restore', hashToken(plainToken), expiresAt);
    }
    await emailQueue.add("account-restore", {
      type: "account-restore",
      to: user.email,
      name: `${user.firstName} ${user.lastName}`,
      token: plainToken,
      config: {
        title: "Restore Account to Reset Password",
        subject: "Restore Your Account to Reset Password",
        message: "Your account is deleted. Restoring it will allow you to reset your password and regain access.",
      },
    });
    return null;
  }

  // Normal reset
  const plainToken = generateToken();
  const expiresAt = new Date(Date.now() + this.RESET_DURATION_HOURS * 3600000);
   if(resetLog && resetLog.status === 'failed'){
      await UserModel.updateEmailLog(resetLog.id, user.id, {attempts:resetLog.attempts + 1, lastAttemptAt: new Date(), updatedAt:new Date(), expiresAt, tokenHash: hashToken(plainToken)})
    }else{
      await UserModel.createEmailLog(user.id, user.email, 'password_reset', hashToken(plainToken), expiresAt);
    }
  await emailQueue.add("password-reset", {
    type: "password-reset",
    to: user.email,
    name: `${user.firstName} ${user.lastName}`,
    token: plainToken,
  });
  return null;
}

  // RESET PASSWORD
 async resetPassword(req: Req, res: Res): Promise<void> {
  const { token, newPassword } = req.body;

  // 1. Look up the token in email_logs 
  const result = await UserModel.findByResetToken(hashToken(token));
  if (!result) {
    throw ErrorFactory.badRequest("Invalid or expired reset token.");
  }
  const { user, log } = result;
  // 2. Hash the new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // 3. Prepare user updates
  const updates: Partial<User> = {
    passwordHash,
    isVerified: true, 
    isLocked: false,
    adminLockedUntil: null,
  };

  // 4. Apply updates
  await UserModel.update(user.id, updates);

  // 5. Mark the reset token as used (and invalidate any other active ones)
  await UserModel.updateEmailLog(log.id, user.id, {status: "used"});

  // 6. Clear Redis locks, login attempts, and all sessions
  await Promise.all([
    this.unlockAccount(user.id),          
    this.resetLoginAttempts(user.id),     
    this.revokeAllSessions(user.id),      
  ]);

  // 7. Reset rate limit for password reset
  await emailRateLimitingInstance.resetRateLimit('password_reset', user.email);

  // 8. Generate new session and tokens
  const newTokenId = randomUUID();
  await this.generateAndSetTokens(
    { userId: user.id, tokenId: newTokenId },
    req,
    res
  );
}

  
  // ACCOUNT RESTORE (send restore link)
async sendRestoreAccountLink(email: string): Promise<null> {
    // 1. Find user
    const user = await UserModel.findByEmail(email);
    if (!user || !user.deletedAt) {
      return null;
    }
    // 2. Admin lock check
    if (user.isLocked && user.adminLockedUntil && user.adminLockedUntil > new Date()) {
      throw ErrorFactory.unauthorized('This account is locked by an administrator.');
    }
    // 3. Rate limiting 
    const allowed = await emailRateLimitingInstance.checkAndIncrementRateLimit(
      'account_restore',
      user.email
    );
    if (!allowed) {
      throw new AppError('Too many restore account requests. Please try again later.', HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODES.EMAIL_RATE_LIMIT_EXCEEDED);
    }

    // 4. Check for existing restore logs
    const existingLogArr = await UserModel.findLatestTokensByEmail(
      user.email,
      ['account_restore']
    );

    const existingLog = existingLogArr[0];

    // If there's already a pending/sent log, block duplicate
    if (existingLog && (existingLog.status === 'sent' || existingLog.status === 'pending')) {
      throw ErrorFactory.unauthorized(
        'A restore link has already been sent to this email. Please check your inbox.'
      );
    }

    // 5. Generate a fresh token
    const plainToken = generateToken();
    const expiresAt = new Date(Date.now() + this.RESTORE_DURATION_HOURS * 3600000);

    // 6. Create or update email log
    if (existingLog && existingLog.status === 'failed') {
      // If the previous attempt failed, increment attempts and update with new token/expiry
      await UserModel.updateEmailLog(existingLog.id, user.id, {
        attempts: existingLog.attempts + 1,
        lastAttemptAt: new Date(),
        tokenHash: hashToken(plainToken),   
        expiresAt: expiresAt,         
        updatedAt: new Date(),
      });
    } else {
      // No existing log or status is not 'failed' – create a fresh log
      await UserModel.createEmailLog(
        user.id,
        user.email,
        'account_restore',
        hashToken(plainToken),
        expiresAt
      );
    }

    // 7. Send restore email via queue
    await emailQueue.add('account-restore', {
      type: 'account-restore',
      to: user.email,
      name: `${user.firstName} ${user.lastName}`,
      token: plainToken,
      config: {
        title: 'Restore Your Account',
        subject: 'Restore Your Account',
        message: 'Click the link below to restore your account and regain access.',
      },
    });

    return null;
  }

  
  // RESTORE ACCOUNT
  async restoreAccount(req: Req, res: Res): Promise<null> {
  const { token, newPassword } = req.body;
  // 1. Look up the restore token in email_logs
  const result = await UserModel.findByRestoreToken(token);
  if (!result) {
    throw ErrorFactory.badRequest("Invalid or expired restore token.");
  }

  const { user, log } = result;

  // 3. Prepare user updates
  const updates: Partial<User> = {
    deletedAt: null,                 
    isVerified: true,                
    isLocked: false,                 
    adminLockedUntil: null,
    passwordHash:newPassword
  };

  // 4. Apply updates
  await UserModel.update(user.id, updates);
  // 5. Mark the restore token as used (and invalidate any other active restore tokens)
  await UserModel.updateEmailLog(log.id, user.id, {status: "used"});

  // 6. Clear Redis locks and reset rate limit
  await Promise.all([
    this.unlockAccount(user.id),                    
    this.resetLoginAttempts(user.id),               
    emailRateLimitingInstance.resetRateLimit('account_restore', user.email),
  ]);

  // 7. Generate new session and tokens
  const newTokenId = randomUUID();
  await this.generateAndSetTokens(
    { userId: user.id, tokenId: newTokenId },
    req,
    res
  );

  return null;
}

  
  // DELETE ACCOUNT (soft delete)
  async deleteAccount(userId: string, res: Res): Promise<void> {
    const isAccountLockedDueToSuspiciousActivity = await this.isAccountLocked(userId);
    if (isAccountLockedDueToSuspiciousActivity) throw ErrorFactory.unauthorized("Account is locked due to suspicious activity.");

    const user = await UserModel.findById(userId);
    
    if (!user) throw ErrorFactory.notFound("User not found.");
    const isAccountLockedWithAdmin = user.isLocked && user.adminLockedUntil && user.adminLockedUntil > new Date();

    if (isAccountLockedWithAdmin) throw ErrorFactory.unauthorized("Account is locked by an administrator.");
    await UserModel.update(userId, { deletedAt: new Date() });
    await this.revokeAllSessions(userId);
    this.clearTokens(res);
  }


  async resendVerification(email: string): Promise<string> {
    // 1. Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return 'If the email  is not verified, email has been sent'
    }
    if (user.isLocked && user.adminLockedUntil && user.adminLockedUntil > new Date()) {
    throw ErrorFactory.unauthorized("This account is locked by an administrator.");
  }
    // 2. If already verified, 
    if (user.isVerified) {
       return 'Email is already verified. You can sign in.' ;
    }

    // 3. Rate limit
    const allowed = await emailRateLimitingInstance.checkAndIncrementRateLimit(
      'verification',
      user.email
    );

    if (!allowed) {
      throw new AppError('Too many verification requests. Please try again later.', HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODES.EMAIL_RATE_LIMIT_EXCEEDED);
    }

    // 4. Check for existing pending/sent logs
    const latestLogArr = await UserModel.findLatestTokensByEmail(
      user.email,
      ['verification']
    );

    const latestLog = latestLogArr[0];
    if (latestLog && (latestLog.status === 'sent' || latestLog.status === 'pending')) {
      
      throw ErrorFactory.unauthorized(
        'A verification link has already been sent to this email. Please check your inbox.'
      );
    }

    // 5. Generate new token
    const plainToken = generateToken();
    const expiresAt = new Date(Date.now() + this.VERIFICATION_DURATION_HOURS * 3600000);

    // 6. Create or update email log
    if (latestLog && latestLog.status === 'failed') {
      // Increment attempts
      await UserModel.updateEmailLog(latestLog.id, user.id, {
        attempts: latestLog.attempts + 1,
        lastAttemptAt: new Date(),
        updatedAt: new Date(),
        expiresAt, 
        tokenHash: hashToken(plainToken)
      });
      
    } else {
      // Create fresh log
      await UserModel.createEmailLog(
        user.id,
        user.email,
        'verification',
        hashToken(plainToken),
        expiresAt
      );
    }

    // 7. Send email via queue
    await emailQueue.add('verification', {
      type: 'verification',
      to: user.email,
      name: `${user.firstName} ${user.lastName}`,
      token: plainToken,
    });
    return   'Verification email sent. Please check your inbox.'
    
  }
}

export const authService = new AuthService();