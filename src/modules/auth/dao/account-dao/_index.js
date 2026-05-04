import { create } from '@modules/auth/dao/account-dao/create.dao.js';
import { createMerchantWithDefaults } from '@modules/auth/dao/account-dao/createMerchantWithDefaults.dao.js';
import { findByEmail } from '@modules/auth/dao/account-dao/findByEmail.dao.js';
import { findById } from '@modules/auth/dao/account-dao/findById.dao.js';
import { findByVerificationToken } from '@modules/auth/dao/account-dao/findByVerificationToken.dao.js';
import { findByVerificationTokenRaw } from '@modules/auth/dao/account-dao/findByVerificationTokenRaw.dao.js';
import { updateById } from '@modules/auth/dao/account-dao/updateById.dao.js';
import { addRefreshToken } from '@modules/auth/dao/account-dao/addRefreshToken.dao.js';
import { removeRefreshToken } from '@modules/auth/dao/account-dao/removeRefreshToken.dao.js';
import { findByRefreshToken } from '@modules/auth/dao/account-dao/findByRefreshToken.dao.js';
import { setPasswordResetToken } from '@modules/auth/dao/account-dao/setPasswordResetToken.dao.js';
import { findByPasswordResetToken } from '@modules/auth/dao/account-dao/findByPasswordResetToken.dao.js';
import { findByPasswordResetTokenRaw } from '@modules/auth/dao/account-dao/findByPasswordResetTokenRaw.dao.js';
import { clearPasswordResetToken } from '@modules/auth/dao/account-dao/clearPasswordResetToken.dao.js';
import { findByInboxSlug } from '@modules/auth/dao/account-dao/findByInboxSlug.dao.js';

class AccountDAO {
  async create(accountData) {
    return create.call(this, accountData);
  }

  async createMerchantWithDefaults(accountData) {
    return createMerchantWithDefaults.call(this, accountData);
  }

  async findByEmail(email) {
    return findByEmail.call(this, email);
  }

  async findById(id) {
    return findById.call(this, id);
  }

  async findByVerificationToken(token) {
    return findByVerificationToken.call(this, token);
  }

  async findByVerificationTokenRaw(token) {
    return findByVerificationTokenRaw.call(this, token);
  }

  async updateById(id, updateData) {
    return updateById.call(this, id, updateData);
  }

  async addRefreshToken(accountId, token, expiresAt) {
    return addRefreshToken.call(this, accountId, token, expiresAt);
  }

  async removeRefreshToken(accountId) {
    return removeRefreshToken.call(this, accountId);
  }

  async findByRefreshToken(token) {
    return findByRefreshToken.call(this, token);
  }

  async setPasswordResetToken(email, token, expiresAt) {
    return setPasswordResetToken.call(this, email, token, expiresAt);
  }

  async findByPasswordResetToken(token) {
    return findByPasswordResetToken.call(this, token);
  }

  async findByPasswordResetTokenRaw(token) {
    return findByPasswordResetTokenRaw.call(this, token);
  }

  async clearPasswordResetToken(accountId) {
    return clearPasswordResetToken.call(this, accountId);
  }

  async findByInboxSlug(slug) {
    return findByInboxSlug.call(this, slug);
  }
}

export default AccountDAO;
