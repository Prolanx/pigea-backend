/**
 * common/adapters/storage/init.js
 *
 * Firebase initialization.
 * Creates and holds the single bucket instance for the entire app.
 * Call initFirebase() once at app boot — everything else calls getBucket().
 *
 * Required environment variables:
 *   FIREBASE_PROJECT_ID   → "project_id" from service account JSON
 *   FIREBASE_CLIENT_EMAIL → "client_email" from service account JSON
 *   FIREBASE_PRIVATE_KEY  → "private_key" from service account JSON
 *   FIREBASE_BUCKET       → "your-project.appspot.com"
 *
 * All values come from:
 *   Firebase Console → Project Settings → Service Accounts → Generate new private key
 */

import admin from "firebase-admin";

let _bucket     = null;
let _bucketName = null;

const REQUIRED_FIREBASE_ENV_VARS = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_BUCKET",
];

function getEnvValue(name) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function validateFirebaseEnv() {
  const missing = REQUIRED_FIREBASE_ENV_VARS.filter((name) => !getEnvValue(name));
  if (missing.length > 0) {
    throw new Error(
      `[FirebaseAdapter] Missing required Firebase env vars: ${missing.join(", ")}`
    );
  }
}

/**
 * Initialize Firebase and store the bucket instance.
 * Safe to call multiple times — returns existing instance if already initialized.
 *
 * @returns {{ bucket: object, bucketName: string }}
 */
function initFirebase() {
  if (_bucket) return { bucket: _bucket, bucketName: _bucketName };

  validateFirebaseEnv();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   getEnvValue("FIREBASE_PROJECT_ID"),
      clientEmail: getEnvValue("FIREBASE_CLIENT_EMAIL"),
      privateKey:  getEnvValue("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
    storageBucket: getEnvValue("FIREBASE_BUCKET"),
  });

  _bucketName = process.env.FIREBASE_BUCKET;
  _bucket     = admin.storage().bucket(_bucketName);

  console.log("[FirebaseAdapter] Initialized — bucket:", _bucketName);

  return { bucket: _bucket, bucketName: _bucketName };
}

/**
 * Get the initialized bucket instance.
 * Throws if initFirebase() has not been called yet.
 *
 * @returns {object} Firebase Storage bucket
 */
function getBucket() {
  if (!_bucket) {
    throw new Error(
      "[FirebaseAdapter] Firebase has not been initialized. Call initFirebase() first."
    );
  }
  return _bucket;
}

/**
 * Get the initialized bucket name.
 * @returns {string}
 */
function getBucketName() {
  if (!_bucketName) {
    throw new Error(
      "[FirebaseAdapter] Firebase has not been initialized. Call initFirebase() first."
    );
  }
  return _bucketName;
}

export { initFirebase, getBucket, getBucketName };