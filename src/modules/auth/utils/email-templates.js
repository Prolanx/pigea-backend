/**
 * Auth email templates
 * Builds standard email payloads for authentication flows.
 * Each function returns { to, subject, text, html } ready to be
 * passed directly to emailAdapter.sendEmail().
 */

export function buildVerificationEmail(email, verificationToken) {
  const subject = 'Verify Your Email - BizFlow';
  const text = `Your verification code is: ${verificationToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to BizFlow!</h2>
      <p>Please verify your email address using the code below:</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
        ${verificationToken}
      </div>
      <p>This code will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
  `;
  return { to: email, subject, text, html };
}

export function buildPasswordResetEmail(email, resetToken) {
  const subject = 'Reset Your Password - BizFlow';
  const text = `Your password reset code is: ${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password for your BizFlow account.</p>
      <p>Use the code below to reset your password:</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
        ${resetToken}
      </div>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        This code will expire in 1 hour.
      </p>
      <p style="color: #666; font-size: 14px;">
        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </p>
    </div>
  `;
  return { to: email, subject, text, html };
}
