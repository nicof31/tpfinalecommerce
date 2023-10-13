import Joi from "joi";

const userAllResponseDto = Joi.object({
  _id: Joi.alternatives().try(Joi.string(), Joi.object()).required().messages({
    "alternatives.types": `"ID" debe ser un tipo de texto o un objeto ObjectId`,
    "any.required": `"ID" es un campo requerido`,
  }),
  first_name: Joi.string()
    .required()
    .messages({
      "string.base": `"First Name" debe ser un tipo de texto`,
      "any.required": `"First Name" es un campo requerido`,
    }),
  last_name: Joi.string()
    .required()
    .messages({
      "string.base": `"Last Name" debe ser un tipo de texto`,
      "any.required": `"Last Name" es un campo requerido`,
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.base": `"Email" debe ser un tipo de texto`,
      "string.email": `"Email" debe ser un correo electrónico válido`,
      "any.required": `"Email" es un campo requerido`,
    }),
  role: Joi.string()
    .valid("PUBLIC", "USER", "ADMIN", "PREMIUM")
    .required()
    .messages({
      "string.base": `"Role" debe ser un tipo de texto`,
      "any.only": `"Role" debe ser uno de los valores permitidos: 'PUBLIC', 'USER', 'ADMIN'`,
      "any.required": `"Role" es un campo requerido`,
    }),
  last_connection: Joi.date().iso(),
});

export default userAllResponseDto;
