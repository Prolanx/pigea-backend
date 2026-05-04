/**
 * System-defined contact statuses
 * Available to all merchants by default (not stored in database)
 */

const SYSTEM_STATUSES = [
  {
    id: 'sys_new',
    name: 'New Lead',
    description: 'Contact has been created but not yet contacted',
    color: '#3B82F6', // Blue
    isDefault: true,
  },
  {
    id: 'sys_contacted',
    name: 'Contacted',
    description: 'Initial contact has been made',
    color: '#F59E0B', // Amber
    isDefault: true,
  },
  {
    id: 'sys_converted',
    name: 'Converted',
    description: 'Contact has become a customer',
    color: '#10B981', // Green
    isDefault: true,
  },
  {
    id: 'sys_lost',
    name: 'Lost',
    description: 'Contact is no longer interested',
    color: '#EF4444', // Red
    isDefault: true,
  },
];

/**
 * Get all system statuses
 * @returns {Array} Array of system status objects
 */
export function getSystemStatuses() {
  return SYSTEM_STATUSES;
}

/**
 * Get a specific system status by ID
 * @param {string} id - System status ID (e.g., 'sys_new')
 * @returns {Object|null} System status or null if not found
 */
export function getSystemStatusById(id) {
  return SYSTEM_STATUSES.find(status => status.id === id) || null;
}

/**
 * Check if a status ID is a system status
 * @param {string} id - Status ID to check
 * @returns {boolean} True if system status
 */
export function isSystemStatusId(id) {
  return SYSTEM_STATUSES.some(status => status.id === id);
}

/**
 * Get all system status IDs
 * @returns {Array<string>} Array of system status IDs
 */
export function getSystemStatusIds() {
  return SYSTEM_STATUSES.map(status => status.id);
}

/**
 * Get default status ID
 * @returns {string} Default system status ID
 */
export function getDefaultStatusId() {
  return 'sys_new';
}
