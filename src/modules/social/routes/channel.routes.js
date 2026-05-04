// channel.routes.js
import express from "express";
import { validateDto } from "@common/middleware/validate-dto.js";
import connectChannelValidation from "@modules/social/dto/connect-channel.validation.js";

export function createChannelRoutes(controller) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const channels = await controller.getConnectedChannels(req.user.id);
      return res.json({
        status: "success",
        message: "Channels retrieved",
        data: channels,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "error", message: error.message, data: null });
    }
  });

  router.get("/oauth-url/:platform", async (req, res) => {
    try {
      const url = await controller.getOAuthUrl(
        req.params.platform,
        req.user.id
      );
      return res.json({
        status: "success",
        message: "OAuth URL generated",
        data: url,
      });
    } catch (error) {
        console.log("oAuth error ", error);
      return res
        .status(400)
        .json({ status: "error", message: error.message, data: null });
    }
  });

  router.post(
    "/connect",
    validateDto(connectChannelValidation),
    async (req, res) => {
      try {
        const channel = await controller.connectChannel(
          req.body.platform,
          req.user.id,
          req.body.authCode
        );
        return res
          .status(201)
          .json({
            status: "success",
            message: "Channel connected",
            data: channel,
          });
      } catch (error) {
        return res
          .status(400)
          .json({ status: "error", message: error.message, data: null });
      }
    }
  );

  router.post("/:id/disconnect", async (req, res) => {
    try {
      const channel = await controller.disconnectChannel(
        req.params.id,
        req.user.id
      );
      return res.json({
        status: "success",
        message: "Channel disconnected",
        data: channel,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ status: "error", message: error.message, data: null });
    }
  });

  return router;
}
