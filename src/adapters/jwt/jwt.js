import jwt from 'jsonwebtoken';

/**
 * JWT Adapter - Wraps jsonwebtoken implementation
 * Can be swapped with another JWT library if needed
 */

/**
 * Generate access token (short-lived)
 * @param {Object} payload - Data to encode in token
 * @param {string} secret - JWT secret
 * @param {string} expiresIn - Token expiration (e.g., '15m', '1h')
 * @returns {string} JWT token
 */
export const generateAccessToken = (payload, secret, expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m') => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate refresh token (long-lived)
 * @param {Object} payload - Data to encode in token
 * @param {string} secret - JWT secret
 * @param {string} expiresIn - Token expiration (e.g., '7d', '30d')
 * @returns {string} JWT token
 */
export const generateRefreshToken = (payload, secret, expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d') => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT secret
 * @param {Object} options - Verification options (e.g., { ignoreExpiration: true })
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token, secret, options = {}) => {
  return jwt.verify(token, secret, options);
};

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
