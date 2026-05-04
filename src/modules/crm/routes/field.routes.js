import express from "express";
import { authenticate, authorize } from "@common/middleware/auth.middleware.js";
import { validateDto } from "@common/middleware/validate-dto.js";
import createFieldDtoSchema from "@modules/crm/dto/create-field.validation.js";
import updateFieldDtoSchema from "@modules/crm/dto/update-field.validation.js";


/**
 * Field definition routes
 * @param {FieldDefinitionController} fieldController - Field definition controller instance
 * @returns {express.Router} Express router
 */
function createFieldRoutes(fieldController) {
  const router = express.Router();

  /**
   * GET /
   * Get all fields (system + custom)
   */
  router.get("/", authenticate, authorize(["merchant"]), async (req, res) => {
    try {
      const fields = await fieldController.getAllFields(req.user.accountId);
      return res.status(200).json({
        status: "success",
        message: "Fields retrieved successfully",
        data: fields,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message,
        data: null,
      });
    }
  });

  /**
   * POST /
   * Create a custom field definition
   */
  router.post(
    "/",
    authenticate,
    authorize(["merchant"]),
    validateDto(createFieldDtoSchema, "Failed to create field"),
    async (req, res) => {
      try {
        const field = await fieldController.createField(
          req.body,
          req.user.accountId,
        );
        return res.status(201).json({
          status: "success",
          message: "Field created successfully",
          data: field,
        });
      } catch (error) {
        return res.status(error.statusCode || 500).json({
          status: "error",
          message: error.message,
          data: null,
        });
      }
    },
  );

  /**
   * GET /summary
   * Get field summary counts (system + custom)
   */
  router.get(
    "/summary",
    authenticate,
    authorize(["merchant"]),
    async (req, res) => {
      try {
        const summary = await fieldController.getFieldSummary(req.user.accountId);
        return res.status(200).json({
          status: "success",
          message: "Field summary retrieved successfully",
          data: summary,
        });
      } catch (error) {
        return res.status(error.statusCode || 500).json({
          status: "error",
          message: error.message,
          data: null,
        });
      }
    },
  );

  /**
   * GET /:id
   * Get field definition by ID
   */
  router.get(
    "/:id",
    authenticate,
    authorize(["merchant"]),
    async (req, res) => {
      try {
        const field = await fieldController.getFieldById(
          req.params.id,
          req.user.accountId,
        );
        return res.status(200).json({
          status: "success",
          message: "Field retrieved successfully",
          data: field,
        });
      } catch (error) {
        return res.status(error.statusCode || 500).json({
          status: "error",
          message: error.message,
          data: null,
        });
      }
    },
  );

  /**
   * PATCH /:id
   * Update a custom field definition
   */
  router.patch(
    "/:id",
    authenticate,
    authorize(["merchant"]),
    validateDto([...updateFieldDtoSchema], "Failed to update field"),
    async (req, res) => {
      try {
        const field = await fieldController.updateField(
          req.params.id,
          req.body,
          req.user.accountId,
        );
        return res.status(200).json({
          status: "success",
          message: "Field updated successfully",
          data: field,
        });
      } catch (error) {
        return res.status(error.statusCode || 500).json({
          status: "error",
          message: error.message,
          data: null,
        });
      }
    },
  );

  /**
   * DELETE /:id
   * Delete a custom field definition
   */
  router.delete(
    "/:id",
    authenticate,
    authorize(["merchant"]),
    async (req, res) => {
      try {
        const field = await fieldController.deleteField(
          req.params.id,
          req.user.accountId,
        );
        return res.status(200).json({
          status: "success",
          message: "Field deleted successfully",
          data: field,
        });
      } catch (error) {
        return res.status(error.statusCode || 500).json({
          status: "error",
          message: error.message,
          data: null,
        });
      }
    },
  );

  return router;
}

export default createFieldRoutes;
