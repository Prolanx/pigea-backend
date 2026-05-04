import { ControllerError, DAOError } from '@common/errors.js';
import { getSystemStatuses, getSystemStatusById, isSystemStatusId } from '@modules/crm/constants/system-statuses.js';

/**
 * Status Controller - Business logic for status management
 * Combines system statuses (hardcoded) with custom statuses (database)
 */
class StatusController {
  constructor(statusDAO) {
    this.statusDAO = statusDAO;
  }

  /**
   * Get all statuses (system + custom) for merchant
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Array>} Array of all statuses (system + custom)
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getAllStatuses(merchantId) {
    try {
      const systemStatuses = getSystemStatuses();
      const customStatuses = await this.statusDAO.findByMerchant(merchantId);

      const customStatusesFormatted = customStatuses.map(status => ({
        id: status._id.toString(),
        name: status.name,
        description: status.description,
        color: status.color,
        isDefault: false,
        createdAt: status.createdAt,
        updatedAt: status.updatedAt,
      }));

      // Return a single array with system statuses first
      return [...systemStatuses, ...customStatusesFormatted];
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to get statuses: ${error.message}`);
    }
  }

  /**
   * Get status by ID (checks both system and custom)
   * @param {string} id - Status ID
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Status
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getStatusById(id, merchantId) {
    try {
      // Check if it's a system status
      const systemStatus = getSystemStatusById(id);
      if (systemStatus) {
        return systemStatus;
      }

      // Try to find custom status
      const customStatus = await this.statusDAO.findById(id, merchantId);
      
      if (!customStatus) {
        // Check if it exists for another merchant
        const existsForOtherMerchant = await this.statusDAO.findByIdWithoutMerchantScope(id);
        if (existsForOtherMerchant) {
          throw new ControllerError('You do not have permission to access this status', 403);
        }
        throw new ControllerError('Status not found', 404);
      }

      return {
        id: customStatus._id.toString(),
        name: customStatus.name,
        description: customStatus.description,
        color: customStatus.color,
        isDefault: false,
        createdAt: customStatus.createdAt,
        updatedAt: customStatus.updatedAt,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to get status: ${error.message}`);
    }
  }

  /**
   * Create a new custom status
   * @param {Object} statusData - Status data
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Created status
   * @throws {ControllerError|DAOError} If creation fails
   */
  async createStatus(statusData, merchantId) {
    try {
      const { name, description, color } = statusData;

      // Check if name conflicts with system status names
      const systemStatuses = getSystemStatuses();
      const systemStatusNames = systemStatuses.map(s => s.name.toLowerCase());
      if (systemStatusNames.includes(name.toLowerCase())) {
        throw new ControllerError(
          `Cannot create status '${name}' - this is a system status name`,
          409
        );
      }

      // Create custom status
      const status = await this.statusDAO.create({
        name,
        description,
        color,
        merchantId,
      });

      return {
        id: status._id.toString(),
        name: status.name,
        description: status.description,
        color: status.color,
        isDefault: false,
        createdAt: status.createdAt,
        updatedAt: status.updatedAt,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to create status: ${error.message}`);
    }
  }

  /**
   * Update a custom status
   * @param {string} id - Status ID
   * @param {Object} updateData - Data to update
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Updated status
   * @throws {ControllerError|DAOError} If update fails
   */
  async updateStatus(id, updateData, merchantId) {
    try {
      // Prevent updating system statuses
      if (isSystemStatusId(id)) {
        throw new ControllerError('Cannot modify system statuses', 400);
      }

      // Check if custom status exists
      const statusExists = await this.statusDAO.findByIdWithoutMerchantScope(id);
      
      if (!statusExists) {
        throw new ControllerError('Status not found', 404);
      }

      const existingStatus = await this.statusDAO.findById(id, merchantId);
      if (!existingStatus) {
        throw new ControllerError('You do not have permission to update this status', 403);
      }

      // Check if name conflicts with system status names
      if (updateData.name) {
        const systemStatuses = getSystemStatuses();
        const systemStatusNames = systemStatuses.map(s => s.name.toLowerCase());
        if (systemStatusNames.includes(updateData.name.toLowerCase())) {
          throw new ControllerError(
            `Cannot use name '${updateData.name}' - this is a system status name`,
            409
          );
        }
      }

      // Update status
      const status = await this.statusDAO.updateById(id, merchantId, updateData);

      return {
        id: status._id.toString(),
        name: status.name,
        description: status.description,
        color: status.color,
        isDefault: false,
        createdAt: status.createdAt,
        updatedAt: status.updatedAt,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to update status: ${error.message}`);
    }
  }

  /**
   * Delete a custom status
   * @param {string} id - Status ID
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Deleted status
   * @throws {ControllerError|DAOError} If deletion fails
   */
  async deleteStatus(id, merchantId) {
    try {
      // Prevent deleting system statuses
      if (isSystemStatusId(id)) {
        throw new ControllerError('Cannot delete system statuses', 400);
      }

      // Check if custom status exists
      const statusExists = await this.statusDAO.findByIdWithoutMerchantScope(id);
      
      if (!statusExists) {
        throw new ControllerError('Status not found', 404);
      }

      const status = await this.statusDAO.findById(id, merchantId);
      if (!status) {
        throw new ControllerError('You do not have permission to delete this status', 403);
      }

      // Check if status is in use
      const contactCount = await this.statusDAO.countContactsUsingStatus(id, merchantId);
      if (contactCount > 0) {
        throw new ControllerError(
          `Cannot delete status '${status.name}' - it is currently used by ${contactCount} contact(s)`,
          409
        );
      }

      // Delete status
      const deletedStatus = await this.statusDAO.deleteById(id, merchantId);

      return {
        id: deletedStatus._id.toString(),
        name: deletedStatus.name,
        description: deletedStatus.description,
        color: deletedStatus.color,
        isDefault: false,
        createdAt: deletedStatus.createdAt,
        updatedAt: deletedStatus.updatedAt,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to delete status: ${error.message}`);
    }
  }

  /**
   * Get status summary counts for the status query page
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Summary counts
   */
  async getStatusSummary(merchantId) {
    try {
      const systemStatuses = getSystemStatuses();
      const customStatuses = await this.statusDAO.findByMerchant(merchantId);
      const systemCount = systemStatuses.length;
      const customCount = customStatuses.length;
      return {
        totalCount: systemCount + customCount,
        systemCount,
        customCount,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to get status summary: ${error.message}`);
    }
  }
}

export default StatusController;
