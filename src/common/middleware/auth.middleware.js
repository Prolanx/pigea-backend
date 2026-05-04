import { verifyToken } from '@adapters/jwt/jwt.js';
import { constants } from '@common/constants/_index.js';
import { ResponseUtils } from '@common/utilities/response.js';

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try { 
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(ResponseUtils.error('No token provided', null));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    try {
      const decoded = verifyToken(token, constants.env.JWT_ACCESS_SECRET);
      req.user = decoded; // Attach user info to request
      return next();
    } catch (jwtError) {
      return res.status(401).json(ResponseUtils.error('Invalid or expired token', null));
    }
  } catch (error) {
    return res.status(500).json(ResponseUtils.error('Authentication failed', null));
  }
};

/**
 * Authorization middleware - check user role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ResponseUtils.error('Authentication required', null));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(ResponseUtils.error('Insufficient permissions', null));
    }

    return next();
  };
};
