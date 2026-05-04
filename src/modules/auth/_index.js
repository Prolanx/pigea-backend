import { controller } from '@modules/auth/controller/_index.js';
import { dao } from '@modules/auth/dao/_index.js';
import { dto } from '@modules/auth/dto/_index.js';
import { routes } from '@modules/auth/routes/_index.js';
import { utils } from '@modules/auth/utils/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

export const auth = {
  controller,
  dao,
  dto,
  routes,
  utils,
  constants,
};

export default auth;
