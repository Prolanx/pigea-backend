/**
 * common/adapters/storage/index.js
 *
 * Public interface for the storage adapter.
 * This is the ONLY file the rest of your app imports from.
 *
 * Usage in app.js:
 *   const { initFirebase } = require("./common/adapters/storage");
 *   initFirebase();
 *
 * Usage in any controller:
 *   const { getSignedUrl, deleteFile } = require("./common/adapters/storage");
 *
 * Usage in cleanup job — pass bucket as parameter:
 *   const { getBucket } = require("./common/adapters/storage");
 *   initCleanupJob({ bucket: getBucket() });
 */

import { initFirebase, getBucket, getBucketName } from "./init.js";
import {
  getSignedUrl,
  getSignedUrls,
  getDownloadUrl,
  buildProductImageFolder,
  buildProductImagePath,
  buildVariantMediaFolder,
  buildVariantMediaPath,
} from "./helpers.js";
import { deleteFile, deleteFiles } from "./delete.js";

export {
  // Initialization
  initFirebase,
  getBucket,
  getBucketName,

  // Signed URLs
  getSignedUrl,
  getSignedUrls,
  getDownloadUrl,
  buildProductImageFolder,
  buildProductImagePath,
  buildVariantMediaFolder,
  buildVariantMediaPath,

  // Deletion
  deleteFile,
  deleteFiles,
};
