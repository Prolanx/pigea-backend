import crypto from "crypto";

/**
 * Token Generator Utility
 * Generates verification tokens and other random tokens
 */
class TokenGenerator {
  /**
   * Generate 6-digit verification code
   * @returns {string} 6-digit code
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate random token
   * @param {number} length - Token length in bytes (default: 32)
   * @returns {string} Random hex token
   */
  generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Calculate token expiry date
   * @param {number} ms - Milliseconds until expiry (default: 24h)
   * @returns {number} Expiry timestamp (ms since epoch)
   */
  getTokenExpiryMs(ms = 24 * 60 * 60 * 1000) {
    return Date.now() + ms;
  }

  /**
   * Parse time string to milliseconds (e.g., '24h', '7d', '30m')
   * @param {string} timeString - Time string (e.g., '24h', '7d', '5m')
   * @returns {number} Milliseconds
   */
  parseTimeToMs(timeString) {
    if (typeof timeString !== "string" || !timeString.trim()) {
      throw new Error(
        'parseTimeToMs: timeString must be a non-empty string (examples: "1s","5m","2h","7d")',
      );
    }

    const normalized = timeString.trim().toLowerCase();
    const match = normalized.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(
        `parseTimeToMs: invalid time string "${timeString}". Expected formats: <number><unit> where unit is s|m|h|d`,
      );
    }

    const value = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value * 1000; // seconds
      case "m":
        return value * 60 * 1000; // minutes
      case "h":
        return value * 60 * 60 * 1000; // hours
      case "d":
        return value * 24 * 60 * 60 * 1000; // days
      default:
        throw new Error(`parseTimeToMs: unsupported time unit "${unit}"`);
    }
  }

  // parseTimeToHours is deprecated and replaced by parseTimeToMs
}

export default TokenGenerator;
