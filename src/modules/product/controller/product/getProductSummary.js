import { ControllerError, DAOError } from '@common/errors.js';

export async function getProductSummaryAction(controller, merchantId = null) {
  try {
    const lowStockThreshold = await controller.businessInfoController.getLowStockThreshold(merchantId);
    const summary = await controller.productDAO.getProductSummary(merchantId, lowStockThreshold);
    const totalCategoriesCount = await controller.categoryDAO.countByMerchant(merchantId);

    return {
      ...summary,
      totalCategoriesCount,
    };
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError('Failed to retrieve product summary');
  }
}
