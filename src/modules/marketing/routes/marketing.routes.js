import express from "express";
import { validateDto } from "@common/middleware/validate-dto.js";
import subscribeDtoSchema from "@modules/marketing/dto/subscribe.validation.js";
import contactDtoSchema from "@modules/marketing/dto/contact.validation.js";
import * as brevoAdapter from "@adapters/brevo/brevo.js";
import MarketingController from "@modules/marketing/controller/marketing/_index.js";

function createMarketingRoutes({ controller } = {}) {
  const router = express.Router();

  // Controller can be injected by composer or tests; default to local wiring for backwards compatibility
  const ctrl = controller || new MarketingController(brevoAdapter);

  // POST /api/marketing/subscribe
  router.post(
    "/subscribe",
    validateDto(subscribeDtoSchema, "Failed to subscribe"),
    async (req, res) => {
      try {
        const { name, email } = req.body;
        const result = await ctrl.subscribe({ name, email });
        return res
          .status(201)
          .json({
            status: "success",
            message: result.message,
            data: result.data,
          });
      } catch (error) {
        return res
          .status(error.statusCode || 500)
          .json({ status: "error", message: error.message, data: null });
      }
    },
  );

  // POST /api/marketing/contact
  router.post(
    "/contact",
    validateDto(contactDtoSchema, "Failed to send contact message"),
    async (req, res) => {
      try {
        const { firstName, lastName, email, phone, userType, message, termsAccepted } = req.body;
        const result = await ctrl.sendContactMessage({
          firstName,
          lastName,
          email,
          phone,
          userType,
          message,
          termsAccepted,
        });
        return res
          .status(200)
          .json({
            status: "success",
            message: result.message,
            data: result.data,
          });
      } catch (error) {
        return res
          .status(error.statusCode || 500)
          .json({ status: "error", message: error.message, data: null });
      }
    },
  );

  return router;
}

export default createMarketingRoutes;
