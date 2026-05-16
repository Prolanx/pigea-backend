/**
 * Remove common email reply quote blocks from inbound plain text.
 *
 * Examples removed:
 * - "On Wed, ... wrote:"
 * - "-----Original Message-----"
 * - "From: ..."
 *
 * @param {string|null|undefined} rawText
 * @returns {string|null}
 */
export function sanitizeInboundEmailText(rawText) {
  const input = String(rawText || '').replace(/\r\n?/g, '\n');
  if (!input.trim()) return null;

  const lines = input.split('\n');

  // Some clients fold the reply header across lines:
  // "On Fri ... <" + "person@example.com> wrote:".
  // Merge those lines so quote-start detection remains reliable.
  const unfoldedLines = [];
  for (let index = 0; index < lines.length; index += 1) {
    const current = lines[index];
    const next = lines[index + 1];
    if (
      next &&
      /<\s*$/.test(current) &&
      /^\s*[^\s@<>]+@[^\s@<>]+>\s*wrote:\s*$/i.test(next)
    ) {
      unfoldedLines.push(`${current}${next.trim()}`);
      index += 1;
      continue;
    }
    unfoldedLines.push(current);
  }

  const quoteStartPatterns = [
    /^\s*On\s.+\swrote:\s*$/i,
    /^\s*-{2,}\s*Original Message\s*-{2,}\s*$/i,
    /^\s*From:\s.+$/i,
  ];

  const quoteStartIndex = unfoldedLines.findIndex((line) =>
    quoteStartPatterns.some((pattern) => pattern.test(line)),
  );

  const cleanedLines = quoteStartIndex >= 0
    ? unfoldedLines.slice(0, quoteStartIndex)
    : unfoldedLines;

  const cleaned = cleanedLines.join('\n').trim();
  if (cleaned) return cleaned;

  const inlineReplyHeaderPattern =
    /\sOn\s(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s.+\swrote:\s*/i;
  const inlineMatch = input.match(inlineReplyHeaderPattern);
  if (inlineMatch?.index > 0) {
    const inlineCleaned = input.slice(0, inlineMatch.index).trim();
    if (inlineCleaned) return inlineCleaned;
  }

  return input.trim();
}
