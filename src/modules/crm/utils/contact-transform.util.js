import { isSystemField, getSystemFieldById } from '@modules/crm/constants/system-fields.js';
import { resolveFieldReference } from '@modules/crm/utils/contact-type-response.util.js';
import { getSystemStatusById } from '@modules/crm/constants/system-statuses.js';

/**
 * Utilities to transform Contact documents for API responses.
 * - Remap custom field IDs in `contact.data` to field names (contactType.fields)
 * - Ensure system fields remain under their `sys_*` keys
 * - `sys_name` is canonical; runtime code MUST NOT derive from or accept `sys_firstName`/`sys_lastName` (migration script handles legacy data).
 * - Expose top-level `email` and `name` on the returned `customer` object (not inside `data`)
 * - Remove any legacy keys such as `email`/`name` from `data`
 */

/**
 * Map a Contact document into a stable API-safe array format for dynamic data.
 * - Always preserves the original field `id` (sys_* or custom id)
 * - Provides a human-friendly `key` (field name) resolved from ContactType or system-fields
 * - `isSystem` signals whether the field is a system field
 * - Does NOT expose contactTypeId or top-level email/name (useful for invoice payloads)
 */
export function mapContactDataToArray(contact) {
  if (!contact) return [];
  const contactType = contact.contactTypeId && (contact.contactTypeId.fields ? contact.contactTypeId : null);
  const fieldDefs = Array.isArray(contactType?.fields) ? contactType.fields : [];
  const idToDef = new Map(fieldDefs.map((f) => [String(f.id || f._id), { id: String(f.id || f._id), key: f.name || String(f.id || f._id), isSystem: false }]));

  // system field metadata (minimal)
  const systemFields = new Map([
    ['sys_name', { id: 'sys_name', key: 'Name', isSystem: true }],
    ['sys_email', { id: 'sys_email', key: 'Email', isSystem: true }]
  ]);

  const raw = contact.data || {};
  const out = [];

  // Helper to push a field entry
  const pushField = (entry) => {
    out.push({ id: entry.id, key: entry.key, value: raw[entry.id] ?? raw[entry.key] ?? null, isSystem: Boolean(entry.isSystem) });
  };

  // First, include canonical system fields if present (preserve order)
  for (const sysId of ['sys_name', 'sys_email']) {
    if (raw[sysId] !== undefined) {
      pushField(systemFields.get(sysId));
    }
  }

  // Then include custom fields (map by id -> name)
  for (const [k, v] of Object.entries(raw)) {
    if (k.startsWith('sys_')) continue; // already handled
    const def = idToDef.get(String(k));
    if (def) {
      out.push({ id: def.id, key: def.key, value: v, isSystem: false });
    } else {
      // Unknown key: include as-is (preserves data) — attempt to surface a friendly key equal to id
      out.push({ id: String(k), key: String(k), value: v, isSystem: false });
    }
  }

  return out;
}

/**
 * Build a compact customer object suitable for embedding in invoices.
 * - `data` is returned as an array (safe, collision-free)
 * - top-level denormalized fields (name/email) are intentionally omitted for invoices
 */
export function buildCustomerApiForInvoice(contact) {
  if (!contact) return null;

  const data = mapContactDataToArray(contact);

  const hasSysName = data.some((entry) => entry.key === 'sys_name' || entry.id === 'sys_name');
  const hasSysEmail = data.some((entry) => entry.key === 'sys_email' || entry.id === 'sys_email');

  // fall back to alternate field names for compatibility
  if (!hasSysName && contact?.data?.name) {
    data.unshift({ id: 'sys_name', key: 'sys_name', value: contact.data.name, isSystem: true });
  }

  if (!hasSysEmail && contact?.data?.email) {
    data.unshift({ id: 'sys_email', key: 'sys_email', value: contact.data.email, isSystem: true });
  }

  return {
    id: contact._id?.toString(),
    data
  };
}

/**
 * Map a Contact document into an enriched `data` object where every field
 * from the contact type is present and accompanied by its original schema
 * metadata (same shape returned by `toContactTypeResponse`).  This mirrors
 * the "contact group" response shape and satisfies the front‑end requirement
 * of having the actual field info inside `data`.
 *
 * @param {Object} contact            Populated Contact document
 * @param {Map<string,Object>} customFieldMap  result of buildCustomFieldMap()
 * @returns {Object}                  { fieldId: { value, meta } }
 */
