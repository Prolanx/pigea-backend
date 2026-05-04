import Transaction from '@database/models/Transaction.js';
import { DAOError } from '@common/errors.js';

class TransactionDAO {
  async create(transactionData) {
    try {
      const transaction = new Transaction(transactionData);
      return await transaction.save();
    } catch (error) {
      throw new DAOError(`Failed to create transaction: ${error.message}`);
    }
  }

  async findByTransactionId(transactionId) {
    try {
      return await Transaction.findOne({ transactionId });
    } catch (error) {
      throw new DAOError(`Failed to find transaction by transactionId: ${error.message}`);
    }
  }

  async findByInvoiceId(invoiceId) {
    try {
      return await Transaction.find({ invoiceId });
    } catch (error) {
      throw new DAOError(`Failed to find transactions by invoiceId: ${error.message}`);
    }
  }
}

export default new TransactionDAO();