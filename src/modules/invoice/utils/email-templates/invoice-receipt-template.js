/**
 * Generate invoice email HTML from template data
 * Pure template function - no business logic, only rendering
 * @param {Object} templateData - Pre-processed template data
 * @returns {string} HTML email content
 */
export function generateInvoiceReceiptTemplate(templateData) {
  const {
    // Merchant (top brand) — logo is optional, all others required
    businessLogoUrl,
    businessName,
    businessEmail,

    // Platform (powered by, bottom) — logo is optional, all others required
    platformLogoUrl,
    platformName,
    platformSupportEmail,

    // Invoice meta — all required
    invoiceNumber,
    paymentDate,
    transactionId,
    bankReference,

    // Customer — all required
    customerName,
    customerEmail,

    // Line items — all required
    items,

    // Totals — all required
    subtotal,
    tax,
    taxRate,
    total,
  } = templateData;

  // ---------------------------------------------------------------------------
  // Required field validation — throw immediately if any are missing
  // ---------------------------------------------------------------------------
  const requiredFields = {
    businessName,
    businessEmail,
    platformName,
    platformSupportEmail,
    invoiceNumber,
    paymentDate,
    transactionId,
    bankReference,
    customerName,
    customerEmail,
    items,
    subtotal,
    tax,
    taxRate,
    total,
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (value === undefined || value === null || value === '') {
      throw new Error(`generateInvoiceEmailHTML: Missing required field "${key}"`);
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`generateInvoiceEmailHTML: "items" must be a non-empty array`);
  }

  // ---------------------------------------------------------------------------
  // Logo / fallback helpers
  // ---------------------------------------------------------------------------
  const businessLogoHTML = businessLogoUrl
    ? `<img src="${businessLogoUrl}" alt="${escapeHtml(businessName)}" style="width:36px;height:36px;border-radius:8px;object-fit:contain;display:block;">`
    : `<div style="width:36px;height:36px;background:#1a2a6c;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0;">${escapeHtml(getInitials(businessName))}</div>`;

  const platformLogoHTML = platformLogoUrl
    ? `<img src="${platformLogoUrl}" alt="${escapeHtml(platformName)}" style="width:26px;height:26px;border-radius:6px;object-fit:contain;display:block;">`
    : `<div style="width:26px;height:26px;background:#1a2a6c;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:10px;flex-shrink:0;">${escapeHtml(getInitials(platformName))}</div>`;

  // ---------------------------------------------------------------------------
  // Line items HTML
  // ---------------------------------------------------------------------------
  const itemsHTML = items
    .map((item) => {
      const itemName =
        item.name ||
        item.description ||
        (item.productMeta && item.productMeta.name) ||
        'Item';
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid #f3f4f6;">
          <div>
            <div style="font-size:14px;font-weight:500;color:#111827;">${escapeHtml(itemName)}</div>
            <div style="font-size:12px;color:#9ca3af;margin-top:2px;">QTY: ${item.quantity}</div>
          </div>
          <div style="font-size:14px;font-weight:500;color:#111827;">$${formatCurrency(item.total)}</div>
        </div>`;
    })
    .join('');

  // ---------------------------------------------------------------------------
  // Template
  // ---------------------------------------------------------------------------
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f0f2f5;
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
            color: #1a2a6c;
            letter-spacing: 0.5px;
            margin-bottom: 1px;
        }

        .brand-bar-info p {
            font-size: 10px;
            color: #888;
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
            border-bottom: 1px solid #f0f0f0;
        }

        .success-icon {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #ecfdf5;
            border: 2px solid #6ee7b7;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }

        .card-hero h2 {
            font-size: 26px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
        }

        .card-hero p {
            font-size: 14px;
            color: #6b7280;
        }

        /* ---- Meta grid ---- */
        .meta-grid {
            padding: 32px 40px;
            border-bottom: 1px solid #f0f0f0;
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

        /* ---- Summary section ---- */
        .summary-section {
            padding: 28px 40px 32px;
        }

        .section-label {
            font-size: 10px;
            font-weight: 600;
            color: #9ca3af;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            margin-bottom: 20px;
        }

        .totals-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #6b7280;
            padding: 4px 0;
        }

        .totals-row.subtotal { padding-top: 10px; }

        .totals-row.tax {
            padding-bottom: 12px;
            border-bottom: 1px solid #f3f4f6;
        }

        .totals-row.grand-total {
            padding-top: 16px;
            font-size: 15px;
            font-weight: 700;
            color: #111827;
        }

        .totals-row.grand-total span:last-child {
            color: #1a2a6c;
            font-size: 16px;
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
            color: #1a2a6c;
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
            .summary-section,
            .powered-by {
                padding-left: 24px;
                padding-right: 24px;
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
            <div class="success-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2>Payment Complete</h2>
            <p>Your transaction has been processed successfully.</p>
        </div>

        <!-- Meta grid -->
        <div class="meta-grid">
            <div class="meta-item">
                <label>Invoice Number</label>
                <p>${escapeHtml(invoiceNumber)}</p>
            </div>
            <div class="meta-item">
                <label>Amount Paid</label>
                <p>$${formatCurrency(total)}</p>
            </div>
            <div class="meta-item">
                <label>Payment Date</label>
                <p>${escapeHtml(paymentDate)}</p>
            </div>
            <div class="meta-item">
                <label>Billed To</label>
                <p>${escapeHtml(customerName)}</p>
                <p class="sub">${escapeHtml(customerEmail)}</p>
            </div>
            <div class="meta-item">
                <label>Transaction ID</label>
                <p>${escapeHtml(transactionId)}</p>
            </div>
            <div class="meta-item">
                <label>Bank Reference</label>
                <p>${escapeHtml(bankReference)}</p>
            </div>
        </div>

        <!-- Invoice summary -->
        <div class="summary-section">
            <p class="section-label">Invoice Summary</p>

            ${itemsHTML}

            <div class="totals-row subtotal">
                <span>Subtotal</span>
                <span>$${formatCurrency(subtotal)}</span>
            </div>
            <div class="totals-row tax">
                <span>Tax: VAT (${taxRate}%)</span>
                <span>$${formatCurrency(tax)}</span>
            </div>
            <div class="totals-row grand-total">
                <span>Total Amount</span>
                <span>$${formatCurrency(total)}</span>
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