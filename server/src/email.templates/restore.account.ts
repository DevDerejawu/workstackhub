export function restoreAccount(
  name: string,
  token: string,
  baseUrl: string,
  config?: {
    message: string;
    title: string;
    subject: string;
  },
): { subject: string; html: string } {
  const defaultTitle = "Restore Your Account";
  const defaultMessage =
    "We received a request to restore your account. Click the button below to restore your account and regain access.";

  const defaultSubject = "Restore Your Account";

  const finalTitle = config?.title || defaultTitle;
  const finalMessage = config?.message || defaultMessage;
  const finalSubject = config?.subject || defaultSubject;

  return {
    subject: finalSubject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${finalTitle}</title>
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
            background: #1a56db;
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
            background: #1a56db;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 36px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            transition: background 0.3s ease;
          }
          .button:hover {
            background: #1e40af;
          }
          .footer {
            padding: 20px 40px 30px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
          }
          .footer a {
            color: #1a56db;
            text-decoration: none;
          }
          .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 20px 0;
          }
          @media (max-width: 600px) {
            .container { margin: 20px; }
            .content { padding: 24px; }
            .header { padding: 24px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>${finalTitle}</h1>
          </div>
          
          <!-- Content -->
          <div class="content">
            <div class="greeting">Hello ${name},</div>
            
            <div class="message">
              ${finalMessage}
            </div>
            
            <div class="button-container">
              <a href="${baseUrl}/auth/restore-account/${token}" class="button">Restore Account</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              This link will expire in 24 hours.
            </p>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p>
              If you did not request this, you can safely ignore this email.
              No changes will be made to your account unless you click the link above.
            </p>
            <div class="divider"></div>
            <p>
              Need help? Contact our support team at 
              <a href="${baseUrl}/contact">Contact us</a>
            </p>
            <p style="margin-top: 8px; font-size: 12px; color: #9ca3af;">
              &copy; ${new Date().getFullYear()} WorkStackHub. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}
