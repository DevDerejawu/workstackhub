import { AppError, ErrorFactory } from "@/errors/app.error.js";
import type { CookieOptions, Request } from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { SessionManagement } from "@/services/session.security.management.js";
import { ERROR_CODES, HTTP_STATUS } from "@/errors/constants/error.constants.js";
import { errorLogger as logger } from "@/utils/error.logger.js";
import { getDeviceFingerprint } from "@/utils/fingerPrint.js";

export class TokenService extends SessionManagement {
  readonly config = {
    accessSecret: this.getEnv("JWT_ACCESS_SECRET"),
    refreshSecret: this.getEnv("JWT_REFRESH_SECRET"),
    accessExpiry: Number(this.getEnv("JWT_ACCESS_EXPIRES_IN")),
    refreshExpiry: Number(this.getEnv("JWT_REFRESH_EXPIRES_IN")),
  };

  private getEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw ErrorFactory.notFound(`Missing required environment variable: ${name}`);
    }
    return value;
  }

  private signToken(
    payload: AppType.AuthSchemaType["TokenPayload"],
    secret: string,
    expiry: number
  ): string {
    return jwt.sign(payload, secret, { expiresIn: expiry });
  }

  verifyToken(token: string, secret: string) {
    return jwt.verify(token, secret) as AppType.AuthSchemaType["VerifiedToken"];
  }

  private setCookies(res: Res, accessToken: string, refreshToken: string): void {
    const baseOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };
    res.cookie("accessToken", accessToken, {
      ...baseOptions,
      maxAge: this.config.accessExpiry * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      ...baseOptions,
      maxAge: this.config.refreshExpiry * 1000,
    });
  }

  async generateAndSetTokens(
    payload: AppType.AuthSchemaType["TokenPayload"],
    req: Request,
    res: Res
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.signToken(payload, this.config.accessSecret, this.config.accessExpiry);
    const refreshToken = this.signToken(payload, this.config.refreshSecret, this.config.refreshExpiry);
    await this.createSession(req, payload);
    this.setCookies(res, accessToken, refreshToken);
    return { accessToken, refreshToken };
  }


  async tokenValidation(
    decoded: AppType.AuthSchemaType["VerifiedToken"],
    req: Request,
    res: Res
  ): Promise<void> {
    // Step 1: Get session
    const sessionData = await this.getSessionMetadata(decoded.tokenId);

    // Step 2: Session missing
    if (!sessionData) {
      // Step 2a: Check if account is already locked (to avoid duplicate emails)
      const isLocked = await this.isAccountLocked(decoded.userId);
      if (isLocked) {
        this.clearTokens(res);
        logger.warn(
          `Attempted token use on already locked account. TokenId: ${decoded.tokenId}, UserId: ${decoded.userId}`
        );
        throw new AppError(
          "Account is locked due to suspicious activity.",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.ACCOUNT_LOCKED
        );
      }

      // Step 2b: Not locked - this is token theft
      await this.lockAccountDueToSuspiciousActivity(decoded.userId);
      this.clearTokens(res);
      // Queue security alert 
      await this.queueSecurityAlert(decoded.userId, "NO_SESSION", req);
      logger.error(
        `CRITICAL: Token theft detected! TokenId: ${decoded.tokenId}, UserId: ${decoded.userId}`
      );
      throw new AppError(
        "Security violation detected. Access denied.",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.TOKEN_THEFT_DETECTED
      );
    }

    // Step 3: Account locked (but session exists - shouldn't normally happen)
    const isLocked = await this.isAccountLocked(decoded.userId);
    if (isLocked) {
      await this.removeSession(decoded.userId, decoded.tokenId);
      this.clearTokens(res);
      throw new AppError(
        "Account is locked.",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.ACCOUNT_LOCKED
      );
    }

    // Step 4: Device fingerprint
    const oldFingerprint = sessionData.deviceFingerprint;
    const currentFingerprint = getDeviceFingerprint(req);
    if (oldFingerprint !== currentFingerprint) {
      await this.removeSession(decoded.userId, decoded.tokenId);
      this.clearTokens(res);
      // Queue security alert
      await this.queueSecurityAlert(decoded.userId, "SESSION_LOCKED_ATTACK", req);
      logger.warn(
        `Device fingerprint mismatch. Terminating session. TokenId: ${decoded.tokenId}, UserId: ${decoded.userId}`
      );
      throw new AppError(
        "Device security signature changed. Access denied.",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.TOKEN_THEFT_DETECTED
      );
    }
  }

  private async refreshAndSetCookies(
    refreshToken: string,
    res: Res,
    req: Request
  ): Promise<AppType.AuthSchemaType["VerifiedToken"]> {
    const decoded = this.verifyToken(refreshToken, this.config.refreshSecret);
    await this.tokenValidation(decoded, req, res);

    const newTokenId = randomUUID();
    const newPayload = { userId: decoded.userId, tokenId: newTokenId };
    await this.createSession(req, newPayload);
    await this.generateAndSetTokens(newPayload, req, res);
    await this.removeSession(decoded.userId, decoded.tokenId);
    return decoded;
  }

  async authenticateAndRefresh(
    accessToken: string | undefined,
    refreshToken: string | undefined,
    res: Res,
    req: Request
  ): Promise<AppType.AuthSchemaType["VerifiedToken"]> {
    if (accessToken) {
      try {
        const decoded = this.verifyToken(accessToken, this.config.accessSecret);
        await this.tokenValidation(decoded, req, res);
        return decoded;
      } catch (err) {
        if (err instanceof jwt.TokenExpiredError && refreshToken) {
          return await this.refreshAndSetCookies(refreshToken, res, req);
        }
        // If it's a security error
        if (err instanceof AppError &&
            (err.code === ERROR_CODES.TOKEN_THEFT_DETECTED ||
             err.code === ERROR_CODES.ACCOUNT_LOCKED)) {
          throw err;
        }
        if (refreshToken) {
          try {
            return await this.refreshAndSetCookies(refreshToken, res, req);
          } catch (_) {
            throw err;
          }
        }
        throw err;
      }
    }

    if (!refreshToken) {
      throw ErrorFactory.unauthenticated("No authentication tokens provided. Please login.");
    }
    return await this.refreshAndSetCookies(refreshToken, res, req);
  }

  clearTokens(res: Res): void {
   
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
  }
}

export const tokenServiceInstance = new TokenService();