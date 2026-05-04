/**
 * Auth Module Constants
 * All hardcoded values centralized here (Zero Hardcoding Pattern)
 */

import {
  VERIFICATION_TOKEN_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} from "@common/constants/env.constants.js";

export const AuthConstants = {
  SUCCESS: {
    SIGNUP:
      "Account created successfully. Please check your email for verification code.",
    EMAIL_VERIFIED: "Email verified successfully",
    LOGIN: "Login successful",
    TOKEN_REFRESHED: "Token refreshed successfully",
    VERIFICATION_RESENT: "Verification email sent successfully",
    LOGOUT: "Logged out successfully",
    PASSWORD_RESET_SENT:
      "If an account with that email exists, a password reset link has been sent",
    PASSWORD_RESET:
      "Password reset successful. Please login with your new password.",
    RESET_CODE_RESENT:
      "If an account with that email exists, a new code has been sent",
    RESET_TOKEN_VALID: "Token is valid",
    AUTO_LOGIN_FAILED: "Failed to auto-login",
  },

  ERRORS: {
    EMAIL_EXISTS: "Account with this email already exists",
    INVALID_VERIFICATION_TOKEN: "Verification code is invalid",
    VERIFICATION_TOKEN_EXPIRED:
      "Verification code has expired. Please request a new verification code.",
    INVALID_CREDENTIALS: "Invalid email or password",
    VERIFICATION_EXPIRED:
      "Please verify your email. A new verification code has been sent.",
    VERIFY_EMAIL_PROMPT:
      "Please verify your email address to access your account. Login to resend verification code.",
    INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
    REFRESH_TOKEN_NOT_FOUND: "Session not found. Please login again to access your account",
    REFRESH_TOKEN_EXPIRED:
      "Your session has expired. Please login again to access your account",
    ACCOUNT_NOT_FOUND: "Account not found",
    ALREADY_VERIFIED: "Account is already verified",
    INVALID_RESET_TOKEN: "Invalid password reset token",
    RESET_TOKEN_EXPIRED:
      "Password reset token has expired. Please request a new one.",
    PASSWORD_REQUIRED: "Password is required",
    RESET_CODE_NOT_EXPIRED:
      "Current code has not expired yet. Please wait before requesting a new code.",
    SIGNUP_FAILED: "Failed to register account",
    VERIFY_EMAIL_FAILED: "Failed to verify email",
    LOGIN_FAILED: "Failed to login",
    REFRESH_FAILED: "Failed to refresh token",
    RESEND_VERIFICATION_FAILED: "Failed to resend verification",
    RESEND_TOO_SOON: "Please wait before requesting another code",
    LOGOUT_FAILED: "Failed to logout",
    FORGOT_PASSWORD_FAILED: "Failed to process password reset request",
    RESET_PASSWORD_FAILED: "Failed to reset password",
    RESEND_RESET_CODE_FAILED: "Failed to resend password reset code",
    VERIFY_RESET_TOKEN_FAILED: "Failed to verify reset token",
  },

  VALIDATION: {
    FIRST_NAME_REQUIRED: "First name is required",
    FIRST_NAME_STRING: "First name must be a string",
    LAST_NAME_REQUIRED: "Last name is required",
    LAST_NAME_STRING: "Last name must be a string",
    EMAIL_REQUIRED: "Email is required",
    EMAIL_INVALID: "Invalid email format",
    EMAIL_INVALID_ADDRESS: "Invalid email address",
    PASSWORD_REQUIRED: "Password is required",
    TOKEN_REQUIRED: "Verification token is required",
    TOKEN_STRING: "Token must be a string",
    TOKEN_LENGTH: "Token must be 6 digits",
    RESET_CODE_REQUIRED: "Reset code is required",
    RESET_CODE_FORMAT: "Invalid reset code format",
    RESET_CODE_NUMERIC: "Reset code must be numeric",
    NEW_PASSWORD_REQUIRED: "New password is required",
    REFRESH_TOKEN_REQUIRED: "Refresh token is required",
    REFRESH_TOKEN_STRING: "Refresh token must be a string",
  },

  DB_ERRORS: {
    CREATE_FAILED: "Failed to create account in database",
    CREATE_MERCHANT_FAILED: "Failed to create merchant account with defaults",
    FIND_BY_EMAIL_FAILED: "Failed to find account by email",
    FIND_BY_ID_FAILED: "Failed to find account by ID",
    FIND_BY_VERIFICATION_TOKEN_FAILED:
      "Failed to find account by verification token",
    UPDATE_FAILED: "Failed to update account",
    ADD_REFRESH_TOKEN_FAILED: "Failed to add refresh token",
    REMOVE_REFRESH_TOKEN_FAILED: "Failed to remove refresh token",
    FIND_BY_REFRESH_TOKEN_FAILED: "Failed to find account by refresh token",
    SET_RESET_TOKEN_FAILED: "Failed to set password reset token",
    FIND_BY_RESET_TOKEN_FAILED:
      "Failed to find account by password reset token",
    CLEAR_RESET_TOKEN_FAILED: "Failed to clear password reset token",
  },

  DEFAULTS: {
    CATEGORY_NAME: "General",
    CATEGORY_DESCRIPTION: "Default category for uncategorized products",
    ROLE: "merchant",
    VERIFICATION_TOKEN_EXPIRY: VERIFICATION_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRY: JWT_REFRESH_EXPIRES_IN,
  },
};
