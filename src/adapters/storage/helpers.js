/**
 * common/adapters/storage/helpers.js
 *
 * Storage utility functions and signed URL operations.
 * Uses the shared bucket instance from init.js directly.
 */

import { v4 as uuidv4 } from "uuid";
import { getBucket, getBucketName } from "./init.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const SIGNED_URL_EXPIRY_MINUTES = 15;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

/**
 * Validate file metadata before issuing a signed URL.
 * @param {string} contentType
 * @param {number} fileSize
 * @returns {{ valid: boolean, message?: string }}
 */
function validateFile(contentType, fileSize) {
  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    return {
      valid:   false,
      message: `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      valid:   false,
      message: `File size exceeds the ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB limit`,
    };
  }
  return { valid: true };
}

/**
 * Construct the public download URL for a given file path.
 * Must match the URL format saved in MongoDB exactly.
 *
 * @param {string} filePath - e.g. "uploads/products/abc123.jpg"
 * @returns {string}
 */
function buildDownloadUrl(filePath) {
  const bucketName = getBucketName();
  const encoded    = encodeURIComponent(filePath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encoded}?alt=media`;
}

/**
 * Generate a unique file path for a given folder and original filename.
 * Uses UUID to prevent collisions.
 *
 * @param {string} folder   - e.g. "uploads/products"
 * @param {string} fileName - original filename from client
 * @returns {string}        - e.g. "uploads/products/a1b2c3.jpg"
 */
function buildFilePath(folder, fileName) {
  const ext      = fileName.split(".").pop().toLowerCase();
  const uniqueId = uuidv4();
  return `${folder}/${uniqueId}.${ext}`;
}

/**
 * Build the storage folder for merchant-scoped product images.
 * Example: "products/{merchantId}"
 *
 * @param {string} merchantId
 * @returns {string}
 */
function buildProductImageFolder(merchantId) {
  return `products/${merchantId}`;
}

/**
 * Build the storage folder for product variant media.
 * If a productId is provided, variant media are nested under that product.
 * Example: "products/{merchantId}/{productId}/variants"
 *
 * @param {string} merchantId
 * @param {string|null} productId
 * @returns {string}
 */
function buildVariantMediaFolder(merchantId, productId = null) {
  if (productId) {
    return `products/${merchantId}/${productId}/variants`;
  }

  return `products/${merchantId}/variants`;
}

/**
 * Build a file path for a product image upload.
 * Uses a UUID to avoid collisions while keeping uploads scoped by merchant.
 *
 * @param {string} merchantId
 * @param {string} fileName
 * @returns {string}
 */
function buildProductImagePath(merchantId, fileName) {
  return buildFilePath(buildProductImageFolder(merchantId), fileName);
}

/**
 * Build a file path for variant media upload.
 * Uses merchant and product scoping to keep variant assets organized.
 *
 * @param {object} params
 * @param {string} params.merchantId
 * @param {string|null} params.productId
 * @param {string} params.fileName
 * @returns {string}
 */
function buildVariantMediaPath({ merchantId, productId = null, fileName }) {
  return buildFilePath(buildVariantMediaFolder(merchantId, productId), fileName);
}

// ─── Signed URL Methods ───────────────────────────────────────────────────────

/**
 * Generate a signed URL for a single file upload.
 * The client uses this URL to upload directly to Firebase Storage.
 *
 * @param {object} params
 * @param {string} params.folder      - e.g. "uploads/products"
 * @param {string} params.fileName    - original filename from client
 * @param {string} params.contentType - MIME type e.g. "image/jpeg"
 * @param {number} params.fileSize    - file size in bytes
 *
 * @returns {Promise<{
 *   data: { signedUrl: string, filePath: string, downloadUrl: string } | null,
 *   error: string | null
 * }>}
 */
async function getSignedUrl({ folder, fileName, contentType, fileSize }) {
  try {
    const validation = validateFile(contentType, fileSize);
    if (!validation.valid) {
      return { data: null, error: validation.message };
    }

    const filePath = buildFilePath(folder, fileName);
    const file     = getBucket().file(filePath);

    const [signedUrl] = await file.getSignedUrl({
      version:     "v4",
      action:      "write",
      expires:     Date.now() + SIGNED_URL_EXPIRY_MINUTES * 60 * 1000,
      contentType,
    });

    return {
      data: {
        signedUrl,                               // client uploads directly to this
        filePath,                                // keep if you need to reference or delete later
        downloadUrl: buildDownloadUrl(filePath), // save this in MongoDB
      },
      error: null,
    };
  } catch (err) {
    console.error("[FirebaseAdapter] getSignedUrl error:", err);
    return { data: null, error: "Failed to generate signed URL" };
  }
}

/**
 * Generate signed URLs for multiple file uploads.
 * Validates all files first, then generates all URLs in parallel.
 *
 * @param {Array<{
 *   folder: string,
 *   fileName: string,
 *   contentType: string,
 *   fileSize: number
 * }>} files
 *
 * @returns {Promise<{
 *   data: Array<{ signedUrl: string, filePath: string, downloadUrl: string }> | null,
 *   error: string | null
 * }>}
 */
async function getSignedUrls(files) {
  try {
    // Validate all files before generating any URLs
    for (const file of files) {
      const validation = validateFile(file.contentType, file.fileSize);
      if (!validation.valid) {
        return { data: null, error: `${file.fileName}: ${validation.message}` };
      }
    }

    // Generate all signed URLs in parallel
    const results = await Promise.all(
      files.map(({ folder, fileName, contentType }) => {
        const filePath = buildFilePath(folder, fileName);
        const fileRef  = getBucket().file(filePath);

        return fileRef
          .getSignedUrl({
            version:     "v4",
            action:      "write",
            expires:     Date.now() + SIGNED_URL_EXPIRY_MINUTES * 60 * 1000,
            contentType,
          })
          .then(([signedUrl]) => ({
            signedUrl,
            filePath,
            downloadUrl: buildDownloadUrl(filePath),
          }));
      })
    );

    return { data: results, error: null };
  } catch (err) {
    console.error("[FirebaseAdapter] getSignedUrls error:", err);
    return { data: null, error: "Failed to generate signed URLs" };
  }
}

/**
 * Get the download URL for an existing file path.
 *
 * @param {string} filePath
 * @returns {{ data: { downloadUrl: string } | null, error: string | null }}
 */
function getDownloadUrl(filePath) {
  try {
    return {
      data:  { downloadUrl: buildDownloadUrl(filePath) },
      error: null,
    };
  } catch (err) {
    console.error("[FirebaseAdapter] getDownloadUrl error:", err);
    return { data: null, error: "Failed to build download URL" };
  }
}

export {
  validateFile,
  buildDownloadUrl,
  buildFilePath,
  buildProductImageFolder,
  buildProductImagePath,
  buildVariantMediaFolder,
  buildVariantMediaPath,
  getSignedUrl,
  getSignedUrls,
  getDownloadUrl,
};
