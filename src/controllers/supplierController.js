const supplierService = require('../services/supplierService');

const getAllSuppliers = async (req, res, next) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const result = await supplierService.getAllSuppliers(includeInactive);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await supplierService.getSupplierById(id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Supplier not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const result = await supplierService.createSupplier(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await supplierService.updateSupplier(id, req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Supplier not found') {
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

const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await supplierService.deleteSupplier(id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Supplier not found') {
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
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};