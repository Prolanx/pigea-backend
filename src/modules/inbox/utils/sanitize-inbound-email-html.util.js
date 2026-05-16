/**
 * Strip common email reply quote blocks from inbound HTML.
 *
 * Handles:
 * - <blockquote> elements (Gmail, Apple Mail, Thunderbird, most clients)
 * - Gmail quote wrappers:  <div class="gmail_quote"> and <div class="gmail_attr">
 * - Outlook reply headers: <div id="divRplyFwdMsg">
 * - Yahoo quoted:          <div class="yahoo_quoted">
 *
 * Does NOT require an HTML parser — uses iterative regex sufficient for
 * the well-defined patterns produced by major email clients.
 *
 * @param {string|null|undefined} rawHtml
 * @returns {string|null}
 */
export function sanitizeInboundEmailHtml(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return null;

  let html = rawHtml;

  // Most clients append quoted history after a known quote marker/container.
  // Truncate from the first such marker to preserve only the newest message.
  const quoteMarkerPatterns = [
    /<div\b[^>]*class="[^"]*gmail_quote[^"]*"[^>]*>/i,
    /<blockquote\b/i,
    /<div\b[^>]*id="divRplyFwdMsg"[^>]*>/i,
    /<div\b[^>]*class="[^"]*yahoo_quoted[^"]*"[^>]*>/i,
  ];

  const quoteMarkerIndexes = quoteMarkerPatterns
    .map((pattern) => html.search(pattern))
    .filter((index) => index >= 0);

  if (quoteMarkerIndexes.length > 0) {
    const firstQuoteMarkerIndex = Math.min(...quoteMarkerIndexes);
    html = html.slice(0, firstQuoteMarkerIndex);
  }

  // 1. Iteratively remove <blockquote> blocks (nested quotes from thread chains
  //    require multiple passes — each pass peels one nesting level).
  let previous;
  do {
    previous = html;
    html = html.replace(/<blockquote\b[^>]*>[\s\S]*?<\/blockquote\s*>/gi, '');
  } while (html !== previous);

  // 2. Gmail attribution line: <div class="gmail_attr">On ... wrote:</div>
  html = html.replace(/<div\b[^>]*class="[^"]*gmail_attr[^"]*"[^>]*>[\s\S]*?<\/div\s*>/gi, '');

  // 3. Gmail quote wrapper: <div class="gmail_quote"> (now empty after steps 1+2)
  html = html.replace(/<div\b[^>]*class="[^"]*gmail_quote[^"]*"[^>]*>\s*<\/div\s*>/gi, '');

  // 4. Yahoo quoted div
  html = html.replace(/<div\b[^>]*class="[^"]*yahoo_quoted[^"]*"[^>]*>[\s\S]*?<\/div\s*>/gi, '');

  // 5. Outlook reply/forward header div (the separator before quoted content)
  html = html.replace(/<div\b[^>]*id="divRplyFwdMsg"[^>]*>[\s\S]*?<\/div\s*>/gi, '');

  // 6. Outlook horizontal rule separator that precedes the quoted block
  html = html.replace(/<hr\b[^>]*>/gi, '');

  // 7. Collapse excessive trailing whitespace / empty paragraphs left behind
  html = html.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
  html = html.replace(/(<p[^>]*>\s*<\/p\s*>)+/gi, '');

  const cleaned = html.trim();
  return cleaned || null;
}
