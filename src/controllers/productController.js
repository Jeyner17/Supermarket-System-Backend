const productService = require('../services/productService');

const getAllProducts = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      search: req.query.search || '',
      category_id: req.query.category_id || null,
      supplier_id: req.query.supplier_id || null,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : true,
      low_stock: req.query.low_stock === 'true',
      expiring: req.query.expiring === 'true'
    };

    const result = await productService.getAllProducts(filters);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await productService.getProductById(id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const result = await productService.createProduct(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await productService.updateProduct(id, req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await productService.deleteProduct(id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const restoreProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await productService.restoreProduct(id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const getLowStockProducts = async (req, res, next) => {
  try {
    const result = await productService.getLowStockProducts();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getExpiringProducts = async (req, res, next) => {
  try {
    const result = await productService.getExpiringProducts();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body;
    
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    const result = await productService.updateStock(id, quantity, operation);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getProductStats = async (req, res, next) => {
  try {
    const result = await productService.getProductStats();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getLowStockProducts,
  getExpiringProducts,
  updateStock,
  getProductStats
};