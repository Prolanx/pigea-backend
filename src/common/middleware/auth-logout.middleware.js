import { verifyToken } from '@adapters/jwt/jwt.js';
import { constants } from '@common/constants/_index.js';
import { ResponseUtils } from '@common/utilities/response.js';

/**
 * Authentication middleware for logout - accepts expired tokens
 * Extracts user info from token (even if expired) for logout operations
 */
export const authenticateForLogout = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(ResponseUtils.error('No token provided', null));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token - ignoreExpiration: true allows expired tokens
    try {
      const decoded = verifyToken(token, constants.env.JWT_ACCESS_SECRET, { ignoreExpiration: true });
      req.user = decoded; // Attach user info to request
      return next();
    } catch (jwtError) {
      // Even with ignoreExpiration, token could be malformed or tampered
      return res.status(401).json(ResponseUtils.error('Invalid token', null));
    }
  } catch (error) {
    return res.status(500).json(ResponseUtils.error('Authentication failed', null));
  }
};
