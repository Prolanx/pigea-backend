export async function getTransactionByTransactionIdHandler(req, res, controller) {
  try {
    const transactionId = req.query.transactionId;
    const result = await controller.getTransactionByTransactionId(transactionId);

    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }

    return res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
  }
}
