import { ErrorFactory } from "@/errors/app.error.js";
import { authService } from "@/services/auth.service.js";
export class AuthController {
  async register(req: Req, res: Res) {
    await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email. ✅✅",
      data: null,
    });
  }

  login = async (req: Req, res: Res) => {
    const result = await authService.login(req.body, res, req);
    res.status(200).json({
      success: true,
      message: "Login successful. ✅✅",
      data: result,
    });
  };

  logout = async (req: Req, res: Res) => {
    const user = req.user;
if(!user) throw ErrorFactory.unauthorized("You are not logged in.");
    authService.logout(res, { id: user.userId, tokenId: user.tokenId });
    res.status(200).json({
      success: true,
      message: "Logout successful. ✅✅",
      data:null
    });
  };

  verifyEmail = async (req: Req, res: Res) => {
    await authService.verifyEmail(req, res);
    res.status(200).json({
      success: true,
      message: "Email verified successfully. ✅✅",
      data: null,
    });
  };

  forgotPassword = async (req: Req, res: Res) => {
    const message = await authService.forgotPassword(req);
    res.status(200).json({
      success: true,
      message:
        message ||
        "If an account exists with this email, a password reset link has been sent. ✅✅",
      data:null  
    });
  };

  resetPassword = async (req: Req, res: Res) => {
    await authService.resetPassword(req, res);
    res.status(200).json({
      success: true,
      message: "Password reset successfully. ✅✅",
      data:null
    });
  };

  deleteAccount = async (req: Req, res: Res) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw ErrorFactory.unauthenticated("Please log in first to delete your account. ❌❌");
    }
    await authService.deleteAccount(userId, res);
    res.status(200).json({
      success: true,
      message: "Account deleted successfully. ✅✅",
      data: null,
    });
  };

  sendRestoreAccountLink=async(req: Req, res: Res)=> {
    const { email } = req.body;
    await authService.sendRestoreAccountLink(email);
    res.status(200).json({
      success: true,
      message: "If your account is deleted, a restore link has been sent to your email. ✅✅",
      data: null,
    });
  }

   restoreAccount=async(req: Req, res: Res)=> {
     await authService.restoreAccount(req, res);
    res.status(200).json({
      success: true,
      message: "Your account has been restored successfully. 👍👍",
      data: null,
    });
  }

    resendVerification = async (req: Req, res: Res) => {
      const { email } = req.body;
      const message = await authService.resendVerification(email);
      return res.status(200).json({
      success: true,
      message: message,
      data: null,
  });
};
}

export const authControllerInstance = new AuthController();