
import { emailServiceInstance } from "@/services/email.send.js";

export async function emailJobProcessor(job: any): Promise<void> {
  const { type, ...data } = job.data;
  switch (type) {
    case "welcome": {
      await emailServiceInstance.sendWelcomeEmail(data.to, data.name);
      break;
    }

    case "verification": {
      await emailServiceInstance.sendVerificationEmail(data.to, data.name, data.token);
      break;
    }

    case "password-reset": {
      await emailServiceInstance.sendPasswordResetEmail(
        data.to,
        data.name,
        data.token,
        data.message
      );
      break;
    }

    case "account-restore": {
      await emailServiceInstance.sendAccountRestoreEmail(
        data.to,
        data.name,
        data.token,
        data.config
      );
      break;
    }

    case "security-alert": {
      await emailServiceInstance.sendSecurityAlert(
        data.to,
        data.name,
        data.token,
        data.alertType,
        data.deviceInfo,
        data.customMessage
      );
      break;
    }
    default: {     
      throw new Error(`[Fatal] Unhandled email job type: ${type}`);
    }
  }
}