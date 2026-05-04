/**
 * Generates a modern, responsive HTML email template for contact form submissions
 * @param {Object} params - Email parameters
 * @param {string} params.firstName - Contact's first name
 * @param {string} params.lastName - Contact's last name
 * @param {string} params.email - Contact's email address
 * @param {string} params.phone - Contact's phone number (optional)
 * @param {string} params.userType - Contact's user type
 * @param {string} params.message - Contact's message
 * @param {boolean} params.termsAccepted - Terms acceptance status
 * @returns {string} HTML email template
 */
export function generateContactEmailTemplate({ firstName, lastName, email, phone, userType, message, termsAccepted }) {
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
  const displayFirstName = firstName || 'N/A';
  const displayLastName = lastName || 'N/A';
  const displayPhone = phone || 'Not provided';
  const displayUserType = userType || 'Not specified';
  const formattedMessage = message ? message.replace(/\n/g, '<br/>') : 'No message provided';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Submission</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f7;
      color: #1d1d1f;
    }
    .email-wrapper {
      width: 100%;
      background-color: #f5f5f7;
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
    .email-header p {
      margin: 8px 0 0 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }
    .email-body {
      padding: 40px 30px;
    }
    .info-card {
      background-color: #f9fafb;
      border-left: 4px solid #667eea;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .info-row {
      display: flex;
      margin-bottom: 16px;
    }
    .info-row:last-child {
      margin-bottom: 0;
    }
    .info-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 120px;
      margin-right: 16px;
    }
    .info-value {
      color: #1d1d1f;
      font-size: 15px;
      flex: 1;
    }
    .message-section {
      margin-top: 32px;
    }
    .message-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      display: block;
    }
    .message-content {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      color: #1d1d1f;
      font-size: 15px;
      line-height: 1.6;
      border: 1px solid #e5e7eb;
    }
    .email-footer {
      background-color: #f9fafb;
      padding: 24px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .email-footer p {
      margin: 0;
      color: #6b7280;
      font-size: 13px;
      line-height: 1.5;
    }
    .timestamp {
      color: #9ca3af;
      font-size: 12px;
      margin-top: 8px;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      .email-header {
        padding: 30px 20px;
      }
      .email-header h1 {
        font-size: 24px;
      }
      .email-body {
        padding: 30px 20px;
      }
      .info-card {
        padding: 20px;
      }
      .info-row {
        flex-direction: column;
      }
      .info-label {
        margin-bottom: 4px;
        min-width: auto;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <!-- Header -->
      <div class="email-header">
        <h1>📬 New Contact Submission</h1>
        <p>Someone has reached out through your contact form</p>
      </div>

      <!-- Body -->
      <div class="email-body">
        <!-- Contact Information Card -->
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">First Name</span>
            <span class="info-value">${displayFirstName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Last Name</span>
            <span class="info-value">${displayLastName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone</span>
            <span class="info-value">${displayPhone}</span>
          </div>
          <div class="info-row">
            <span class="info-label">User Type</span>
            <span class="info-value">${displayUserType}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Terms Accepted</span>
            <span class="info-value">${termsAccepted ? '✓ Yes' : '✗ No'}</span>
          </div>
        </div>

        <!-- Message Section -->
        <div class="message-section">
          <span class="message-label">Message</span>
          <div class="message-content">
            ${formattedMessage}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="email-footer">
        <p>This email was sent from your contact form.</p>
        <p class="timestamp">Received on ${new Date().toLocaleString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generates plain text version of the contact email
 * @param {Object} params - Email parameters
 * @param {string} params.firstName - Contact's first name
 * @param {string} params.lastName - Contact's last name
 * @param {string} params.email - Contact's email address
 * @param {string} params.phone - Contact's phone number (optional)
 * @param {string} params.userType - Contact's user type
 * @param {string} params.message - Contact's message
 * @param {boolean} params.termsAccepted - Terms acceptance status
 * @returns {string} Plain text email
 */
export function generateContactEmailText({ firstName, lastName, email, phone, userType, message, termsAccepted }) {
  const displayFirstName = firstName || 'N/A';
  const displayLastName = lastName || 'N/A';
  const displayPhone = phone || 'Not provided';
  const displayUserType = userType || 'Not specified';
  
  return `
NEW CONTACT SUBMISSION
=====================

CONTACT INFORMATION
-------------------
First Name: ${displayFirstName}
Last Name: ${displayLastName}
Email: ${email}
Phone: ${displayPhone}
User Type: ${displayUserType}
Terms Accepted: ${termsAccepted ? 'Yes' : 'No'}

MESSAGE
-------
${message || 'No message provided'}

---
Received on ${new Date().toLocaleString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
  `.trim();
}



export const templates = {
    generateContactEmailTemplate,
    generateContactEmailText
}