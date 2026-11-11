import type z from "zod";
import { authValidationSchema } from "../zods";
export type RegisterFormType = z.infer<typeof authValidationSchema.register>;
export type LoginFormType = z.infer<typeof authValidationSchema.login>;
export type VerifyEmailFormType = z.infer<typeof authValidationSchema.verifyEmail>;
export type ForgotPasswordFormType = z.infer<typeof authValidationSchema.forgotPassword>;
export type ResetPasswordFormType = z.infer<typeof authValidationSchema.resetPassword>;
export type SendRestoreAccountLinkFormType = z.infer<
  typeof authValidationSchema.sendRestoreAccountLink
>;
export type RestoreAccountFormType = z.infer<typeof authValidationSchema.restoreAccount>;