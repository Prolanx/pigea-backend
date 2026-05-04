/**
 * common/adapters/storage/delete.js
 *
 * Firebase Storage deletion operations.
 * Uses the shared bucket instance from init.js directly.
 */

import { getBucket } from "./init.js";

/**
 * Delete a single file from Firebase Storage.
 * Treats 404 as success — idempotent.
 *
 * @param {string} filePath - e.g. "uploads/products/abc123.jpg"
 * @returns {Promise<{ data: { deleted: boolean } | null, error: string | null }>}
 */
async function deleteFile(filePath) {
  try {
    await getBucket().file(filePath).delete();
    return { data: { deleted: true }, error: null };
  } catch (err) {
    if (err.code === 404) {
      return { data: { deleted: true }, error: null };
    }
    console.error("[FirebaseAdapter] deleteFile error:", err);
    return { data: null, error: "Failed to delete file" };
  }
}

/**
 * Delete multiple files from Firebase Storage.
 * Runs all deletions in parallel.
 * Returns which succeeded and which failed.
 *
 * @param {string[]} filePaths
 * @returns {Promise<{
 *   data: { deleted: string[], failed: string[] } | null,
 *   error: string | null
 * }>}
 */
async function deleteFiles(filePaths) {
  try {
    const results = await Promise.allSettled(
      filePaths.map((filePath) =>
        getBucket()
          .file(filePath)
          .delete()
          .then(() => filePath)
      )
    );

    const deleted = [];
    const failed  = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        deleted.push(result.value);
      } else {
        if (result.reason?.code === 404) {
          deleted.push(result.reason?.path || "unknown");
        } else {
          failed.push(result.reason?.path || "unknown");
        }
      }
    }

    return { data: { deleted, failed }, error: null };
  } catch (err) {
    console.error("[FirebaseAdapter] deleteFiles error:", err);
    return { data: null, error: "Failed to delete files" };
  }
}

module.exports = { deleteFile, deleteFiles };
