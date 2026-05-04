import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

export async function getInvoiceVersionsHandler(req, res, controller) {
  try {
    const versions = await controller.getInvoiceVersions(req.params.id);

    if (versions === null) {
      return res.status(200).json({
        status: 'success',
        message: 'The invoice does not exist or it may have been deleted',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Invoice versions retrieved successfully',
      data: versions,
    });
  } catch (error) {
    return res.status(getRouteErrorStatusCode(error)).json({
      status: 'error',
      message: getRouteErrorMessage(error, 'Failed to retrieve invoice versions'),
      data: null,
    });
  }
}
