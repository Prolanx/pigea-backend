import mongoose from 'mongoose';
import { ControllerError, DAOError } from '@common/errors.js';
import { BUSINESS_INFO_DEFAULT_SHIPPING_COST } from '@common/constants/business-info.constants.js';
import { formatProductName } from '@modules/product/utils/productSKU.js';
import { getProductSummaryAction } from './getProductSummary.js';

const PRODUCT_SKU_PREFIX = 'PRD';
const VARIANT_SKU_PREFIX = 'VAR';
const OBJECT_ID_SUFFIX_LENGTH = 8; // Use a short, unique slice from the ObjectId for SKU readability.

/**
 * Product Controller - Business logic for products
 * Dependencies injected via constructor
 */
class ProductController {
  constructor(productDAO, categoryDAO, businessInfoController) {
    this.productDAO = productDAO;
    this.categoryDAO = categoryDAO;
    this.businessInfoController = businessInfoController;
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Created product
   * @throws {ControllerError|DAOError} If creation fails
   */
  async createProduct(productData, merchantId) {
    try {
      const {
        name,
        description,
        price,
        inventory,
        imageUrl,
        isActive,
        categoryId,
        thresholdType,
        threshold,
        taxApplicable,
        attributes,
        variants,
      } = productData;

      const shippingConfig = await this._normalizeShippingConfigForCreate(productData, merchantId);
      const thresholdConfig = this._normalizeThresholdConfigForCreate(productData);
      const productSku = await this._generateUniqueProductSku(name);
      const preparedVariants = this._buildVariantSkus(productSku, variants || []);

      // Check if product name already exists for this merchant
      const existingProduct = await this.productDAO.findByName(name, merchantId);
      if (existingProduct) {
        throw new ControllerError('A product with this name already exists', 409);
      }

      // Verify categoryId belongs to the merchant
      const category = await this.categoryDAO.findById(categoryId, merchantId);
      if (!category) {
        throw new ControllerError('Category not found or does not belong to you', 404);
      }

      // Create product
      const product = await this.productDAO.create({
        name,
        sku: productSku,
        description,
        price,
        inventory,
        imageUrl,
        isActive: isActive ?? true,
        categoryId,
        merchantId,
        ...thresholdConfig,
        taxApplicable,
        attributes,
        variants: preparedVariants,
        ...shippingConfig,
      });

      return this._formatProduct(product);
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to create product');
    }
  }

  /**
   * Get all products for merchant
   * @param {string} merchantId - Merchant ID from authenticated user
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of products
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getProducts(merchantId, filters = {}) {
    try {
      const products = await this.productDAO.findByMerchant(merchantId, filters);
      return products.map(product => this._formatProduct(product));
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to get products');
    }
  }

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Product
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getProductById(id, merchantId) {
    try {
      // First check if product exists at all
      const productExists = await this.productDAO.findByIdWithoutMerchantScope(id);
      
      if (!productExists) {
        throw new ControllerError('Product not found', 404);
      }

      // Then check if it belongs to this merchant
      const product = await this.productDAO.findById(id, merchantId);
      
      if (!product) {
        throw new ControllerError('You do not have permission to access this product', 403);
      }

      return this._formatProduct(product);
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to get product');
    }
  }

  async getProductSummary(merchantId) {
    return getProductSummaryAction(this, merchantId);
  }

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} updateData - Data to update
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Updated product
   * @throws {ControllerError|DAOError} If update fails
   */
  async updateProduct(id, updateData, merchantId) {
    try {
      // First check if product exists at all
      const productExists = await this.productDAO.findByIdWithoutMerchantScope(id);
      
      if (!productExists) {
        throw new ControllerError('Product not found', 404);
      }

      // Then check if it belongs to this merchant
      const existingProduct = await this.productDAO.findById(id, merchantId);
      if (!existingProduct) {
        throw new ControllerError('You do not have permission to update this product', 403);
      }

      // If name is being updated, check for duplicates (excluding current product)
      if (updateData.name && updateData.name !== existingProduct.name) {
        const duplicateProduct = await this.productDAO.findByName(updateData.name, merchantId);
        if (duplicateProduct && duplicateProduct._id.toString() !== id) {
          throw new ControllerError('A product with this name already exists', 409);
        }
      }

      // If categoryId is being updated, verify it belongs to the merchant
      if (updateData.categoryId) {
        const category = await this.categoryDAO.findById(updateData.categoryId, merchantId);
        if (!category) {
          throw new ControllerError('Category not found or does not belong to you', 404);
        }
      }

      const shippingConfig = await this._normalizeShippingConfigForUpdate(updateData, merchantId);
      const thresholdConfig = this._normalizeThresholdConfigForUpdate(updateData);
      const updatedData = { ...updateData, ...shippingConfig, ...thresholdConfig };

      if (Array.isArray(updatedData.variants)) {
        updatedData.variants = this._buildVariantSkus(existingProduct.sku, updatedData.variants);
      }

      // Update product
      const product = await this.productDAO.updateById(id, merchantId, updatedData);

      return this._formatProduct(product);
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to update product');
    }
  }

  /**
   * Delete product
   * @param {string} id - Product ID
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Deleted product data
   * @throws {ControllerError|DAOError} If deletion fails
   */
  async deleteProduct(id, merchantId) {
    try {
      // First check if product exists at all
      const productExists = await this.productDAO.findByIdWithoutMerchantScope(id);
      
      if (!productExists) {
        throw new ControllerError('Product not found', 404);
      }

      // Then try to delete (will only delete if belongs to merchant)
      const product = await this.productDAO.deleteById(id, merchantId);
      
      if (!product) {
        throw new ControllerError('You do not have permission to delete this product', 403);
      }

      return this._formatProduct(product);
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to delete product');
    }
  }

  /**
   * Update product inventory
   * @param {string} id - Product ID
   * @param {number} quantity - Quantity to add/subtract
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Updated product
   * @throws {ControllerError|DAOError} If update fails
   */
  async updateInventory(id, quantity, merchantId) {
    try {
      // First check if product exists at all
      const productExists = await this.productDAO.findByIdWithoutMerchantScope(id);
      
      if (!productExists) {
        throw new ControllerError('Product not found', 404);
      }

      // Then try to update inventory (will only update if belongs to merchant)
      const product = await this.productDAO.updateInventory(id, merchantId, quantity);
      
      if (!product) {
        throw new ControllerError('You do not have permission to update this product', 403);
      }

      if (product.inventory < 0) {
        throw new ControllerError('Insufficient inventory', 400);
      }

      return this._formatProduct(product);
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError('Failed to update inventory');
    }
  }

  /**
   * Format product response
   * @private
   */
  async _normalizeShippingConfigForCreate(productData, merchantId) {
    const shippingType = productData.shippingType || 'auto';

    if (shippingType === 'custom') {
      if (productData.shippingCost === undefined || productData.shippingCost === null) {
        throw new ControllerError('Shipping cost is required when shipping type is custom', 400);
      }

      return {
        shippingType,
        shippingCost: Number(productData.shippingCost),
      };
    }

    if (productData.shippingCost !== undefined && productData.shippingCost !== null) {
      throw new ControllerError('Shipping cost must not be provided when shipping type is auto', 400);
    }

    return {
      shippingType: 'auto',
      shippingCost: await this._resolveAutoShippingCost(merchantId),
    };
  }

  async _normalizeShippingConfigForUpdate(updateData, merchantId) {
    if (!Object.prototype.hasOwnProperty.call(updateData, 'shippingType')) {
      return {};
    }

    const shippingType = updateData.shippingType || 'auto';

    if (shippingType === 'custom') {
      if (updateData.shippingCost === undefined || updateData.shippingCost === null) {
        throw new ControllerError('Shipping cost is required when shipping type is custom', 400);
      }

      return {
        shippingType,
        shippingCost: Number(updateData.shippingCost),
      };
    }

    if (updateData.shippingCost !== undefined && updateData.shippingCost !== null) {
      throw new ControllerError('Shipping cost must not be provided when shipping type is auto', 400);
    }

    return {
      shippingType: 'auto',
      shippingCost: await this._resolveAutoShippingCost(merchantId),
    };
  }

  _normalizeThresholdConfigForCreate(productData) {
    const thresholdType = productData.thresholdType || 'auto';
    if (thresholdType === 'custom') {
      return {
        thresholdType,
        threshold: Number(productData.threshold),
      };
    }

    return {
      thresholdType: 'auto',
      threshold: null,
    };
  }

  _normalizeThresholdConfigForUpdate(updateData) {
    if (!Object.prototype.hasOwnProperty.call(updateData, 'thresholdType')) {
      return {};
    }

    const thresholdType = updateData.thresholdType || 'auto';
    if (thresholdType === 'custom') {
      return {
        thresholdType,
        threshold: Number(updateData.threshold),
      };
    }

    return {
      thresholdType: 'auto',
      threshold: null,
    };
  }

  async _resolveAutoShippingCost(merchantId) {
    const businessInfo = await this.businessInfoController.getBusinessInfo(merchantId);
    const shippingCost = businessInfo?.defaultShippingCost;

    if (typeof shippingCost === 'number' && shippingCost >= 0) {
      return shippingCost;
    }

    return BUSINESS_INFO_DEFAULT_SHIPPING_COST;
  }

  _generateUniqueProductSku(name) {
    const base = formatProductName(name) || 'PRD';
    const objectId = new mongoose.Types.ObjectId();
    const suffix = objectId.toHexString().toUpperCase();
    const idSegment = suffix.slice(-OBJECT_ID_SUFFIX_LENGTH);
    return `${PRODUCT_SKU_PREFIX}-${base}-${idSegment}`;
  }

  _buildVariantSkus(productSku, variants = []) {
    return variants.map((variant, index) => {
      const { sku, ...variantData } = variant;
      return {
        ...variantData,
        sku: this._formatVariantSku(productSku, index),
      };
    });
  }

  _formatVariantSku(productSku, index) {
    return `${VARIANT_SKU_PREFIX}-${productSku}-${String(index + 1).padStart(2, '0')}`;
  }

  _formatProduct(product) {
    return {
      id: product._id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: product.price,
      inventory: product.inventory,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      thresholdType: product.thresholdType || 'auto',
      threshold: product.threshold,
      taxApplicable: product.taxApplicable,
      shippingType: product.shippingType,
      shippingCost: product.shippingCost,
      attributes: product.attributes || [],
      variants: (product.variants || []).map((variant) => ({
        id: variant._id,
        sku: variant.sku,
        variant: variant.variant,
        price: variant.price,
        stock: variant.stock,
        status: variant.status,
        media: variant.media,
        optionValues: variant.optionValues,
      })),
      categoryId: product.categoryId?._id || product.categoryId,
      categoryName: product.categoryId?.name,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

export default ProductController;
