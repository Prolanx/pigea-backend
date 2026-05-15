import axios from 'axios';

/**
 * Brevo adapter using axios.
 * - Keeps axios contained within the adapter (no leakage to routes/controllers)
 * - Configures baseURL, timeout, and default headers (api-key)
 * - Normalizes errors into thrown Error objects with `status` and `body` where possible
 */

const BASE_URL = 'https://api.brevo.com/v3';
const API_KEY = process.env.BREVO_API_KEY;

if (!API_KEY) {
  console.warn('BREVO_API_KEY is not set. Brevo adapter will fail at runtime when called.');
}

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    'api-key': API_KEY
  }
});

function normalizeAxiosError(err) {
  if (err.response) {
    const e = new Error(err.response.data?.message || `Brevo API error: ${err.response.status}`);
    e.status = err.response.status;
    e.body = err.response.data;
    throw e;
  }
  throw err;
}

export async function createOrUpdateContact({ email, listIds = [], attributes = {}, updateEnabled = true }) {
  if (!email) throw Object.assign(new Error('Email is required'), { status: 400 });

  const payload = {
    email,
    attributes,
    listIds: Array.isArray(listIds) ? listIds : listIds ? [listIds] : [],
    updateEnabled
  };

  try {
    const res = await client.post('/contacts', payload);
    return res.data;
  } catch (err) {
    normalizeAxiosError(err);
  }
}

export async function sendTransactionalEmail({ sender, to = [], subject, htmlContent, textContent, cc = [], bcc = [], replyTo = null }) {
  if (!sender || !sender.email) throw Object.assign(new Error('Sender email is required'), { status: 400 });
  if (!Array.isArray(to) || to.length === 0) throw Object.assign(new Error('Recipient (to) is required'), { status: 400 });

  const payload = {
    sender: { name: sender.name, email: sender.email },
    to: to.map((email) => ({ email })),
    subject,
    htmlContent,
    textContent
  };

  if (replyTo) {
    payload.replyTo = { email: replyTo };
  }

  // Only include cc/bcc when present to avoid Brevo validation errors
  if (Array.isArray(cc) && cc.length > 0) {
    payload.cc = cc.map(email => ({ email }));
  }
  if (Array.isArray(bcc) && bcc.length > 0) {
    payload.bcc = bcc.map(email => ({ email }));
  }

  try {
    const res = await client.post('/smtp/email', payload);
    return res.data;
  } catch (err) {
    // Map common Brevo IP or missing field errors to more actionable messages
    if (err.response && typeof err.response.data?.message === 'string') {
      const msg = err.response.data.message;
      if (msg.includes('unrecognised IP address')) {
        const e = new Error(`Brevo rejected request: ${msg}`);
        e.status = err.response.status;
        e.body = err.response.data;
        throw e;
      }
      if (msg.toLowerCase().includes('cc is missing')) {
        const e = new Error('Brevo rejected the message: cc field is missing or malformed. Ensure `cc` is an array of recipient emails if used, or omit it entirely.');
        e.status = err.response.status;
        e.body = err.response.data;
        throw e;
      }
    }

    normalizeAxiosError(err);
  }
}

/**
 * Send email (Nodemailer-compatible interface)
 * Wraps sendTransactionalEmail and translates Nodemailer signature to Brevo format.
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @param {string} [options.from] - Full 'Name <email>' formatted address or just email
 * @param {string} [options.fromName] - Display name for sender
 * @param {string} [options.replyTo] - Reply-to address (note: Brevo may not support this natively)
 * @returns {Promise<Object>} Brevo send result
 */
export async function sendEmail({ to, subject, text, html, from, fromName, replyTo }) {
  if (!to) throw Object.assign(new Error('Recipient email is required'), { status: 400 });
  if (!subject) throw Object.assign(new Error('Subject is required'), { status: 400 });

  // Parse sender info from 'from' parameter (e.g., "Name <email@address>" or just "email@address")
  let senderEmail = null;
  let senderName = fromName || null;

  if (from) {
    const match = from.match(/<([^>]+)>/);
    senderEmail = match ? match[1].trim() : from.trim();
    if (!senderName) {
      // Extract name from "Name <email>" format if available
      const nameMatch = from.match(/^([^<]*)<[^>]+>$/);
      if (nameMatch) {
        senderName = nameMatch[1].trim();
      }
    }
  }

  // Fallback to env config if from is not provided
  if (!senderEmail) {
    senderEmail = parseEmailAddress(process.env.EMAIL_FROM) || process.env.BREVO_SENDER_EMAIL || 'noreply@example.com';
    if (!senderName) {
      senderName = process.env.BREVO_SENDER_NAME || 'BizFlow';
    }
  }

  // Call sendTransactionalEmail with translated parameters
  return sendTransactionalEmail({
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [to], // Convert single string to array
    subject,
    htmlContent: html,
    textContent: text,
    replyTo: replyTo || null,
  });
}

const parseEmailAddress = (formattedAddress) => {
  if (!formattedAddress || typeof formattedAddress !== 'string') return null;
  const match = formattedAddress.match(/<([^>]+)>/);
  return match ? match[1].trim() : formattedAddress.trim();
};

// --- Example SDK usage (commented for reference) ---
// import Brevo from '@getbrevo/brevo';
// const apiClient = new Brevo.ApiClient();
// apiClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
// const contactsApi = new Brevo.ContactsApi(apiClient);
// const transactionalApi = new Brevo.TransactionalEmailsApi(apiClient);
// --------------------------------------------------
