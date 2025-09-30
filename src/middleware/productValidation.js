const Joi = require('joi');

const validateProduct = (req, res, next) => {
  const schema = Joi.object({
    barcode: Joi.string().allow('', null).max(50),
    name: Joi.string().required().min(2).max(200).messages({
      'any.required': 'Product name is required',
      'string.min': 'Product name must be at least 2 characters',
      'string.max': 'Product name must not exceed 200 characters'
    }),
    description: Joi.string().allow('', null),
    category_id: Joi.number().integer().positive().allow(null),
    supplier_id: Joi.number().integer().positive().allow(null),
    cost_price: Joi.number().min(0).required().messages({
      'any.required': 'Cost price is required',
      'number.min': 'Cost price must be positive'
    }),
    selling_price: Joi.number().min(0).required().messages({
      'any.required': 'Selling price is required',
      'number.min': 'Selling price must be positive'
    }),
    stock_quantity: Joi.number().integer().min(0).default(0),
    min_stock_level: Joi.number().integer().min(0).default(0),
    max_stock_level: Joi.number().integer().min(0).allow(null),
    unit_of_measure: Joi.string().valid('UNIT', 'KG', 'LB', 'LITER', 'ML', 'PACK', 'BOX').default('UNIT'),
    expiration_date: Joi.date().allow(null),
    is_perishable: Joi.boolean().default(false),
    image_url: Joi.string().uri().allow('', null),
    notes: Joi.string().allow('', null),
    is_active: Joi.boolean().default(true)
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  // ✅ VALIDACIONES PERSONALIZADAS DESPUÉS DE JOI
  const validationErrors = [];

  // Validación: selling_price debe ser mayor o igual que cost_price
  if (value.selling_price !== undefined && value.cost_price !== undefined) {
    if (value.selling_price < value.cost_price) {
      validationErrors.push('Selling price must be greater than or equal to cost price');
    }
  }

  // Validación: max_stock debe ser mayor que min_stock
  if (value.max_stock_level && value.min_stock_level !== undefined) {
    if (value.max_stock_level <= value.min_stock_level) {
      validationErrors.push('Max stock level must be greater than min stock level');
    }
  }

  // Validación: productos perecederos deben tener fecha
  if (value.is_perishable === true && !value.expiration_date) {
    validationErrors.push('Perishable products must have an expiration date');
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Business validation error',
      details: validationErrors
    });
  }

  // Pasar los datos validados al siguiente middleware
  req.body = value;
  next();
};

const validateProductUpdate = (req, res, next) => {
  // Para updates, permitir campos opcionales
  const schema = Joi.object({
    barcode: Joi.string().allow('', null).max(50),
    name: Joi.string().min(2).max(200),
    description: Joi.string().allow('', null),
    category_id: Joi.number().integer().positive().allow(null),
    supplier_id: Joi.number().integer().positive().allow(null),
    cost_price: Joi.number().min(0),
    selling_price: Joi.number().min(0),
    stock_quantity: Joi.number().integer().min(0),
    min_stock_level: Joi.number().integer().min(0),
    max_stock_level: Joi.number().integer().min(0).allow(null),
    unit_of_measure: Joi.string().valid('UNIT', 'KG', 'LB', 'LITER', 'ML', 'PACK', 'BOX'),
    expiration_date: Joi.date().allow(null),
    is_perishable: Joi.boolean(),
    image_url: Joi.string().uri().allow('', null),
    notes: Joi.string().allow('', null),
    is_active: Joi.boolean()
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  // ✅ VALIDACIONES PERSONALIZADAS PARA UPDATE
  const validationErrors = [];

  // Solo validar precios si ambos están presentes
  if (value.selling_price !== undefined && value.cost_price !== undefined) {
    if (value.selling_price < value.cost_price) {
      validationErrors.push('Selling price must be greater than or equal to cost price');
    }
  }

  // Solo validar stock levels si ambos están presentes
  if (value.max_stock_level !== undefined && value.min_stock_level !== undefined) {
    if (value.max_stock_level <= value.min_stock_level) {
      validationErrors.push('Max stock level must be greater than min stock level');
    }
  }

  // Validar productos perecederos solo si se está actualizando is_perishable
  if (value.is_perishable === true && value.expiration_date === undefined) {
    // Para updates, solo validar si se está cambiando a perecedero sin fecha
    validationErrors.push('Perishable products must have an expiration date');
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Business validation error',
      details: validationErrors
    });
  }

  req.body = value;
  next();
};

const validateCategory = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(100).messages({
      'any.required': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters',
      'string.max': 'Category name must not exceed 100 characters'
    }),
    description: Joi.string().allow('', null),
    is_active: Joi.boolean().default(true)
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

const validateSupplier = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(100).messages({
      'any.required': 'Supplier name is required',
      'string.min': 'Supplier name must be at least 2 characters',
      'string.max': 'Supplier name must not exceed 100 characters'
    }),
    contact_person: Joi.string().allow('', null).max(100),
    email: Joi.string().email().allow('', null).messages({
      'string.email': 'Please provide a valid email address'
    }),
    phone: Joi.string().allow('', null).max(20),
    address: Joi.string().allow('', null),
    tax_id: Joi.string().allow('', null).max(20),
    is_active: Joi.boolean().default(true)
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

const validateStockUpdate = (req, res, next) => {
  const schema = Joi.object({
    quantity: Joi.number().integer().min(0).required().messages({
      'any.required': 'Quantity is required',
      'number.min': 'Quantity must be positive'
    }),
    operation: Joi.string().valid('SET', 'ADD', 'SUBTRACT').default('SET')
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
  validateProduct,
  validateProductUpdate,
  validateCategory,
  validateSupplier,
  validateStockUpdate
};