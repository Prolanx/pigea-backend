import { isSystemField, getSystemFieldById } from '@modules/crm/constants/system-fields.js';

/**
 * Build a lookup map of custom field definitions.
 * Input data must be pre-fetched by the caller (controller/service).
 * @param {Array<Object>} customFields
 * @returns {Map<string, Object>}
 */
export function buildCustomFieldMap(customFields = []) {
  const map = new Map();

  if (!Array.isArray(customFields)) {
    return map;
  }

  customFields.forEach((field) => {
    const fieldId = field?._id?.toString?.() || field?.id?.toString?.() || null;
    if (!fieldId) return;

    map.set(fieldId, {
      id: fieldId,
      name: field?.name || fieldId,
      type: field?.type || 'text',
      options: Array.isArray(field?.options) ? field.options : [],
      isSystem: false,
    });
  });

  return map;
}

/**
 * Resolve one stored field reference ({ id, required }) to API shape.
 * @param {Object} fieldRef
 * @param {Map<string, Object>} customFieldMap
 * @returns {Object|null}
 */
export function resolveFieldReference(fieldRef, customFieldMap) {
  const fieldId = typeof fieldRef?.id === 'string' ? fieldRef.id : null;
  if (!fieldId) return null;

  const required = fieldRef.required === true;

  if (isSystemField(fieldId)) {
    const systemField = getSystemFieldById(fieldId);
    if (!systemField) return null;

    return {
      id: systemField.id,
      required,
      meta: {
        id: systemField.id,
        name: systemField.name,
        type: systemField.type,
        options: [],
        isSystem: true,
      },
    };
  }

  const customField = customFieldMap.get(fieldId);
  if (customField) {
    return {
      id: fieldId,
      required,
      meta: {
        ...customField,
      },
    };
  }

  // Unknown field ID (e.g. definition deleted from DB) — omit entirely.
  return null;
}

/**
 * Map ContactType document to API response with populated field metadata.
 * @param {Object} contactType
 * @param {Map<string, Object>} customFieldMap
 * @returns {Object}
 */
export function toContactTypeResponse(contactType, customFieldMap) {
  const populatedFields = Array.isArray(contactType?.fields)
    ? contactType.fields
        .map((fieldRef) => resolveFieldReference(fieldRef, customFieldMap))
        .filter(Boolean)
    : [];

  return {
    id: contactType?._id,
    name: contactType?.name,
    description: contactType?.description,
    fields: populatedFields,
    contactCount: contactType?.contactCount ?? 0,
    createdAt: contactType?.createdAt,
  };
}
