import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { validateDto } from '@common/middleware/validate-dto.js';
import setInboxSlugDtoSchema from '@modules/inbox/dto/set-inbox-slug.validation.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';
import { getRouteErrorStatusCode, getRouteErrorMessage } from '@common/utilities/route-error.util.js';

/**
 * Inbox settings routes — all merchant-authenticated.
 *
 * GET  /inbox/settings/slug   → fetch current slug
 * PATCH /inbox/settings/slug  → set / update slug
 *
 * @param {InboxController} controller
 * @returns {express.Router}
 */
function createInboxSettingsRoutes(controller) {
  const router = express.Router();

  // GET /inbox/settings/slug
  router.get('/slug', authenticate, authorize(['merchant']), async (req, res) => {
    try {
      const merchantId = req.user.accountId;
      const data = await controller.getInboxSlug(merchantId);
      console.log(`[InboxSettingsRoutes] Fetched inbox slug for merchant ${merchantId}:`, data);
      return res.status(200).json({
        status: 'success',
        message: InboxConstants.SLUG.GET_SUCCESS,
        data,
      });
    } catch (error) {
      return res.status(getRouteErrorStatusCode(error)).json({
        status: 'error',
        message: getRouteErrorMessage(error, InboxConstants.SLUG.SET_FAILED),
        data: null,
      });
    }
  });

  // PATCH /inbox/settings/slug
  router.patch(
    '/slug',
    authenticate,
    authorize(['merchant']),
    validateDto(setInboxSlugDtoSchema, 'Invalid slug'),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const { slug } = req.body;
        const data = await controller.setInboxSlug(merchantId, slug);
        return res.status(200).json({
          status: 'success',
          message: InboxConstants.SLUG.SET_SUCCESS,
          data,
        });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, InboxConstants.SLUG.SET_FAILED),
          data: null,
        });
      }
    },
  );

  return router;
}

export default createInboxSettingsRoutes;
