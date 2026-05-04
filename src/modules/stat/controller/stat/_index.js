import { ControllerError, DAOError } from '@common/errors.js';
import { getSystemFields } from '@modules/crm/constants/system-fields.js';

/**
 * Stat Controller – business logic for stat/metric records.
 */
class StatController {
  constructor(statDAO) {
    this.statDAO = statDAO;
  }

  /**
   * Get the stats for a merchant, creating record if necessary.
   */
  async getStats(merchantId) {
    try {
      const stat = await this.statDAO.ensureForMerchant(merchantId);
      if (!stat) return null;
      // format output similar to other modules: expose id, drop __v
      return {
        id: stat._id.toString(),
        merchantId: stat.merchantId?.toString(),
        customFieldCount: stat.customFieldCount,
        statusCount: stat.statusCount,
        contactCount: stat.contactCount ?? 0,
        systemFieldCount: getSystemFields().length,
        createdAt: stat.createdAt,
        updatedAt: stat.updatedAt,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to get stats. Please try again later.', 500);
    }
  }

  /**
   * Add or remove custom field count.
   */
  async changeCustomFields(merchantId, delta) {
    try {
      const stat = await this.statDAO.incrementCustomFieldCount(merchantId, delta);
      if (!stat) return null;
      return {
        id: stat._id.toString(),
        merchantId: stat.merchantId?.toString(),
        customFieldCount: stat.customFieldCount,
        createdAt: stat.createdAt,
        updatedAt: stat.updatedAt,
      };
    } catch (error) {
      if (error instanceof DAOError) {
        throw new ControllerError('Failed to update stats. Please try again later.', 500);
      }
      if (error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to update stats. Please try again later.', 500);
    }
  }

  /**
   * Add or remove overall contact count.
   */
  async changeContactCount(merchantId, delta) {
    try {
      const stat = await this.statDAO.incrementContactCount(merchantId, delta);
      if (!stat) return null;
      return {
        id: stat._id.toString(),
        merchantId: stat.merchantId?.toString(),
        contactCount: stat.contactCount ?? 0,
        createdAt: stat.createdAt,
        updatedAt: stat.updatedAt,
      };
    } catch (error) {
      if (error instanceof DAOError) {
        throw new ControllerError('Failed to update stats. Please try again later.', 500);
      }
      if (error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to update stats. Please try again later.', 500);
    }
  }

  /**
   * Add or remove status count.
   */
  async changeStatusCount(merchantId, delta) {
    try {
      const stat = await this.statDAO.incrementStatusCount(merchantId, delta);
      if (!stat) return null;
      return {
        id: stat._id.toString(),
        merchantId: stat.merchantId?.toString(),
        statusCount: stat.statusCount,
        createdAt: stat.createdAt,
        updatedAt: stat.updatedAt,
      };
    } catch (error) {
      if (error instanceof DAOError) {
        throw new ControllerError('Failed to update stats. Please try again later.', 500);
      }
      if (error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to update stats. Please try again later.', 500);
    }
  }
}

export default StatController;
