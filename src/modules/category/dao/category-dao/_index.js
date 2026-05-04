import mongoose from 'mongoose';
import Category from '@database/models/Category.js';
import { DAOError } from '@common/errors.js';


/**
 * Category Data Access Object
 * Handles all database operations for categories
 */
class CategoryDAO {
  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   * @throws {DAOError} If database operation fails
   */
  async create(categoryData) {
    try {
      const category = await Category.create(categoryData);
      return category;
    } catch (error) {
      throw new DAOError('Failed to create category');
    }
  }

  /**
   * Find category by ID
   * @param {string} id - Category ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Category or null
   * @throws {DAOError} If database operation fails
   */
  async findById(id, merchantId) {
    try {
      const category = await Category.findOne({ _id: id, merchantId });
      return category;
    } catch (error) {
      throw new DAOError('Failed to find category');
    }
  }

  /**
   * Find category by ID without merchant scope (for checking existence)
   * @param {string} id - Category ID
   * @returns {Promise<Object|null>} Category or null
   * @throws {DAOError} If database operation fails
   */
  async findByIdWithoutMerchantScope(id) {
    try {
      const category = await Category.findById(id);
      return category;
    } catch (error) {
      throw new DAOError('Failed to find category');
    }
  }

  /**
   * Find all categories for a merchant and include product counts.
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Array>} Array of categories with productCount
   * @throws {DAOError} If database operation fails
   */
  async findByMerchant(merchantId) {
    try {
      const categories = await Category.aggregate([
        { $match: { merchantId: new mongoose.Types.ObjectId(merchantId) } },
        {
          $lookup: {
            from: 'products',
            let: { categoryId: '$_id', merchantId: '$merchantId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$categoryId', '$$categoryId'] },
                      { $eq: ['$merchantId', '$$merchantId'] },
                    ],
                  },
                },
              },
              { $count: 'count' },
            ],
            as: 'productCounts',
          },
        },
        {
          $addFields: {
            productCount: {
              $ifNull: [{ $arrayElemAt: ['$productCounts.count', 0] }, 0],
            },
          },
        },
        {
          $project: {
            productCounts: 0,
          },
        },
        { $sort: { name: 1 } },
      ]);

      return categories;
    } catch (error) {
      throw new DAOError('Failed to find categories');
    }
  }

  async countByMerchant(merchantId = null) {
    try {
      const filter = {};
      if (merchantId) {
        filter.merchantId = new mongoose.Types.ObjectId(merchantId);
      }

      return await Category.countDocuments(filter);
    } catch (error) {
      throw new DAOError('Failed to count categories');
    }
  }

  async getCategorySummary(merchantId = null) {
    try {
      const match = {};
      if (merchantId) {
        match.merchantId = new mongoose.Types.ObjectId(merchantId);
      }

      const summary = await Category.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'products',
            let: { categoryId: '$_id', merchantId: '$merchantId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$categoryId', '$$categoryId'] },
                      { $eq: ['$merchantId', '$$merchantId'] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: 'products',
          },
        },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            emptyCount: {
              $sum: {
                $cond: [{ $eq: [{ $size: '$products' }, 0] }, 1, 0],
              },
            },
          },
        },
      ]);

      if (!summary || !summary.length) {
        return {
          totalCount: 0,
          emptyCount: 0,
          filledCount: 0,
        };
      }

      const [{ totalCount, emptyCount }] = summary;
      return {
        totalCount,
        emptyCount,
        filledCount: totalCount - emptyCount,
      };
    } catch (error) {
      throw new DAOError('Failed to retrieve category summary');
    }
  }

  /**
   * Update category by ID
   * @param {string} id - Category ID
   * @param {string} merchantId - Merchant ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated category or null
   * @throws {DAOError} If database operation fails
   */
  async updateById(id, merchantId, updateData) {
    try {
      const category = await Category.findOneAndUpdate(
        { _id: id, merchantId },
        updateData,
        { new: true, runValidators: true }
      );
      return category;
    } catch (error) {
      throw new DAOError('Failed to update category');
    }
  }

  /**
   * Delete category by ID
   * @param {string} id - Category ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Deleted category or null
   * @throws {DAOError} If database operation fails
   */
  async deleteById(id, merchantId) {
    try {
      const category = await Category.findOneAndDelete({ _id: id, merchantId });
      return category;
    } catch (error) {
      throw new DAOError('Failed to delete category');
    }
  }

  /**
   * Check if category name exists for merchant
   * @param {string} name - Category name
   * @param {string} merchantId - Merchant ID
   * @param {string} excludeId - Category ID to exclude from check
   * @returns {Promise<boolean>} True if exists
   * @throws {DAOError} If database operation fails
   */
  async nameExists(name, merchantId, excludeId = null) {
    try {
      const query = { name, merchantId };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      const category = await Category.findOne(query);
      return !!category;
    } catch (error) {
      throw new DAOError('Failed to check category name');
    }
  }

  /**
   * Find default category for merchant
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Default category or null
   * @throws {DAOError} If database operation fails
   */
  async findDefaultCategory(merchantId) {
    try {
      const category = await Category.findOne({ merchantId, isDefault: true });
      return category;
    } catch (error) {
      throw new DAOError('Failed to find default category');
    }
  }

  /**
   * Create default "General" category for merchant
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object>} Created default category
   * @throws {DAOError} If database operation fails
   */
  async createDefaultCategory(merchantId) {
    try {
      const category = await Category.create({
        name: 'General',
        description: 'Default category for uncategorized products',
        isDefault: true,
        merchantId,
      });
      return category;
    } catch (error) {
      throw new DAOError('Failed to create default category');
    }
  }
}

export default CategoryDAO;
