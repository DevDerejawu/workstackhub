import { z } from "zod";
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character from '!@#$%^&*(),.?\":{}|<>'.",
    ),
});

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters"),
      confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .merge(loginSchema).refine(
    (data) => data.password === data.confirmPassword,
  {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});
const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character from '!@#$%^&*(),.?\":{}|<>'.",
    ),
   confirmPassword: z.string()
}).refine(data=> data.confirmPassword === data.newPassword, {
  message:"Password doesn't match!",
  path:['confirmPassword']
});

const sendRestoreAccountLinkSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const restoreAccountSchema = z.object({
  token: z.string().min(1, "Restore token is required"),
});

export const authValidationSchema = {
  register: registerSchema,
  login: loginSchema,
  verifyEmail: verifyEmailSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  sendRestoreAccountLink: sendRestoreAccountLinkSchema,
  restoreAccount: restoreAccountSchema,
};
