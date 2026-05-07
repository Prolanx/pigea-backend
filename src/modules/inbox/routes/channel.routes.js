import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { validateDto } from '@common/middleware/validate-dto.js';
import { ResponseUtils } from '@common/utilities/response.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';
import connectChannelDtoSchema from '@modules/inbox/dto/connect-channel.validation.js';
import updateChannelConfigDtoSchema from '@modules/inbox/dto/update-channel-config.validation.js';
import channelTypeParamDtoSchema from '@modules/inbox/dto/channel-type-param.validation.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

function createInboxChannelRoutes(controller) {
  const router = express.Router();

  router.get(
    '/',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const channels = await controller.listChannels(req.user.accountId);
        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.CHANNELS_RETRIEVED, channels),
        );
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, InboxConstants.ERRORS.CHANNELS_LIST_FAILED), null),
        );
      }
    },
  );

  router.get(
    '/summary',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const summary = await controller.getChannelSummary(req.user.accountId);
        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.CHANNELS_SUMMARY_RETRIEVED, summary),
        );
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, InboxConstants.ERRORS.CHANNELS_SUMMARY_FAILED), null),
        );
      }
    },
  );

  router.post(
    '/:channelType/connect',
    authenticate,
    authorize(['merchant']),
    validateDto(channelTypeParamDtoSchema, InboxConstants.ERRORS.CHANNEL_CONNECT_FAILED),
    validateDto(connectChannelDtoSchema, InboxConstants.ERRORS.CHANNEL_CONNECT_FAILED),
    async (req, res) => {
      try {
        const channel = await controller.connectChannel(
          req.user.accountId,
          req.params.channelType,
          req.body,
        );
        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.CHANNEL_CONNECTED, channel),
        );
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, InboxConstants.ERRORS.CHANNEL_CONNECT_FAILED), null),
        );
      }
    },
  );

  router.post(
    '/:channelType/disconnect',
    authenticate,
    authorize(['merchant']),
    validateDto(channelTypeParamDtoSchema, InboxConstants.ERRORS.CHANNEL_DISCONNECT_FAILED),
    async (req, res) => {
      try {
        const channel = await controller.disconnectChannel(
          req.user.accountId,
          req.params.channelType,
        );
        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.CHANNEL_DISCONNECTED, channel),
        );
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, InboxConstants.ERRORS.CHANNEL_DISCONNECT_FAILED), null),
        );
      }
    },
  );

  router.patch(
    '/:channelType/config',
    authenticate,
    authorize(['merchant']),
    validateDto(channelTypeParamDtoSchema, InboxConstants.ERRORS.CHANNEL_CONFIG_UPDATE_FAILED),
    validateDto(updateChannelConfigDtoSchema, InboxConstants.ERRORS.CHANNEL_CONFIG_UPDATE_FAILED),
    async (req, res) => {
      try {
        const channel = await controller.updateChannelConfig(
          req.user.accountId,
          req.params.channelType,
          req.body,
        );
        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.CHANNEL_CONFIG_UPDATED, channel),
        );
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, InboxConstants.ERRORS.CHANNEL_CONFIG_UPDATE_FAILED), null),
        );
      }
    },
  );

  return router;
}

export default createInboxChannelRoutes;
