import { updateOnboarding } from './onboarding.controller.js';

class OnboardingController {
  constructor(accountDAO) {
    this.accountDAO = accountDAO;
  }

  async updateOnboarding(userId, onboardingData) {
    return updateOnboarding.call(this, userId, onboardingData);
  }
}

export default OnboardingController;
