// File: backend/src/middleware/validation.js (VERSIÓN CORREGIDA)
const Joi = require('joi');

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .pattern(/^[a-zA-Z0-9\s_.-]+$/) // ✅ Permite letras, números, espacios, guiones y puntos
      .required()
      .messages({
        'string.pattern.base': 'Username can only contain letters, numbers, spaces, dots, hyphens and underscores',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must not exceed 50 characters',
        'any.required': 'Username is required'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

const validateUserCreation = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .pattern(/^[a-zA-Z0-9\s_.-]+$/) // ✅ Misma validación flexible
      .required()
      .messages({
        'string.pattern.base': 'Username can only contain letters, numbers, spaces, dots, hyphens and underscores',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must not exceed 50 characters',
        'any.required': 'Username is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      }),
    first_name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZÀ-ÿ\s]+$/) // ✅ Permite letras con acentos y espacios
      .required()
      .messages({
        'string.pattern.base': 'First name can only contain letters and spaces',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name must not exceed 50 characters',
        'any.required': 'First name is required'
      }),
    last_name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZÀ-ÿ\s]+$/) // ✅ Permite letras con acentos y espacios
      .required()
      .messages({
        'string.pattern.base': 'Last name can only contain letters and spaces',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name must not exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    role_id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.positive': 'Role ID must be a positive number',
        'any.required': 'Role ID is required'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateLogin,
  validateUserCreation
};