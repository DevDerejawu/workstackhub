import { verification,  } from "./email.verification.js";
import { resetPassword } from "./reset.password.js";
import { restoreAccount } from "./restore.account.js";
import { securityAlert } from "./security.alert.js";
import { welcome } from "./welcom.js";

export const templates = {
  verification,
  securityAlert,
  resetPassword,
  restoreAccount,
  welcome
};