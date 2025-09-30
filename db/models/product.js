'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });

      Product.belongsTo(models.Supplier, {
        foreignKey: 'supplier_id',
        as: 'supplier'
      });
    }

    // Método para verificar si el stock está bajo
    isLowStock() {
      return this.stock_quantity <= this.min_stock_level;
    }

    // Método para verificar si el producto está próximo a vencer
    isExpiringSoon(days = 3) {
      if (!this.expiration_date) return false;
      
      const today = new Date();
      const expirationDate = new Date(this.expiration_date);
      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= days && diffDays >= 0;
    }

    // Método para verificar si el producto está vencido
    isExpired() {
      if (!this.expiration_date) return false;
      
      const today = new Date();
      const expirationDate = new Date(this.expiration_date);
      
      return expirationDate < today;
    }

    // Método para calcular el margen de ganancia
    getProfitMargin() {
      if (this.cost_price === 0) return 0;
      return ((this.selling_price - this.cost_price) / this.cost_price) * 100;
    }

    // Método para obtener información completa del producto
    getFullInfo() {
      return {
        id: this.id,
        barcode: this.barcode,
        name: this.name,
        description: this.description,
        cost_price: parseFloat(this.cost_price),
        selling_price: parseFloat(this.selling_price),
        stock_quantity: this.stock_quantity,
        min_stock_level: this.min_stock_level,
        max_stock_level: this.max_stock_level,
        unit_of_measure: this.unit_of_measure,
        expiration_date: this.expiration_date,
        is_perishable: this.is_perishable,
        image_url: this.image_url,
        notes: this.notes,
        is_active: this.is_active,
        // Campos calculados
        is_low_stock: this.isLowStock(),
        is_expiring_soon: this.isExpiringSoon(),
        is_expired: this.isExpired(),
        profit_margin: this.getProfitMargin(),
        // Relaciones
        category: this.category,
        supplier: this.supplier
      };
    }
  }

  Product.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      validate: {
        len: [0, 50]
      }
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'suppliers',
        key: 'id'
      }
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
        isDecimal: true
      },
      get() {
        return parseFloat(this.getDataValue('cost_price')) || 0;
      }
    },
    selling_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
        isDecimal: true
      },
      get() {
        return parseFloat(this.getDataValue('selling_price')) || 0;
      }
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        isInt: true
      }
    },
    min_stock_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        isInt: true
      }
    },
    max_stock_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        isInt: true
      }
    },
    unit_of_measure: {
      type: DataTypes.ENUM('UNIT', 'KG', 'LB', 'LITER', 'ML', 'PACK', 'BOX'),
      allowNull: false,
      defaultValue: 'UNIT'
    },
    expiration_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    is_perishable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
      where: { is_active: true }
    },
    scopes: {
      withInactive: {
        where: {}
      },
       withRelations: {
        include: [
          { model: sequelize.models.Category, as: 'category' },
          { model: sequelize.models.Supplier, as: 'supplier' }
        ]
      },
      lowStock: {
        where: sequelize.literal('stock_quantity <= min_stock_level')
      },
      expiring: {
        where: {
          expiration_date: {
            [sequelize.Sequelize.Op.lte]: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          },
          expiration_date: {
            [sequelize.Sequelize.Op.gte]: new Date()
          }
        }
      },
      expired: {
        where: {
          expiration_date: {
            [sequelize.Sequelize.Op.lt]: new Date()
          }
        }
      }
    },
    validate: {
      // Validación personalizada: el precio de venta debe ser mayor que el de costo
      sellingPriceGreaterThanCost() {
        if (this.selling_price < this.cost_price) {
          throw new Error('Selling price must be greater than or equal to cost price');
        }
      },
      // Validación personalizada: max_stock debe ser mayor que min_stock
      maxStockGreaterThanMin() {
        if (this.max_stock_level && this.max_stock_level <= this.min_stock_level) {
          throw new Error('Max stock level must be greater than min stock level');
        }
      },
      // Validación: productos perecederos deben tener fecha de vencimiento
      perishablesMustHaveExpiration() {
        if (this.is_perishable && !this.expiration_date) {
          throw new Error('Perishable products must have an expiration date');
        }
      }
    }
  });

  return Product;
};