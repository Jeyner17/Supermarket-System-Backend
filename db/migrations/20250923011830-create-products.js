'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      barcode: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'suppliers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      cost_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      selling_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      min_stock_level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      max_stock_level: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      unit_of_measure: {
        type: Sequelize.ENUM('UNIT', 'KG', 'LB', 'LITER', 'ML', 'PACK', 'BOX'),
        allowNull: false,
        defaultValue: 'UNIT'
      },
      expiration_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      is_perishable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      image_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices para optimización
    await queryInterface.addIndex('products', ['barcode']);
    await queryInterface.addIndex('products', ['name']);
    await queryInterface.addIndex('products', ['category_id']);
    await queryInterface.addIndex('products', ['supplier_id']);
    await queryInterface.addIndex('products', ['is_active']);
    await queryInterface.addIndex('products', ['stock_quantity']);
    await queryInterface.addIndex('products', ['min_stock_level']);
    await queryInterface.addIndex('products', ['expiration_date']);
    
    // Índice compuesto para búsquedas frecuentes
    await queryInterface.addIndex('products', ['is_active', 'category_id']);
    await queryInterface.addIndex('products', ['is_active', 'name']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};