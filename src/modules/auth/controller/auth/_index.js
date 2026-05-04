import { signup } from '@modules/auth/controller/auth/signup.js';
import { verifyEmail } from '@modules/auth/controller/auth/verifyEmail.js';
import { login } from '@modules/auth/controller/auth/login.js';
import { refreshAccessToken } from '@modules/auth/controller/auth/refreshAccessToken.js';
import { resendVerification } from '@modules/auth/controller/auth/resendVerification.js';
import { logout } from '@modules/auth/controller/auth/logout.js';
import { forgotPassword } from '@modules/auth/controller/auth/forgotPassword.js';
import { resetPassword } from '@modules/auth/controller/auth/resetPassword.js';
import { resendResetCode } from '@modules/auth/controller/auth/resendResetCode.js';
import { autoLogin } from '@modules/auth/controller/auth/autoLogin.js';
class AuthController {
  constructor(accountDAO, passwordAdapter, jwtAdapter, emailAdapter, tokenGenerator) {
    this.accountDAO = accountDAO;
    this.passwordAdapter = passwordAdapter;
    this.jwtAdapter = jwtAdapter;
    this.emailAdapter = emailAdapter;
    this.tokenGenerator = tokenGenerator;
  }

  async signup(accountData) {
    return signup.call(this, accountData);
  }

  async verifyEmail(token) {
    return verifyEmail.call(this, token);
  }

  async login(email, password) {
    return login.call(this, email, password);
  }

  async refreshAccessToken(refreshToken) {
    return refreshAccessToken.call(this, refreshToken);
  }

  async resendVerification(email) {
    return resendVerification.call(this, email);
  }

  async logout(accountId) {
    return logout.call(this, accountId);
  }

  async forgotPassword(email) {
    return forgotPassword.call(this, email);
  }

  async resetPassword(resetData) {
    return resetPassword.call(this, resetData);
  }

  async resendResetCode(email) {
    return resendResetCode.call(this, email);
  }

  async autoLogin(email) {
    return autoLogin.call(this, email);
  }
}

export default AuthController;