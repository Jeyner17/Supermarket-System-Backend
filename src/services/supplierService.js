const { Supplier, Product } = require('../../db/models');
const { Op } = require('sequelize');

class SupplierService {
  async getAllSuppliers(includeInactive = false) {
    try {
      const scope = includeInactive ? 'withInactive' : 'defaultScope';
      const suppliers = await Supplier.scope(scope).findAll({
        order: [['name', 'ASC']],
        include: [{
          model: Product,
          as: 'products',
          attributes: ['id'],
          where: { is_active: true },
          required: false
        }]
      });

      const suppliersWithCount = suppliers.map(supplier => ({
        ...supplier.getFullInfo(),
        products_count: supplier.products ? supplier.products.length : 0,
        created_at: supplier.created_at,
        updated_at: supplier.updated_at
      }));

      return {
        success: true,
        data: suppliersWithCount
      };
    } catch (error) {
      throw new Error(`Error fetching suppliers: ${error.message}`);
    }
  }

  async getSupplierById(id) {
    try {
      const supplier = await Supplier.findByPk(id);
      
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      return {
        success: true,
        data: supplier.getFullInfo()
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createSupplier(supplierData) {
    try {
      const supplier = await Supplier.create(supplierData);
      
      return {
        success: true,
        data: supplier.getFullInfo(),
        message: 'Supplier created successfully'
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateSupplier(id, supplierData) {
    try {
      const supplier = await Supplier.findByPk(id);
      
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      await supplier.update(supplierData);

      return {
        success: true,
        data: supplier.getFullInfo(),
        message: 'Supplier updated successfully'
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteSupplier(id) {
    try {
      const supplier = await Supplier.findByPk(id);
      
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      const productsCount = await Product.count({
        where: { 
          supplier_id: id,
          is_active: true 
        }
      });

      if (productsCount > 0) {
        throw new Error(`Cannot delete supplier. It has ${productsCount} active products associated.`);
      }

      await supplier.update({ is_active: false });

      return {
        success: true,
        message: 'Supplier deleted successfully'
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new SupplierService();