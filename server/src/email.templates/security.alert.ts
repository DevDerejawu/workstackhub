export interface EmailTemplateParams {
  name: string;
  token: string;
  baseUrl: string;
  type:
    | "SESSION_LOCKED"
    | "NO_SESSION"
    | "SESSION_LOCKED_ATTACK"
    | "ACCOUNT_LOCKED";
  deviceInfo: {
    ip: string;
    userAgent: string;
    timestamp: string;
  };
  customMessage?: string;
}

export interface TemplateConfig {
  title: string;
  subject: string;
  headerColor: string;
  actionText: string;
  actionMessage: string;
  detailsMessage: string;
}

export function securityAlert(params: EmailTemplateParams): {
  subject: string;
  html: string;
} {
  const { name, token, baseUrl, type, deviceInfo, customMessage } = params;

  // Dynamic configuration based on template type
  const configs: Record<EmailTemplateParams["type"], TemplateConfig> = {
    SESSION_LOCKED: {
      title: "🔒 Session Locked for Security",
      subject: "🔒 Security Alert: Session Locked",
      headerColor: "#f59e0b",
      actionText: "Unlock Your Account",
      actionMessage:
        "We detected unusual activity on your account and have locked your session for security. To regain access, please reset your password using the link below.",
      detailsMessage: "This ensures that only you can access your account.",
    },
    NO_SESSION: {
      title: "🚨 Unauthorized Access Attempt Detected",
      subject: "🚨 Security Alert: Unauthorized Access Attempt",
      headerColor: "#ef4444",
      actionText: "Secure Your Account Now",
      actionMessage:
        "We detected an attempt to access your account using an expired or revoked session. This is a serious security concern. Please reset your password immediately to secure your account.",
      detailsMessage:
        "If you did not attempt this, your account may be compromised.",
    },
    SESSION_LOCKED_ATTACK: {
      title: "🚨 Attack Detected: Locked Session Used",
      subject: "🚨 CRITICAL: Unauthorized Access Attempt Blocked",
      headerColor: "#dc2626",
      actionText: "Reset Password Immediately",
      actionMessage:
        "We detected an attempt to access your account using a previously locked session. This is a confirmed unauthorized access attempt. Your account has been temporarily locked for security.",
      detailsMessage:
        "We have blocked this attempt. Your account is safe, but action is required.",
    },
    ACCOUNT_LOCKED: {
      title: "🔒 Account Locked for Security",
      subject: "🔒 Security Alert: Account Locked",
      headerColor: "#dc2626",
      actionText: "Unlock Your Account",
      actionMessage:
        "Your account has been locked due to suspicious activity. To regain access, please reset your password using the link below.",
      detailsMessage:
        "This is a precautionary measure to protect your account.",
    },
  };

  const config = configs[type];

  // Build reset link
  const resetLink = `${baseUrl}/auth/reset-password/${token}`;
  const contactLink = `${baseUrl}/contact`;

  // Device information block
  const deviceInfoHtml = ` <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">📱 Device Details:</h3>
          <p style="margin: 4px 0; color: #4b5563;">
            <strong>IP Address:</strong> ${deviceInfo.ip}
          </p>
          <p style="margin: 4px 0; color: #4b5563;">
            <strong>Device:</strong> ${deviceInfo.userAgent}
          </p>

          <p style="margin: 4px 0; color: #4b5563;">
            <strong>Time:</strong> ${new Date(deviceInfo.timestamp).toLocaleString()}
          </p>
        </div>`

  // 📝 Custom message block
  const customMessageHtml = customMessage
    ? `
        <div style="background: #fef3c7; padding: 12px 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">${customMessage}</p>
        </div>
      `
    : "";

  return {
    subject: config.subject,
    html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${config.title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #f9fafb;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: ${config.headerColor};
              padding: 30px 40px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              font-size: 24px;
              font-weight: 600;
              margin: 0;
            }
            .content {
              padding: 40px 40px 30px;
            }
            .greeting {
              font-size: 18px;
              font-weight: 500;
              color: #111827;
              margin-bottom: 16px;
            }
            .message {
              color: #374151;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 24px;
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .button {
              display: inline-block;
              background: ${config.headerColor};
              color: #ffffff !important;
              text-decoration: none;
              padding: 14px 36px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              transition: background 0.3s ease;
            }
            .button:hover {
              opacity: 0.9;
            }
            .footer {
              padding: 20px 40px 30px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
              line-height: 1.6;
            }
            .footer a {
              color: ${config.headerColor};
              text-decoration: none;
            }
            .divider {
              height: 1px;
              background: #e5e7eb;
              margin: 20px 0;
            }
            .secure-badge {
              text-align: center;
              margin-top: 20px;
              color: #9ca3af;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>${config.title}</h1>
            </div>

            <!-- Content -->
            <div class="content">
              <div class="greeting">Hello ${name},</div>

              <div class="message">
                ${config.actionMessage}
                <br><br>
                ${config.detailsMessage}
              </div>

              ${customMessageHtml}
              ${deviceInfoHtml}

              <div class="button-container">
                <a href="${resetLink}" class="button">${config.actionText}</a>
              </div>

              <p style="color: #6b7280; font-size: 14px; text-align: center;">
                This link will expire in 1 hour.
              </p>

              <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 8px;">
                If you did not request this, please ignore this email.
                <br>
                Your account is safe, but we recommend contacting support if you have concerns.
              </p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p>
                Need help? <a href="${contactLink}">Contact our support team</a>
              </p>
              <div class="divider"></div>
              <p>
                This is an automated security notification. Please do not reply to this email.
              </p>
              <p style="margin-top: 8px; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} WorkStackHub. All rights reserved.
              </p>
              <div class="secure-badge">
                🔒 This email was sent for security purposes.
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
  };
}
