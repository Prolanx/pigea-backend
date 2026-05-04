import { verifyResetToken } from '@modules/auth/controller/verify-reset-token/verifyResetToken.js';

class VerifyResetTokenController {
  constructor(accountDAO) {
    this.accountDAO = accountDAO;
  }

  async verifyResetToken(token) {
    return verifyResetToken.call(this, token);
  }
}

export default VerifyResetTokenController;
