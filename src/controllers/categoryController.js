const categoryService = require('../services/categoryService');

const getAllCategories = async (req, res, next) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const result = await categoryService.getAllCategories(includeInactive);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await categoryService.getCategoryById(id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const result = await categoryService.createCategory(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await categoryService.updateCategory(id, req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Category not found') {
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

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await categoryService.deleteCategory(id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Category not found') {
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

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};