const SEMANTIC_SYSTEM_FIELD_KEYS = {
  sys_name: 'name',
  sys_email: 'email',
};

function normalizeSemanticKey(fieldId, fieldName) {
  if (fieldId && SEMANTIC_SYSTEM_FIELD_KEYS[fieldId]) {
    return SEMANTIC_SYSTEM_FIELD_KEYS[fieldId];
  }
  const raw = String(fieldName || fieldId || '').trim();
  const normalized = raw
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  return normalized || String(fieldId || fieldName).toLowerCase();
}

export function mapContactDataWithMeta(contact, customFieldMap) {
  if (!contact) return {};

  const contactType = contact.contactTypeId && contact.contactTypeId.fields
    ? contact.contactTypeId
    : null;
  const refs = Array.isArray(contactType?.fields) ? contactType.fields : [];
  const raw = contact.data || {};
  const out = {};
  const usedSemanticKeys = new Set();

  // ensure each declared field has an entry (by semantic key)
  refs.forEach((ref) => {
    const resolved = resolveFieldReference(ref, customFieldMap);
    if (!resolved) return;

    const value = raw[resolved.id] !== undefined ? raw[resolved.id] : null;
    const key = normalizeSemanticKey(resolved.id, resolved.meta?.name);

    if (!key || usedSemanticKeys.has(key)) return;

    out[key] = {
      value,
      required: resolved.required === true,
      meta: resolved.meta,
    };
    usedSemanticKeys.add(key);
  });

  // Option A: drop legacy raw contact.data keys and only keep mapped semantic fields.
  // This ensures no old field-id keys like `69adff6...` are exposed.
  return out;
}

export function buildCustomerResponseFromContact(contact, customFieldMap) {
  if (!contact) return null;

  // if map not supplied build an empty one so older callers still work
  const map = customFieldMap || new Map();
  const data = mapContactDataWithMeta(contact, map);
  const email = data.email?.value ?? null;
  const name = data.name?.value ?? null;

  return {
    id: contact._id?.toString(),
    data,
    email,
    name,
    contactTypeId: contact.contactTypeId && (contact.contactTypeId._id || contact.contactTypeId) ? {
      id: contact.contactTypeId._id?.toString() || contact.contactTypeId,
      name: contact.contactTypeId.name,
      fields: contact.contactTypeId.fields || []
    } : null
  };
}

/**
 * Build a contact embed shaped identically to a single entry in the contact-list
 * API response.  This is the single source of truth for any module (invoices,
 * orders, etc.) that needs to embed a customer/contact object — avoiding logic
 * duplication across modules.
 *
 * Shape returned:
 *   { id, contactType: { _id, name, description, fields }, data: { <semanticKey>: { value, required, meta } }, status, source, createdAt }
 *
 * @param {Object} contact            Populated Contact document (contactTypeId.fields populated)
 * @param {Map<string,Object>} customFieldMap  result of buildCustomFieldMap()
 * @returns {Object|null}
 */
export function buildContactEmbedShape(contact, customFieldMap) {
  if (!contact) return null;

  const map = customFieldMap || new Map();
  const data = mapContactDataWithMeta(contact, map);

  const contactType = contact.contactTypeId && contact.contactTypeId._id
    ? {
        id: contact.contactTypeId._id.toString(),
        name: contact.contactTypeId.name || null,
        description: contact.contactTypeId.description || null,
        fields: contact.contactTypeId.fields || [],
      }
    : null;

  // Resolve status to the same rich shape as the contact-list response.
  // System statuses are resolved entirely from in-memory constants (no DB call).
  // Custom statuses fall back to a minimal shape preserving the raw id.
  const rawStatus = contact.status || null;
  const status = rawStatus
    ? (getSystemStatusById(rawStatus) || { id: rawStatus, name: rawStatus, description: null, color: '#6B7280', isDefault: false })
    : null;

  return {
    id: contact._id?.toString(),
    contactType,
    data,
    status,
    source: contact.source || null,
    createdAt: contact.createdAt || null,
  };
}
