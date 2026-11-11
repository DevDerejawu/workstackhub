import express from "express";
import { authControllerInstance } from "@/controllers/auth.controller.js";
import authenticate from "@/middlewares/authenticate.js";
import { catchAsync, validateRequest } from "@/utils/error.utils.js";
import { authValidationSchema } from "@/zods/auth.js";

const router = express.Router();
router.post(
  "/register",
  validateRequest(authValidationSchema.register, "body"),
  catchAsync(authControllerInstance.register),
);

router.post(
  "/login",
  validateRequest(authValidationSchema.login, "body"),
  catchAsync(authControllerInstance.login),
);

router.post(
  "/verify-email",
  validateRequest(authValidationSchema.verifyEmail, "body"),
  catchAsync(authControllerInstance.verifyEmail),
);

router.post(
  "/forgot-password",
  validateRequest(authValidationSchema.forgotPassword, "body"),
  catchAsync(authControllerInstance.forgotPassword),
);

router.post(
  "/reset-password",
  validateRequest(authValidationSchema.resetPassword, "body"),
  catchAsync(authControllerInstance.resetPassword),
);

//here I have used the forgotPassword schema, because I will also use the same dada from frontend
router.post(
  '/resend-verification', 
  validateRequest(authValidationSchema.forgotPassword, 'body'), 
  catchAsync(authControllerInstance.resendVerification));

router.delete(
  "/delete-account",
  catchAsync(authenticate),
  catchAsync(authControllerInstance.deleteAccount),
);

router.delete(
  "/logout",
  catchAsync(authenticate),
  catchAsync(authControllerInstance.logout),
);

//I have used the forgotPassword schema, since I have to use the schema.
router.post(
  "/send-restore-account-link",
  validateRequest(authValidationSchema.forgotPassword, "body"),
  catchAsync(authControllerInstance.sendRestoreAccountLink),
);

//here I have used the resetPassword schema, because I will also accept the same data from frontend.
router.post(
  '/account-restore', 
  validateRequest(authValidationSchema.resetPassword, 'body'), 
  catchAsync(authControllerInstance.restoreAccount))
export default router;