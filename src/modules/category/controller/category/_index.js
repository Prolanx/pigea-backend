import { ControllerError, DAOError } from '@common/errors.js';
import { getCategorySummaryAction } from './getCategorySummary.js';
/**
 * Category Controller - Business logic for categories
 * Dependencies injected via constructor
 */
class CategoryController {
  constructor(categoryDAO, productDAO) {
    this.categoryDAO = categoryDAO;
    this.productDAO = productDAO;
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Created category
   * @throws {ControllerError|DAOError} If creation fails
   */
  async createCategory(categoryData, merchantId) {
    try {
      const { name, imageUrl, description } = categoryData;

      // Check if category name already exists for this merchant
      const nameExists = await this.categoryDAO.nameExists(name, merchantId);
      if (nameExists) {
        throw new ControllerError('Category with this name already exists', 409);
      }

      // Create category
      const category = await this.categoryDAO.create({
        name,
        imageUrl,
        description,
        merchantId,
      });

      return {
        id: category._id,
        name: category.name,
        imageUrl: category.imageUrl,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    } catch (error) {
      if (error instanceof DAOError) {
        throw new ControllerError('Failed to create category. Please try again later.', 500);
      }
      if (error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to create category. Please try again later.', 500);
    }
  }

  /**
   * Get all categories for merchant
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Array>} Array of categories
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getCategories(merchantId) {
    try {
      const categories = await this.categoryDAO.findByMerchant(merchantId);
      
      return categories.map(category => ({
        id: category._id,
        name: category.name,
        imageUrl: category.imageUrl,
        description: category.description,
        productCount: category.productCount ?? 0,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }));
    } catch (error) {
      if (error instanceof DAOError) {
        throw new ControllerError('Failed to get categories. Please try again later.', 500);
      }
      if (error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to get categories. Please try again later.', 500);
    }
  }

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Category
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getCategoryById(id, merchantId) {
    try {
      // First check if category exists at all
      const categoryExists = await this.categoryDAO.findByIdWithoutMerchantScope(id);
      
      if (!categoryExists) {
        throw new ControllerError('Category not found', 404);
      }

      // Then check if it belongs to this merchant
      const category = await this.categoryDAO.findById(id, merchantId);
      
      if (!category) {
        throw new ControllerError('You do not have permission to access this category', 403);
      }

      return {
        id: category._id,
        name: category.name,
        imageUrl: category.imageUrl,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    } catch (error) {
      if (error instanceof DAOError) {
        throw new ControllerError('Failed to get category. Please try again later.', 500);
      }
      if (error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to get category. Please try again later.', 500);
    }
  }

  async getCategorySummary(merchantId) {
    return getCategorySummaryAction(this, merchantId);
  }

  /**
   * Update category
   * @param {string} id - Category ID
   * @param {Object} updateData - Data to update
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Updated category
   * @throws {ControllerError|DAOError} If update fails
   */
  async updateCategory(id, updateData, merchantId) {
    try {
      // First check if category exists at all
      const categoryExists = await this.categoryDAO.findByIdWithoutMerchantScope(id);
      
      if (!categoryExists) {
        throw new ControllerError('Category not found', 404);
      }

      // Then check if it belongs to this merchant
      const existingCategory = await this.categoryDAO.findById(id, merchantId);
      if (!existingCategory) {
        throw new ControllerError('You do not have permission to update this category', 403);
      }

      // Check if name is being updated and already exists
      if (updateData.name && updateData.name !== existingCategory.name) {
        const nameExists = await this.categoryDAO.nameExists(updateData.name, merchantId, id);
        if (nameExists) {
          throw new ControllerError('Category with this name already exists', 409);
        }
      }

      // Update category
      const category = await this.categoryDAO.updateById(id, merchantId, updateData);

      return {
        id: category._id,
        name: category.name,
        imageUrl: category.imageUrl,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    } catch (error) {
      if (error instanceof DAOError) {
        throw new ControllerError('Failed to update category. Please try again later.', 500);
      }
      if (error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to update category. Please try again later.', 500);
    }
  }

  /**
   * Delete category
   * @param {string} id - Category ID
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Deleted category data
   * @throws {ControllerError|DAOError} If deletion fails
   */
  async deleteCategory(id, merchantId) {
    try {
      // First check if category exists at all
      const categoryExists = await this.categoryDAO.findByIdWithoutMerchantScope(id);
      
      if (!categoryExists) {
        throw new ControllerError('Category not found', 404);
      }

      // Check ownership
      const category = await this.categoryDAO.findById(id, merchantId);
      if (!category) {
        throw new ControllerError('You do not have permission to delete this category', 403);
      }

      // Prevent deletion of default category
      if (category.isDefault) {
        throw new ControllerError('Cannot delete the default General category', 400);
      }

      // Get default category for reassigning products
      const defaultCategory = await this.categoryDAO.findDefaultCategory(merchantId);
      if (!defaultCategory) {
        throw new ControllerError('Default category not found. Cannot delete category.', 500);
      }

      // Reassign all products from this category to the default category
      await this.productDAO.reassignCategory(id, defaultCategory._id, merchantId);

      // Now delete the category
      const deletedCategory = await this.categoryDAO.deleteById(id, merchantId);

      return {
        id: deletedCategory._id,
        name: deletedCategory.name,
        imageUrl: deletedCategory.imageUrl,
        description: deletedCategory.description,
        createdAt: deletedCategory.createdAt,
        updatedAt: deletedCategory.updatedAt,
      };
    } catch (error) {
      console.error('Error in deleteCategory', error);
      if (error instanceof DAOError) {
        throw new ControllerError('Failed to delete category. Please try again later.', 500);
      }
      if (error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to delete category. Please try again later.', 500);
    }
  }
}

export default CategoryController;
