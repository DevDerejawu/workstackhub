export function verification(
  name: string,
  token: string,
  baseUrl: string,
): { subject: string; html: string } {
  return {
    subject: "Verify Your Email",
    html: `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family:
        -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto,
        Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    "
  >
    <table
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="background-color: #f8fafc; padding: 48px 16px"
    >
      <tr>
        <td align="center">
          <!-- Main Card Container -->
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="
              max-width: 520px;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow:
                0 4px 6px -1px rgba(0, 0, 0, 0.05),
                0 2px 4px -1px rgba(0, 0, 0, 0.03);
              overflow: hidden;
              border: 1px solid #e2e8f0;
            "
          >
            <!-- Top Accent Bar -->
            <tr>
              <td style="background-color: #4f46e5; height: 6px"></td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding: 40px 32px; text-align: center">
                <h1
                  style="
                    margin: 0 0 16px 0;
                    color: #1e293b;
                    font-size: 24px;
                    font-weight: 700;
                    line-height: 32px;
                  "
                >
                  Welcome ${name}!
                </h1>

                <p
                  style="
                    margin: 0 0 32px 0;
                    color: #64748b;
                    font-size: 16px;
                    line-height: 24px;
                  "
                >
                  Click the link below to verify your email address and activate
                  your account:
                </p>

                <!-- Call to Action Button -->
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  style="margin: 0 auto 32px auto"
                >
                  <tr>
                    <td
                      align="center"
                      style="border-radius: 8px; background-color: #4f46e5"
                    >
                      <a
                        href="${baseUrl}/auth/verify-email/${token}"
                        target="_blank"
                        style="
                          display: inline-block;
                          padding: 14px 32px;
                          font-size: 16px;
                          font-weight: 600;
                          color: #ffffff;
                          text-decoration: none;
                          border-radius: 8px;
                          border: 1px solid #4f46e5;
                        "
                      >
                        Verify Email Address
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider Line -->
                <hr
                  style="
                    border: 0;
                    border-top: 1px solid #e2e8f0;
                    margin: 0 0 24px 0;
                  "
                />

                <!-- Expiration Warning -->
                <p
                  style="
                    margin: 0;
                    color: #94a3b8;
                    font-size: 13px;
                    line-height: 20px;
                  "
                >
                  This link expires in 24 hours.<br />
                  If you did not create this account, please ignore this email.
                </p>
              </td>
            </tr>
          </table>

          <!-- Footer Note -->
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="max-width: 520px; margin-top: 24px"
          >
            <tr>
              <td
                style="
                  text-align: center;
                  color: #94a3b8;
                  font-size: 12px;
                  line-height: 18px;
                "
              >
                &copy; ${new Date().getFullYear()}WorkStackHub. All rights
                reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

`,
  };
}
