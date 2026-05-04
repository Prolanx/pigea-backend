  /**
   * Reassign all products from one category to another for a merchant
   * @param {string} oldCategoryId - Category to reassign from
   * @param {string} newCategoryId - Category to reassign to
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<number>} Number of updated products
   * @throws {DAOError} If database operation fails
   */
import mongoose from 'mongoose';
import { DAOError } from '@common/errors.js';
import Product from '@database/models/Product';


/**
 * Product Data Access Object
 * Handles all database operations for products
 */
class ProductDAO {
  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   * @throws {DAOError} If database operation fails
   */
  async create(productData) {
    try {
      const product = await Product.create(productData);
      return product;
    } catch (error) {
      throw new DAOError('Failed to create product');
    }
  }

  /**
   * Reassign all products from one category to another for a merchant
   * @param {string} oldCategoryId - Category to reassign from
   * @param {string} newCategoryId - Category to reassign to
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<number>} Number of updated products
   * @throws {DAOError} If database operation fails
   */
  async reassignCategory(oldCategoryId, newCategoryId, merchantId) {
    try {
      const result = await Product.updateMany(
        { categoryId: oldCategoryId, merchantId },
        { categoryId: newCategoryId }
      );
      return result.modifiedCount || result.nModified || 0;
    } catch (error) {
      throw new DAOError('Failed to reassign products');
    }
  }

  /**
   * Find product by ID
   * @param {string} id - Product ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Product or null
   * @throws {DAOError} If database operation fails
   */
  async findById(id, merchantId) {
    try {
      const product = await Product.findOne({ _id: id, merchantId }).populate('categoryId', 'name');
      return product;
    } catch (error) {
      throw new DAOError('Failed to find product');
    }
  }

  /**
   * Find product by ID without merchant scope (for checking existence)
   * @param {string} id - Product ID
   * @returns {Promise<Object|null>} Product or null
   * @throws {DAOError} If database operation fails
   */
  async findByIdWithoutMerchantScope(id) {
    try {
      const product = await Product.findById(id);
      return product;
    } catch (error) {
      throw new DAOError('Failed to find product by ID');
    }
  }

  /**
   * Find product by name for a merchant (for uniqueness check)
   * @param {string} name - Product name
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Product or null
   * @throws {DAOError} If database operation fails
   */
  async findByName(name, merchantId) {
    try {
      const product = await Product.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }, // Case-insensitive exact match
        merchantId 
      });
      return product;
    } catch (error) {
      throw new DAOError('Failed to find product by name');
    }
  }

  /**
   * Find product by SKU
   * @param {string} sku - Product SKU
   * @returns {Promise<Object|null>} Product or null
   * @throws {DAOError} If database operation fails
   */
  async findBySku(sku) {
    try {
      const product = await Product.findOne({ sku });
      return product;
    } catch (error) {
      throw new DAOError('Failed to find product by SKU');
    }
  }

  /**
   * Find all products for a merchant
   * @param {string} merchantId - Merchant ID
   * @param {Object} filters - Optional filters (categoryId, isActive)
   * @returns {Promise<Array>} Array of products
   * @throws {DAOError} If database operation fails
   */
  async findByMerchant(merchantId, filters = {}) {
    try {
      const query = { merchantId };
      
      if (filters.categoryId) {
        query.categoryId = filters.categoryId;
      }
      
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      const products = await Product.find(query)
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 });
      return products;
    } catch (error) {
      throw new DAOError('Failed to find products');
    }
  }

  /**
   * Update product by ID
   * @param {string} id - Product ID
   * @param {string} merchantId - Merchant ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated product or null
   * @throws {DAOError} If database operation fails
   */
  async updateById(id, merchantId, updateData) {
    try {
      const product = await Product.findOneAndUpdate(
        { _id: id, merchantId },
        updateData,
        { new: true, runValidators: true }
      ).populate('categoryId', 'name');
      return product;
    } catch (error) {
      throw new DAOError('Failed to update product');
    }
  }

  /**
   * Delete product by ID
   * @param {string} id - Product ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Deleted product or null
   * @throws {DAOError} If database operation fails
   */
  async deleteById(id, merchantId) {
    try {
      const product = await Product.findOneAndDelete({ _id: id, merchantId });
      return product;
    } catch (error) {
      throw new DAOError('Failed to delete product');
    }
  }

  /**
   * Update product inventory
   * @param {string} id - Product ID
   * @param {string} merchantId - Merchant ID
   * @param {number} quantity - Quantity to add/subtract
   * @returns {Promise<Object|null>} Updated product or null
   * @throws {DAOError} If database operation fails
   */
  async updateInventory(id, merchantId, quantity) {
    try {
      const product = await Product.findOneAndUpdate(
        { _id: id, merchantId },
        { $inc: { inventory: quantity } },
        { new: true, runValidators: true }
      ).populate('categoryId', 'name');
      return product;
    } catch (error) {
      throw new DAOError('Failed to update inventory');
    }
  }

  async getProductSummary(merchantId = null, lowStockThreshold = 0) {
    try {
      const match = {};
      if (merchantId) {
        match.merchantId = new mongoose.Types.ObjectId(merchantId);
      }

      const summary = await Product.aggregate([
        { $match: match },
        {
          $addFields: {
            variantStockTotal: { $sum: '$variants.stock' },
          },
        },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            lowStockCount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      {
                        $and: [
                          { $eq: ['$thresholdType', 'custom'] },
                          { $lt: ['$inventory', '$threshold'] },
                        ],
                      },
                      {
                        $and: [
                          { $eq: ['$thresholdType', 'auto'] },
                          { $lt: ['$inventory', lowStockThreshold] },
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            outOfStockCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$inventory', 0] },
                      { $eq: ['$variantStockTotal', 0] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      if (!summary || !summary.length) {
        return {
          totalCount: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
        };
      }

      const [{ totalCount, lowStockCount, outOfStockCount }] = summary;
      return {
        totalCount: totalCount || 0,
        lowStockCount: lowStockCount || 0,
        outOfStockCount: outOfStockCount || 0,
      };
    } catch (error) {
      throw new DAOError('Failed to retrieve product summary');
    }
  }
}

export default ProductDAO;
