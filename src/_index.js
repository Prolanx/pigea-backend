import { adapters } from './adapters/_index.js';
import app from './app/_index.js';
import { common } from './common/_index.js';
import { db } from './database/_index.js';
import modules from './modules/_index.js';

export const src = {
  adapters,
  app,
  common,
  db,
  modules
};

export default src;
