/**
 * Generate invoice email HTML from template data
 * Pure template function - no business logic, only rendering
 * @param {Object} templateData - Pre-processed template data
 * @returns {string} HTML email content
 */
export function generateInvoiceEmailHTML(templateData) {
  const {
    businessLogoUrl,
    businessName,
    businessEmail,
    platformLogoUrl,
    platformName,
    platformSupportEmail,
    invoiceNumber,
    invoiceDate,
    issueDate,
    dueDate,
    customerName,
    customerEmail,
    items,
    subtotal,
    tax,
    taxRate,
    total,
    paymentLink
  } = templateData;

  // Generate items HTML
  const itemsHTML = items
    .map(
      (item) => {
        const itemName = item.name || item.description || (item.productMeta && item.productMeta.name) || 'Item';
        return `
                        <tr>
                            <td class="product-name">${escapeHtml(itemName)}</td>
                            <td class="sku-text">-</td>
                            <td>$${formatCurrency(item.unitPrice)}</td>
                            <td class="quantity-text">${item.quantity}</td>
                            <td>$${formatCurrency(item.total)}</td>
                        </tr>`;
      }
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #8B9DC3;
            padding: 40px 20px;
            line-height: 1.6;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 24px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .invoice-header {
            padding: 40px 40px 30px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .brand-section {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
        }
        
        .brand-logo {
            width: 48px;
            height: 48px;
            background-color: #5B7CED;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            overflow: hidden;
        }
        
        .brand-info h1 {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 2px;
        }
        
        .brand-info p {
            font-size: 13px;
            color: #666;
        }
        
        .business-email-header {
            font-size: 12px !important;
            color: #999 !important;
            margin-top: 2px;
        }
        
        .invoice-meta {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
        }
        
        .invoice-meta div {
            text-align: right;
        }
        
        .invoice-meta p {
            font-size: 12px;
            color: #999;
            margin-bottom: 2px;
        }
        
        .invoice-meta h2 {
            font-size: 14px;
            font-weight: 600;
            color: #1a1a1a;
        }
        
        .invoice-details {
            background-color: #F8F9FB;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
        }
        
        .total-due-simple {
            margin-bottom: 10px;
            text-align: right;
        }
        
        .total-due-simple h3 {
            font-size: 11px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
            font-weight: 500;
        }
        
        .detail-item h3 {
            font-size: 11px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
            font-weight: 500;
        }
        
        .detail-item p {
            font-size: 14px;
            color: #1a1a1a;
            font-weight: 500;
        }
        
        .customer-email {
            font-size: 13px !important;
            color: #666 !important;
            font-weight: 400 !important;
            margin-top: 4px;
        }
        
        .total-due-amount {
            font-size: 28px !important;
            font-weight: 600 !important;
            color: #1a1a1a !important;
        }
        
        .invoice-body {
            padding: 0 40px 40px;
        }
        
        .products-section h3 {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
            margin-top: 8px;
            font-weight: 500;
        }
        
        .products-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .products-table thead th {
            font-size: 11px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
            padding: 12px 8px;
            text-align: left;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .products-table thead th:last-child,
        .products-table tbody td:last-child {
            text-align: right;
        }
        
        .products-table tbody td {
            padding: 16px 8px;
            font-size: 14px;
            color: #1a1a1a;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .products-table tbody tr:last-child td {
            border-bottom: none;
        }
        
        .product-name {
            font-weight: 500;
        }
        
        .sku-text,
        .quantity-text {
            color: #666;
        }
        
        .totals-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
        }
        
        .total-row.subtotal,
        .total-row.tax {
            color: #666;
        }
        
        .total-row.grand-total {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #f0f0f0;
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
        }
        
        .invoice-footer {
            background-color: #F8F9FB;
            padding: 30px 40px;
            text-align: center;
            margin-top: 40px;
        }
        
        .footer-brand {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
        }
        
        .footer-contact {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .brand-logo-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #5B7CED;
            color: #fff;
            font-weight: 700;
            font-size: 16px;
            border-radius: 8px;
        }

        .footer-contact p {
            font-size: 12px;
            color: #666;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                border-radius: 0;
            }
            
            .invoice-header,
            .invoice-body,
            .invoice-footer {
                padding-left: 24px;
                padding-right: 24px;
            }
            
            .products-table {
                font-size: 12px;
            }
            
            .products-table thead th,
            .products-table tbody td {
                padding: 8px 4px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="invoice-header">
            <div class="brand-section">
                <div class="brand-logo">
                ${businessLogoUrl ? `
                    <img src="${businessLogoUrl}" alt="${escapeHtml(businessName)}" style="width: 100%; height: 100%; object-fit: contain;">
                ` : `
                    <div class="brand-logo-placeholder">${escapeHtml(getInitials(businessName))}</div>
                `}
                </div>
                <div class="brand-info">
                    <h1>${escapeHtml(businessName)}</h1>
                    <p class="business-email-header">${escapeHtml(businessEmail)}</p>
                </div>
            </div>
            
            <div class="invoice-meta">
                <div>
                    <p>Invoice ID: <strong>${escapeHtml(invoiceNumber)}</strong></p>
                    <p>Invoice Date: <strong>${invoiceDate}</strong></p>
                    <p>Due Date: <strong>${dueDate}</strong></p>
                </div>
            </div>
            
            <div class="invoice-details">
                <div class="detail-item">
                    <h3>Invoice to</h3>
                    <p>${escapeHtml(customerName)}</p>
                    <p class="customer-email">${escapeHtml(customerEmail)}</p>
                </div>
            </div>
            
            <div class="total-due-simple">
                <h3>Total Due</h3>
                <p class="total-due-amount">$${formatCurrency(total)}</p>
            </div>
        </div>
        
        <!-- Body -->
        <div class="invoice-body">
            <div class="products-section">
                <h3>Products</h3>
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Products</th>
                            <th>SKU</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
            </div>
            
            <div class="totals-section">
                <div class="total-row subtotal">
                    <span>Subtotal</span>
                    <span>$${formatCurrency(subtotal)}</span>
                </div>
                <div class="total-row tax">
                    <span>Tax: Vat(${taxRate}%)</span>
                    <span>$${formatCurrency(tax)}</span>
                </div>
                <div class="total-row grand-total">
                    <span>Total Due</span>
                    <span>$${formatCurrency(total)}</span>
                </div>
            </div>

            ${paymentLink ? `
                <div class="pay-button-container" style="text-align:center; margin: 26px 0;">
                    <a href="${paymentLink}" style="display:inline-block; background-color:#5B7CED; color:#ffffff; text-decoration:none; padding:12px 20px; font-weight:700; border-radius:8px;">Pay Invoice</a>
                </div>
            ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="invoice-footer">
            <div class="footer-brand">
                <span style="color: #999; font-size: 13px; font-weight: 400; margin-right: 8px;">Powered by</span>
                <img src="${platformLogoUrl}" alt="${platformName}" style="height: 24px; width: auto; display: inline-block; vertical-align: middle;">
                <span style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin-left: 8px;">${platformName}</span>
            </div>
            <div class="footer-contact">
                <p>Support: ${platformSupportEmail}</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Format currency to 2 decimal places
 * @param {number} amount
 * @returns {string}
 */
function getInitials(name) {
  if (!name || !String(name).trim()) return 'B';
  const words = String(name).trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function formatCurrency(amount) {
  return Number(amount).toFixed(2);
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
