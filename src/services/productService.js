const { Product, Category, Supplier } = require('../../db/models');
const { Op } = require('sequelize');

class ProductService {
  async getAllProducts(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        category_id = null,
        supplier_id = null,
        is_active = true,
        low_stock = false,
        expiring = false
      } = filters;

      const offset = (page - 1) * limit;

      const whereConditions = {};

      if (is_active !== null) {
        whereConditions.is_active = is_active;
      }

      if (search) {
        whereConditions[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { barcode: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (category_id) {
        whereConditions.category_id = category_id;
      }

      if (supplier_id) {
        whereConditions.supplier_id = supplier_id;
      }

      if (low_stock) {
        whereConditions[Op.and] = [
          { stock_quantity: { [Op.lte]: { [Op.col]: 'min_stock_level' } } }
        ];
      }

      if (expiring) {
        const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        whereConditions.expiration_date = {
          [Op.between]: [new Date(), threeDaysFromNow]
        };
      }

      const { count, rows } = await Product.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: Supplier,
            as: 'supplier',
            attributes: ['id', 'name', 'contact_person']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      const products = rows.map(product => ({
        ...product.getFullInfo(),
        category: product.category,
        supplier: product.supplier
      }));

      return {
        success: true,
        data: products,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  async getProductById(id) {
    try {
      const product = await Product.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category'
          },
          {
            model: Supplier,
            as: 'supplier'
          }
        ]
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return {
        success: true,
        data: product.getFullInfo()
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createProduct(productData) {
    try {
      if (productData.category_id) {
        const category = await Category.findByPk(productData.category_id);
        if (!category) {
          throw new Error('Category not found');
        }
      }

      if (productData.supplier_id) {
        const supplier = await Supplier.findByPk(productData.supplier_id);
        if (!supplier) {
          throw new Error('Supplier not found');
        }
      }

      if (productData.barcode) {
        const existingProduct = await Product.findOne({
          where: { barcode: productData.barcode }
        });
        if (existingProduct) {
          throw new Error('Barcode already exists');
        }
      }

      const product = await Product.create(productData);

      const productWithRelations = await Product.findByPk(product.id, {
        include: [
          { model: Category, as: 'category' },
          { model: Supplier, as: 'supplier' }
        ]
      });

      return {
        success: true,
        data: productWithRelations.getFullInfo(),
        message: 'Product created successfully'
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateProduct(id, productData) {
    try {
      const product = await Product.findByPk(id);

      if (!product) {
        throw new Error('Product not found');
      }

      if (productData.category_id) {
        const category = await Category.findByPk(productData.category_id);
        if (!category) {
          throw new Error('Category not found');
        }
      }

      if (productData.supplier_id) {
        const supplier = await Supplier.findByPk(productData.supplier_id);
        if (!supplier) {
          throw new Error('Supplier not found');
        }
      }

      if (productData.barcode && productData.barcode !== product.barcode) {
        const existingProduct = await Product.findOne({
          where: {
            barcode: productData.barcode,
            id: { [Op.ne]: id }
          }
        });
        if (existingProduct) {
          throw new Error('Barcode already exists');
        }
      }

      const combinedData = {
        ...product.dataValues,
        ...productData
      };

      if (combinedData.selling_price < combinedData.cost_price) {
        throw new Error('Selling price must be greater than or equal to cost price');
      }

      if (combinedData.max_stock_level && combinedData.max_stock_level <= combinedData.min_stock_level) {
        throw new Error('Max stock level must be greater than min stock level');
      }

      if (combinedData.is_perishable && !combinedData.expiration_date) {
        throw new Error('Perishable products must have an expiration date');
      }

      await product.update(productData);

      const updatedProduct = await Product.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { model: Supplier, as: 'supplier' }
        ]
      });

      return {
        success: true,
        data: updatedProduct.getFullInfo(),
        message: 'Product updated successfully'
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteProduct(id) {
    try {
      const product = await Product.findByPk(id);

      if (!product) {
        throw new Error('Product not found');
      }

      await product.update({ is_active: false });

      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async restoreProduct(id) {
    try {
      const product = await Product.scope('withInactive').findByPk(id);

      if (!product) {
        throw new Error('Product not found');
      }

      await product.update({ is_active: true });

      return {
        success: true,
        message: 'Product restored successfully'
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getLowStockProducts() {
    try {
      const products = await Product.scope('lowStock').findAll({
        include: [
          { model: Category, as: 'category' },
          { model: Supplier, as: 'supplier' }
        ],
        order: [['stock_quantity', 'ASC']]
      });

      return {
        success: true,
        data: products.map(product => product.getFullInfo())
      };
    } catch (error) {
      throw new Error(`Error fetching low stock products: ${error.message}`);
    }
  }

  async getExpiringProducts() {
    try {
      const products = await Product.scope('expiring').findAll({
        include: [
          { model: Category, as: 'category' },
          { model: Supplier, as: 'supplier' }
        ],
        order: [['expiration_date', 'ASC']]
      });

      return {
        success: true,
        data: products.map(product => product.getFullInfo())
      };
    } catch (error) {
      throw new Error(`Error fetching expiring products: ${error.message}`);
    }
  }

  async updateStock(id, quantity, operation = 'SET') {
    try {
      const product = await Product.findByPk(id);

      if (!product) {
        throw new Error('Product not found');
      }

      let newQuantity;

      switch (operation) {
        case 'ADD':
          newQuantity = product.stock_quantity + quantity;
          break;
        case 'SUBTRACT':
          newQuantity = Math.max(0, product.stock_quantity - quantity);
          break;
        case 'SET':
        default:
          newQuantity = quantity;
          break;
      }

      await product.update({ stock_quantity: newQuantity });

      return {
        success: true,
        data: {
          id: product.id,
          name: product.name,
          previous_stock: product.stock_quantity,
          new_stock: newQuantity,
          operation
        },
        message: 'Stock updated successfully'
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getProductStats() {
    try {
      const totalProducts = await Product.count();
      const activeProducts = await Product.count({ where: { is_active: true } });
      const lowStockProducts = await Product.count({
        where: {
          [Op.and]: [
            { is_active: true },
            { stock_quantity: { [Op.lte]: { [Op.col]: 'min_stock_level' } } }
          ]
        }
      });

      const expiringProducts = await Product.count({
        where: {
          is_active: true,
          expiration_date: {
            [Op.between]: [new Date(), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)]
          }
        }
      });

      return {
        success: true,
        data: {
          total_products: totalProducts,
          active_products: activeProducts,
          inactive_products: totalProducts - activeProducts,
          low_stock_products: lowStockProducts,
          expiring_products: expiringProducts
        }
      };
    } catch (error) {
      throw new Error(`Error fetching product statistics: ${error.message}`);
    }
  }
}

module.exports = new ProductService();