/**
 * Generate invoice payment error email HTML
 * Pure template function - no business logic, only rendering
 * @param {Object} templateData - Pre-processed template data
 * @returns {string} HTML email content
 */
export function generateInvoicePaymentErrorTemplate(templateData) {
  const {
    // Merchant (top brand) — logo is optional, all others required
    businessLogoUrl,
    businessName,
    businessEmail,
    businessSupportEmail,
    merchantSupportUrl,

    // Platform (powered by, bottom) — logo is optional, all others required
    platformLogoUrl,
    platformName,
    platformSupportEmail,

    // Invoice meta — all required
    invoiceNumber,
    total,

    // Customer — all required
    customerName,
    customerEmail,

    // Error — all required
    errorMessage,
  } = templateData;

  // ---------------------------------------------------------------------------
  // Required field validation — throw immediately if any are missing
  // ---------------------------------------------------------------------------
  const requiredFields = {
    businessName,
    businessEmail,
    businessSupportEmail,
    merchantSupportUrl,
    platformName,
    platformSupportEmail,
    invoiceNumber,
    total,
    customerName,
    customerEmail,
    errorMessage,
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (value === undefined || value === null || value === '') {
      throw new Error(`generateInvoicePaymentErrorTemplate: Missing required field "${key}"`);
    }
  }

  // ---------------------------------------------------------------------------
  // Logo / fallback helpers
  // ---------------------------------------------------------------------------
  const businessLogoHTML = businessLogoUrl
    ? `<img src="${businessLogoUrl}" alt="${escapeHtml(businessName)}" style="width:36px;height:36px;border-radius:8px;object-fit:contain;display:block;">`
    : `<div style="width:36px;height:36px;background:#6b7280;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0;">${escapeHtml(getInitials(businessName))}</div>`;

  const platformLogoHTML = platformLogoUrl
    ? `<img src="${platformLogoUrl}" alt="${escapeHtml(platformName)}" style="width:26px;height:26px;border-radius:6px;object-fit:contain;display:block;">`
    : `<div style="width:26px;height:26px;background:#374151;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:10px;flex-shrink:0;">${escapeHtml(getInitials(platformName))}</div>`;

  // ---------------------------------------------------------------------------
  // Template
  // ---------------------------------------------------------------------------
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Unsuccessful</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f4f2;
            padding: 40px 20px;
            line-height: 1.6;
        }

        .page-wrapper {
            max-width: 700px;
            margin: 0 auto;
        }

        /* ---- Top brand bar ---- */
        .brand-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 32px;
        }

        .brand-bar-info h1 {
            font-size: 15px;
            font-weight: 700;
            color: #374151;
            letter-spacing: 0.5px;
            margin-bottom: 1px;
        }

        .brand-bar-info p {
            font-size: 10px;
            color: #9ca3af;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        /* ---- Card ---- */
        .card {
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
        }

        /* ---- Hero ---- */
        .card-hero {
            padding: 48px 40px 36px;
            text-align: center;
            border-bottom: 1px solid #f3f4f6;
        }

        .error-icon {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #fef3f2;
            border: 2px solid #fca5a5;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }

        .card-hero h2 {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
        }

        .card-hero p {
            font-size: 14px;
            color: #6b7280;
            max-width: 380px;
            margin: 0 auto;
        }

        /* ---- Error message box ---- */
        .error-box {
            margin: 28px 40px 0;
            padding: 16px 20px;
            background: #fef9f9;
            border-radius: 8px;
            border: 1px solid #fee2e2;
        }

        .error-box-label {
            font-size: 10px;
            font-weight: 600;
            color: #f87171;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            margin-bottom: 6px;
        }

        .error-box p {
            font-size: 14px;
            color: #374151;
        }

        /* ---- Help block ---- */
        .help-block {
            margin: 16px 40px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .help-block-label {
            font-size: 10px;
            font-weight: 600;
            color: #9ca3af;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            margin-bottom: 12px;
        }

        .help-option {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .help-option:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }

        .help-option-icon {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #eff6ff;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .help-option-title {
            font-size: 13px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 2px;
        }

        .help-option a {
            font-size: 13px;
            color: #3b82f6;
            text-decoration: none;
        }

        /* ---- Meta grid ---- */
        .meta-grid {
            padding: 28px 40px 32px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 28px;
        }

        .meta-item label {
            display: block;
            font-size: 10px;
            font-weight: 600;
            color: #9ca3af;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            margin-bottom: 6px;
        }

        .meta-item p {
            font-size: 15px;
            font-weight: 600;
            color: #111827;
        }

        .meta-item .sub {
            font-size: 13px;
            font-weight: 400;
            color: #6b7280;
            margin-top: 2px;
        }

        /* ---- Powered by ---- */
        .powered-by {
            border-top: 1px solid #f0f0f0;
            padding: 24px 40px;
            text-align: center;
        }

        .powered-by-label {
            font-size: 11px;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .powered-by-brand {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .powered-by-brand span {
            font-size: 15px;
            font-weight: 700;
            color: #374151;
        }

        /* ---- Page footer ---- */
        .page-footer {
            margin-top: 24px;
            text-align: center;
        }

        .page-footer p {
            font-size: 11px;
            color: #9ca3af;
            letter-spacing: 0.3px;
            margin-bottom: 8px;
        }

        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
        }

        .footer-links a {
            font-size: 11px;
            color: #9ca3af;
            text-decoration: none;
        }

        @media only screen and (max-width: 600px) {
            body { padding: 24px 16px; }

            .card-hero,
            .meta-grid,
            .powered-by {
                padding-left: 24px;
                padding-right: 24px;
            }

            .error-box,
            .help-block {
                margin-left: 24px;
                margin-right: 24px;
            }

            .meta-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
        }
    </style>
</head>
<body>
<div class="page-wrapper">

    <!-- Merchant brand bar -->
    <div class="brand-bar">
        ${businessLogoHTML}
        <div class="brand-bar-info">
            <h1>${escapeHtml(businessName)}</h1>
            <p>${escapeHtml(businessEmail)}</p>
        </div>
    </div>

    <!-- Card -->
    <div class="card">

        <!-- Hero -->
        <div class="card-hero">
            <div class="error-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8v4m0 4h.01" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2>Payment Unsuccessful</h2>
            <p>We weren't able to process your payment. Don't worry — no charge has been made to your account.</p>
        </div>

        <!-- Error message -->
        <div class="error-box">
            <p class="error-box-label">What went wrong</p>
            <p>${escapeHtml(errorMessage)}</p>
        </div>

        <!-- Help block -->
        <div class="help-block">
            <p class="help-block-label">If a charge was made, here's how to get help</p>

            <div class="help-option">
                <div class="help-option-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div>
                    <p class="help-option-title">Visit ${escapeHtml(businessName)}'s support channel</p>
                    <a href="${escapeHtml(merchantSupportUrl)}">${escapeHtml(merchantSupportUrl)}</a>
                </div>
            </div>

            <div class="help-option">
                <div class="help-option-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="4" width="20" height="16" rx="2" stroke="#3b82f6" stroke-width="2"/>
                        <path d="M2 8l10 6 10-6" stroke="#3b82f6" stroke-width="2"/>
                    </svg>
                </div>
                <div>
                    <p class="help-option-title">Email ${escapeHtml(businessName)} directly</p>
                    <a href="mailto:${escapeHtml(businessSupportEmail)}">${escapeHtml(businessSupportEmail)}</a>
                </div>
            </div>

            <div class="help-option">
                <div class="help-option-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="4" width="20" height="16" rx="2" stroke="#3b82f6" stroke-width="2"/>
                        <path d="M2 8l10 6 10-6" stroke="#3b82f6" stroke-width="2"/>
                    </svg>
                </div>
                <div>
                    <p class="help-option-title">Contact ${escapeHtml(platformName)} support</p>
                    <a href="mailto:${escapeHtml(platformSupportEmail)}">${escapeHtml(platformSupportEmail)}</a>
                </div>
            </div>
        </div>

        <!-- Meta grid -->
        <div class="meta-grid">
            <div class="meta-item">
                <label>Invoice Number</label>
                <p>${escapeHtml(invoiceNumber)}</p>
            </div>
            <div class="meta-item">
                <label>Amount</label>
                <p>$${formatCurrency(total)}</p>
            </div>
            <div class="meta-item">
                <label>Billed To</label>
                <p>${escapeHtml(customerName)}</p>
                <p class="sub">${escapeHtml(customerEmail)}</p>
            </div>
        </div>

        <!-- Powered by -->
        <div class="powered-by">
            <p class="powered-by-label">Powered by</p>
            <div class="powered-by-brand">
                ${platformLogoHTML}
                <span>${escapeHtml(platformName)}</span>
            </div>
        </div>

    </div>

    <!-- Page footer -->
    <div class="page-footer">
        <p>&copy; ${new Date().getFullYear()} ${escapeHtml(businessName.toUpperCase())}. ALL RIGHTS RESERVED.</p>
        <div class="footer-links">
            <a href="#">PRIVACY POLICY</a>
            <a href="#">TERMS OF SERVICE</a>
            <a href="mailto:${escapeHtml(platformSupportEmail)}">SUPPORT</a>
        </div>
    </div>

</div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name) {
  if (!name || !String(name).trim()) return '?';
  const words = String(name).trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function formatCurrency(amount) {
  return Number(amount).toFixed(2);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}