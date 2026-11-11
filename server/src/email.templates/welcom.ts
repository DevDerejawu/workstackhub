export function welcome(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to WorkStackHub!",
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Your account has been created successfully.</p>
      <p>Start managing your projects today.</p>
    `,
  };
}
