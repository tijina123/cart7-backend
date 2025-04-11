// import mongoose from "mongoose";
import mongoose from "mongoose";


/**
 * Dynamic validation function for checking request body data types.
 * @param {Object} schemaDefinition - Mongoose schema definition (model.schema.obj).
 */
export const validateRequest = (schemaDefinition) => (req, res, next) => {
    const errors = [];

    // Iterate over schema fields
    Object.entries(schemaDefinition).forEach(([key, value]) => {
        const fieldType = value.type;
        const isRequired = value.required;

        // Get the field value from req.body
        const fieldValue = req.body[key];

        // Check required fields
        if (isRequired && (fieldValue === undefined || fieldValue === "")) {
            errors.push(`${key} is required.`);
            return;
        }

        // Validate field types
        if (fieldValue !== undefined) {
            if (fieldType === String && typeof fieldValue !== "string") {
                errors.push(`${key} must be a string.`);
            } else if (fieldType === Number && typeof fieldValue !== "number") {
                errors.push(`${key} must be a number.`);
            } else if (fieldType === Boolean && typeof fieldValue !== "boolean") {
                errors.push(`${key} must be a boolean.`);
            } else if (fieldType === mongoose.Schema.Types.ObjectId && !mongoose.Types.ObjectId.isValid(fieldValue)) {
                errors.push(`${key} must be a valid ObjectId.`);
            } else if (Array.isArray(fieldType) && !Array.isArray(fieldValue)) {
                errors.push(`${key} must be an array.`);
            }
        }
    });

    // If errors exist, return response
    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    next();
};
