import { ResponseUtils } from '@common/utilities/response.js';
import { ControllerError } from '@common/errors.js';
import { sanitizeAccount } from '@common/utilities/sanitizeAccount.js';

export async function updateOnboarding(userId, onboardingData) {
  try {
    // use injected DAO through `this` context for consistency with other auth methods
    const account = await this.accountDAO.updateById(userId, { onboarding: onboardingData }, { new: true });
    if (!account) {
      throw new ControllerError('Account not found', 404);
    }
    return ResponseUtils.success('Onboarding updated', {
      account: sanitizeAccount(account),
    });
  } catch (err) {
    if (err instanceof ControllerError) {
      throw err;
    }
    throw new ControllerError(err.message);
  }
}
