import serverless from 'serverless-http';
import express from 'express';
import { createDependencies } from '#app/dependencies.js';
import { applyMiddleware, applyErrorHandlers } from '#app/middleware.js';
import { registerRoutes } from '#app/routes.js';
import { connectDatabase } from '#app/startup.js';
import { initFirebase } from '#adapters/storage/init.js';

const app = express();

async function setup() {
  applyMiddleware(app);
  await connectDatabase();
  await initFirebase();
  const dependencies = createDependencies();
  registerRoutes(app, dependencies);
  applyErrorHandlers(app);
}

await setup();

export const handler = serverless(app);