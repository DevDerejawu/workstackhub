import { authValidationSchema } from "@/zods/auth.js";
import z from "zod";
type TokenPayloadType = {
  userId: string;
  tokenId: string; 
};


type VerifiedTokenType = TokenPayloadType & {
  ait: number;
  exp: number;
};
type sessionDataType = TokenPayloadType &{
  userAgent:string;
  createdAt:string;
  deviceFingerprint:string;
  ipAddress:string;
  isLocked: string;
  lockedAt?:string
}
export type AuthSchemaType = {
  sessionDataType: sessionDataType;
  Login: z.infer<typeof authValidationSchema.login>;
  Register: z.infer<typeof authValidationSchema.register>;
  VerifyEmail: z.infer<typeof authValidationSchema.verifyEmail>;
  ForgotPassword: z.infer<typeof authValidationSchema.forgotPassword>;
  ResetPassword: z.infer<typeof authValidationSchema.resetPassword>;
  SendRestoreAccountLink: z.infer<
    typeof authValidationSchema.forgotPassword
  >;
  RestoreAccount: z.infer<typeof authValidationSchema.resetPassword>;
  TokenPayload: TokenPayloadType;
  VerifiedToken: VerifiedTokenType;
};
