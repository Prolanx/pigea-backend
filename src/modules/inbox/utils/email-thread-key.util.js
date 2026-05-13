/**
 * Normalize an email thread identifier.
 *
 * Keeps original character casing to preserve compatibility with existing data,
 * while removing transport wrappers and extra whitespace.
 *
 * @param {string|null|undefined} value
 * @returns {string|null}
 */
export function normalizeEmailThreadKey(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;

  const unwrapped = trimmed.replace(/^<+|>+$/g, '').trim();
  return unwrapped || null;
}

/**
 * Build candidate values that can match both legacy and normalized thread keys.
 *
 * @param {string|null|undefined} value
 * @returns {string[]}
 */
export function buildEmailThreadKeyCandidates(value) {
  const trimmed = String(value || '').trim();
  const normalized = normalizeEmailThreadKey(value);

  const candidates = new Set();
  if (trimmed) candidates.add(trimmed);
  if (normalized) {
    candidates.add(normalized);
    candidates.add(`<${normalized}>`);
  }

  return Array.from(candidates).filter(Boolean);
}
