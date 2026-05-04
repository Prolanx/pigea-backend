import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { getBucket } from '@adapters/storage/init.js';
import {
  validateFile,
  buildDownloadUrl,
  getSignedUrl,
  getSignedUrls,
  buildProductImageFolder,
  buildVariantMediaFolder,
} from '@adapters/storage/helpers.js';

const SIGNED_URL_EXPIRY_MINUTES = 15;

/**
 * POST /storage/signed-url
 *
 * Generates a v4 signed URL for a business-info logo upload.
 * The file path is deterministic: business-info/{accountId}-logo.{ext}
 * — uploading a new logo always overwrites the previous one.
 *
 * Request body: { fileName, contentType, fileSize }
 * Response:     { signedUrl, filePath, downloadUrl }
 */
function createStorageRoutes() {
  const router = express.Router();

  router.post(
    '/signed-url',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const { fileName, contentType, fileSize } = req.body;
        const accountId = req.user.accountId;

        if (!fileName || !contentType || !fileSize) {
          return res.status(400).json({
            status: 'error',
            message: 'fileName, contentType and fileSize are required',
            data: null,
          });
        }

        // Validate file type and size
        const validation = validateFile(contentType, Number(fileSize));
        if (!validation.valid) {
          return res.status(400).json({
            status: 'error',
            message: validation.message,
            data: null,
          });
        }

        // Build deterministic path — overwrites previous logo for this account
        const ext      = fileName.split('.').pop().toLowerCase();
        const filePath = `business-info/${accountId}-logo.${ext}`;

        const file = getBucket().file(filePath);

        const [signedUrl] = await file.getSignedUrl({
          version:     'v4',
          action:      'write',
          expires:     Date.now() + SIGNED_URL_EXPIRY_MINUTES * 60 * 1000,
          contentType,
        });

        const downloadUrl = buildDownloadUrl(filePath);

        return res.status(200).json({
          status:  'success',
          message: 'Signed URL generated',
          data:    { signedUrl, filePath, downloadUrl },
        });
      } catch (err) {
        console.error('[StorageRoute] signed-url error:', err);
        return res.status(500).json({
          status:  'error',
          message: 'Failed to generate signed URL',
          data:    null,
        });
      }
    },
  );

  router.post(
    '/signed-url/product',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const { fileName, contentType, fileSize } = req.body;
        const accountId = req.user.accountId;

        if (!fileName || !contentType || !fileSize) {
          return res.status(400).json({
            status: 'error',
            message: 'fileName, contentType and fileSize are required',
            data: null,
          });
        }

        const signedUrlResult = await getSignedUrl({
          folder:      buildProductImageFolder(accountId),
          fileName,
          contentType,
          fileSize:    Number(fileSize),
        });

        if (signedUrlResult.error) {
          return res.status(400).json({
            status: 'error',
            message: signedUrlResult.error,
            data: null,
          });
        }

        return res.status(200).json({
          status:  'success',
          message: 'Product image signed URL generated',
          data:    signedUrlResult.data,
        });
      } catch (err) {
        console.error('[StorageRoute] signed-url/product error:', err);
        return res.status(500).json({
          status:  'error',
          message: 'Failed to generate product image signed URL',
          data:    null,
        });
      }
    },
  );

  router.post(
    '/signed-url/variant',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const { fileName, contentType, fileSize, productId } = req.body;
        const accountId = req.user.accountId;

        if (!fileName || !contentType || !fileSize) {
          return res.status(400).json({
            status: 'error',
            message: 'fileName, contentType and fileSize are required',
            data: null,
          });
        }

        const signedUrlResult = await getSignedUrl({
          folder:      buildVariantMediaFolder(accountId, productId || null),
          fileName,
          contentType,
          fileSize:    Number(fileSize),
        });

        if (signedUrlResult.error) {
          return res.status(400).json({
            status: 'error',
            message: signedUrlResult.error,
            data: null,
          });
        }

        return res.status(200).json({
          status:  'success',
          message: 'Variant media signed URL generated',
          data:    signedUrlResult.data,
        });
      } catch (err) {
        console.error('[StorageRoute] signed-url/variant error:', err);
        return res.status(500).json({
          status:  'error',
          message: 'Failed to generate variant media signed URL',
          data:    null,
        });
      }
    },
  );

  router.post(
    '/signed-url/batch',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const { files } = req.body;
        const accountId = req.user.accountId;

        if (!Array.isArray(files) || files.length === 0) {
          return res.status(400).json({
            status: 'error',
            message: 'files must be a non-empty array',
            data: null,
          });
        }

        const signedUrlRequests = [];

        for (const file of files) {
          const { fileName, contentType, fileSize, type, productId } = file;

          if (!fileName || !contentType || !fileSize || !type) {
            return res.status(400).json({
              status: 'error',
              message: 'Each file must include fileName, contentType, fileSize, and type',
              data: null,
            });
          }

          let folder;

          if (type === 'product') {
            folder = buildProductImageFolder(accountId);
          } else if (type === 'variant') {
            folder = buildVariantMediaFolder(accountId, productId || null);
          } else {
            return res.status(400).json({
              status: 'error',
              message: 'Invalid file type. Expected product or variant',
              data: null,
            });
          }

          signedUrlRequests.push({
            folder,
            fileName,
            contentType,
            fileSize: Number(fileSize),
          });
        }

        const signedUrlResult = await getSignedUrls(signedUrlRequests);

        if (signedUrlResult.error) {
          return res.status(400).json({
            status: 'error',
            message: signedUrlResult.error,
            data: null,
          });
        }

        return res.status(200).json({
          status:  'success',
          message: 'Batch signed URLs generated',
          data:    signedUrlResult.data,
        });
      } catch (err) {
        console.error('[StorageRoute] signed-url/batch error:', err);
        return res.status(500).json({
          status:  'error',
          message: 'Failed to generate batch signed URLs',
          data:    null,
        });
      }
    },
  );

  return router;
}

export default createStorageRoutes;
