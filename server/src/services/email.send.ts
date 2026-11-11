import { Resend } from "resend";
import { templates } from "@/email.templates/index.js";
import { resendErrorHandler } from "@/errors/handlers/resend.error.handler.js";
import { EmailTemplateParams } from "@/email.templates/security.alert.js";
class EmailService {
  private resend: Resend;
  private from: string;
  private baseUrl: string;
  private isProduction: boolean;
  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = new Resend(apiKey);
    this.baseUrl = process.env.BASE_URL!;
    this.isProduction = process.env.NODE_ENV === "production";

    const fromEmail = this.isProduction
      ? process.env.RESEND_PROD_FROM_EMAIL
      : process.env.RESEND_TEST_FROM_EMAIL;

    const fromName = this.isProduction
      ? process.env.RESEND_PROD_NAME_EMAIL
      : process.env.RESEND_TEST_NAME_EMAIL;
    this.from = `${fromName} <${fromEmail}>`;
  }

  private async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<string> {
    const { error, data } = await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      html,
    });
    if (error) {
      throw resendErrorHandler(error);
    } else {
      return data.id;
    }
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<string> {
    const { subject, html } = templates.verification(name, token, this.baseUrl);
    return await this.send(to, subject, html);
  }

  async sendAccountRestoreEmail(
    to: string,
    name: string,
    token: string,
    config?: { subject: string; title: string; message: string },
  ): Promise<string> {
    const { subject, html } = templates.restoreAccount(
      name,
      token,
      this.baseUrl,
      config,
    );
    return await this.send(to, subject, html);
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    token: string,
    message?: string,
  ): Promise<string> {
    const { subject, html } = templates.resetPassword(
      name,
      token,
      this.baseUrl,
      message,
    );
    return await this.send(to, subject, html);
  }
async sendSecurityAlert(
  to: string,
  name: string,
  token: string,
  type: EmailTemplateParams["type"],
  deviceInfo: EmailTemplateParams["deviceInfo"],
  customMessage?: string,
): Promise<string> {
  const { subject, html } = templates.securityAlert({
    name,
    token,
    baseUrl:this.baseUrl,
    type,
    deviceInfo,
    customMessage,
  });
  return await this.send(to, subject, html);
}
  async sendWelcomeEmail(to: string, name: string): Promise<string> {
    const { subject, html } = templates.welcome(name);
    return await this.send(to, subject, html);
  }
}
export const emailServiceInstance = new EmailService();
