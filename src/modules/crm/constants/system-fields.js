/**
 * System-provided field definitions
 * These are hardcoded suggestions available to all merchants
 * NOTE: `sys_name` replaces `sys_firstName` + `sys_lastName` (canonical single-name field)
 */
const SYSTEM_FIELDS = [
  {
    id: 'sys_name',
    name: 'Name',
    type: 'text',
    isSystem: true,
  },
  {
    id: 'sys_email',
    name: 'Email',
    type: 'text',
    isSystem: true,
  },
];

/**
 * Get all system field definitions
 * @returns {Array} Array of system fields
 */
export const getSystemFields = () => {
  return SYSTEM_FIELDS;
};

/**
 * Get system field by ID
 * @param {string} id - System field ID
 * @returns {Object|null} System field or null
 */
export const getSystemFieldById = (id) => {
  return SYSTEM_FIELDS.find((field) => field.id === id) || null;
};

/**
 * Check if a field ID is a system field
 * @param {string} id - Field ID to check
 * @returns {boolean} True if system field
 */
export const isSystemField = (id) => {
  return SYSTEM_FIELDS.some((field) => field.id === id);
};

/**
 * Get all system field names
 * @returns {Array<string>} Array of system field names
 */
export const getSystemFieldNames = () => {
  return SYSTEM_FIELDS.map((field) => field.name);
};

/**
 * Check if a field name matches a system field name (case-insensitive)
 * @param {string} name - Field name to check
 * @returns {boolean} True if matches system field name
 */
export const isSystemFieldName = (name) => {
  return SYSTEM_FIELDS.some(
    (field) => field.name.toLowerCase() === name.toLowerCase()
  );
};

export default SYSTEM_FIELDS;
