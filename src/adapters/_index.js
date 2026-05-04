import { brevo } from './brevo/_index.js';
import { email } from './email/_index.js';
import { jwt } from './jwt/_index.js';
import { password } from './password/_index.js';
import { validator } from './validator/_index.js';
import { payment } from './payment/payment.js';

export const adapters = {
  brevo,
  email,
  jwt,
  password,
  validator,
  payment
};
