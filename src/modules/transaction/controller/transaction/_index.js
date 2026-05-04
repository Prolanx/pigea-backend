import { getTransactionByTransactionIdAction } from './getTransactionByTransactionId.js';

class TransactionController {
  constructor(transactionDAO, invoiceDAO = null, utils = {}) {
    this.transactionDAO = transactionDAO;
    this.invoiceDAO = invoiceDAO;
    this.utils = utils;
  }

  async getTransactionByTransactionId(transactionId) {
    return getTransactionByTransactionIdAction(this, transactionId);
  }
}

export default TransactionController;
