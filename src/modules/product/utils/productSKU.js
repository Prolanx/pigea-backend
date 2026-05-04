// ─────────────────────────────────────────────
// productSKU.js
// Generates a single unique SKU for a product.
//
// Format: [PREFIX]-[NAME]-[COLOR?]-[SIZE?]-[TIMESTAMP+RANDOM]
// Example: NIK-AM-RE-42-1A2B3XYZ
//
// Caps:
//   Prefix         → max 3 chars
//   Name (1 word)  → max 4 chars   e.g. "Sneakers"           → "SNEA"
//   Name (n words) → max 3 initials e.g. "Air Max Pro Ultra"  → "AMP"
//   Color (1 word) → max 2 chars   e.g. "Red"                → "RE"
//   Color (n words)→ max 2 initials e.g. "Midnight Black"     → "MB"
//   Size           → max 3 chars   e.g. "XL", "42"           → "XL", "42"
// ─────────────────────────────────────────────

/**
 * Sanitize: uppercase, strip non-alphanumeric, trim to length.
 */
const sanitize = (str, len) =>
  str.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, len);

/**
 * Format a product name segment for the SKU.
 *
 * Single word → first 4 chars
 * Multi word  → first letter of each word, capped at 3 words
 *
 * @param {string} name
 * @returns {string}
 */
export const formatProductName = (name) => {
  if (!name?.trim()) return "PRD";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return sanitize(words[0], 4);           // e.g. "Sneakers"  → "SNEA"
  }
  return words
    .slice(0, 3)                            // cap: first 3 words only
    .map((w) => sanitize(w, 1))
    .join("");                              // e.g. "Air Max Pro Ultra" → "AMP"
};

/**
 * Format a color value segment for the SKU.
 *
 * Single word → first 2 chars
 * Multi word  → first letter of each word, capped at 2 words
 *
 * @param {string} color
 * @returns {string}
 */
const formatColor = (color) => {
  if (!color?.trim()) return null;
  const words = color.trim().split(/\s+/);
  if (words.length === 1) {
    return sanitize(words[0], 2);           // e.g. "Red"            → "RE"
  }
  return words
    .slice(0, 2)                            // cap: first 2 words only
    .map((w) => sanitize(w, 1))
    .join("");                              // e.g. "Midnight Black"  → "MB"
};

/**
 * Generate a unique SKU for a product.
 *
 * @param {Object} options
 * @param {string} [options.prefix="PRD"]    - Brand/store prefix  e.g. "NIK"
 * @param {string} [options.name=""]         - Product name        e.g. "Air Max"
 * @param {string} [options.color=""]        - Color               e.g. "Midnight Black"
 * @param {string|number} [options.size=""]  - Size                e.g. "XL", 42
 * @param {string} [options.separator="-"]   - Segment separator
 * @returns {string}
 *
 * @example
 * generateProductSKU({ prefix: "NIK", name: "Air Max", color: "Red", size: 42 })
 * // → "NIK-AM-RE-42-1A2B3XYZ"
 *
 * generateProductSKU({ prefix: "APL", name: "MacBook Pro" })
 * // → "APL-MP-1A2B3XYZ"
 *
 * generateProductSKU({ prefix: "PRD", name: "Sneakers", color: "Midnight Black", size: "XL" })
 * // → "PRD-SNEA-MB-XL-1A2B3XYZ"
 */
export const generateProductSKU = (options = {}) => {
  const {
    prefix = "PRD",
    name = "",
    color = "",
    size = "",
    separator = "-",
  } = options;

  const timestamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random    = Math.random().toString(36).toUpperCase().slice(2, 5);
  const unique    = `${timestamp}${random}`;

  const parts = [
    sanitize(prefix, 3),
    formatProductName(name),
    formatColor(color),
    size ? sanitize(String(size), 3) : null,
    unique,
  ].filter(Boolean);

  return parts.join(separator);
};


// ─────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────

// Single word name
console.log(generateProductSKU({ prefix: "PRD", name: "Sneakers" }));
// → "PRD-SNEA-1A2B3XYZ"

// Multi word name (capped at 3 initials)
console.log(generateProductSKU({ prefix: "NIK", name: "Air Max Pro Ultra", color: "Red", size: 42 }));
// → "NIK-AMP-RE-42-1A2B3XYZ"

// Multi word color (capped at 2 initials)
console.log(generateProductSKU({ prefix: "PRD", name: "Sneakers", color: "Midnight Black", size: "XL" }));
// → "PRD-SNEA-MB-XL-1A2B3XYZ"

// No color or size
console.log(generateProductSKU({ prefix: "APL", name: "MacBook Pro" }));
// → "APL-MP-1A2B3XYZ"
