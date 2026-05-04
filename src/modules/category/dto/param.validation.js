import { param } from "@common/validators.js";

/**
 * Validation schema for category ID parameter
 */
export const categoryIdParamDtoSchema = [
  param("id").notEmpty().withMessage("Category ID is required"),
];
