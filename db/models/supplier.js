'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      // Un proveedor tiene muchos productos
      Supplier.hasMany(models.Product, {
        foreignKey: 'supplier_id',
        as: 'products'
      });
    }

    // Método para obtener información completa
    getFullInfo() {
      return {
        id: this.id,
        name: this.name,
        contact_person: this.contact_person,
        email: this.email,
        phone: this.phone,
        address: this.address,
        tax_id: this.tax_id,
        is_active: this.is_active
      };
    }
  }

  Supplier.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    contact_person: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [0, 20]
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tax_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [0, 20]
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Supplier',
    tableName: 'suppliers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
      where: { is_active: true }
    },
    scopes: {
      withInactive: {
        where: {}
      }
    }
  });

  return Supplier;
};