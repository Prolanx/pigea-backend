/**
 * Inbox Module Constants
 * All strings, enums, messages, and config values for the inbox domain.
 * Zero hardcoding anywhere else in this module.
 */

export const InboxConstants = {
  // ─── Channel Types ────────────────────────────────────────────────────────
  CHANNEL: {
    EMAIL: 'email',
    WEBSITE_CHAT: 'website_chat',
    WHATSAPP: 'whatsapp',
  },

  // ─── Message Direction ────────────────────────────────────────────────────
  DIRECTION: {
    INBOUND: 'inbound',
    OUTBOUND: 'outbound',
  },

  // ─── Source Types ─────────────────────────────────────────────────────────
  SOURCE: {
    WEBHOOK: 'webhook',
    API: 'api',
    MANUAL: 'manual',
  },

  // ─── Message Status ───────────────────────────────────────────────────────
  STATUS: {
    UNREAD: 'unread',
    READ: 'read',
    ARCHIVED: 'archived',
  },

  // ─── Success Messages ─────────────────────────────────────────────────────
  SUCCESS: {
    WEBHOOK_ACCEPTED: 'OK',
    MESSAGES_RETRIEVED: 'Messages retrieved successfully',
    MESSAGE_RETRIEVED: 'Message retrieved successfully',
    STATUS_UPDATED: 'Message status updated successfully',
  },

  // ─── Error Messages ───────────────────────────────────────────────────────
  ERRORS: {
    NO_ITEMS: 'No email items found in payload',
    MERCHANT_NOT_FOUND: 'No merchant found for this inbox address',
    MESSAGE_NOT_FOUND: 'Message not found',
    PERMISSION_DENIED: 'You do not have permission to access this message',
    INGEST_FAILED: 'Failed to ingest inbound email',
    LIST_FAILED: 'Failed to retrieve messages',
    GET_FAILED: 'Failed to retrieve message',
    STATUS_UPDATE_FAILED: 'Failed to update message status',
    INVALID_STATUS: 'Invalid message status value',
    DUPLICATE_SKIPPED: 'Duplicate message skipped',
  },

  // ─── Validation Messages ──────────────────────────────────────────────────
  VALIDATION: {
    ITEMS_REQUIRED: 'items field is required',
    ITEMS_MUST_BE_ARRAY: 'items must be an array',
    STATUS_REQUIRED: 'status is required',
    STATUS_INVALID: 'status must be one of: unread, read, archived',
    MESSAGE_ID_REQUIRED: 'messageId is required',
    CHANNEL_INVALID: 'channelType must be one of: email, website_chat, whatsapp',
  },

  // ─── DB Error Messages ────────────────────────────────────────────────────
  DB_ERRORS: {
    CREATE_FAILED: 'Failed to create inbox message',
    FIND_FAILED: 'Failed to retrieve inbox message',
    LIST_FAILED: 'Failed to list inbox messages',
    UPDATE_FAILED: 'Failed to update inbox message',
    COUNT_FAILED: 'Failed to count inbox messages',
    FIND_BY_EXTERNAL_ID_FAILED: 'Failed to find message by external ID',
  },

  // ─── Config ───────────────────────────────────────────────────────────────
  CONFIG: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    SLUG_MIN_LENGTH: 3,
    SLUG_MAX_LENGTH: 50,
  },

  // ─── Slug ─────────────────────────────────────────────────────────────────
  SLUG: {
    PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    SET_SUCCESS: 'Inbox slug updated successfully',
    GET_SUCCESS: 'Inbox slug retrieved successfully',
    TAKEN: 'This inbox slug is already in use',
    NOT_FOUND: 'No inbox slug configured',
    SET_FAILED: 'Failed to update inbox slug',
  },

  // ─── Slug Validation ──────────────────────────────────────────────────────
  SLUG_VALIDATION: {
    REQUIRED: 'slug is required',
    MIN_LENGTH: 'slug must be at least 3 characters',
    MAX_LENGTH: 'slug must be at most 50 characters',
    PATTERN: 'slug must contain only lowercase letters, numbers, and hyphens (no leading/trailing hyphens)',
  },
};

export default InboxConstants;
