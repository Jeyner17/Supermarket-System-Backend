const { Category, Product } = require('../../db/models');
const { Op } = require('sequelize');

class CategoryService {
  async getAllCategories(includeInactive = false) {
    try {
      const scope = includeInactive ? 'withInactive' : 'defaultScope';
      const categories = await Category.scope(scope).findAll({
        order: [['name', 'ASC']],
        include: [{
          model: Product,
          as: 'products',
          attributes: ['id'],
          where: { is_active: true },
          required: false
        }]
      });

      const categoriesWithCount = categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        products_count: category.products ? category.products.length : 0,
        created_at: category.created_at,
        updated_at: category.updated_at
      }));

      return {
        success: true,
        data: categoriesWithCount
      };
    } catch (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  }

  async getCategoryById(id) {
    try {
      const category = await Category.findByPk(id);
      
      if (!category) {
        throw new Error('Category not found');
      }

      return {
        success: true,
        data: category
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createCategory(categoryData) {
    try {
      const category = await Category.create(categoryData);
      
      return {
        success: true,
        data: category,
        message: 'Category created successfully'
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const category = await Category.findByPk(id);
      
      if (!category) {
        throw new Error('Category not found');
      }

      await category.update(categoryData);

      return {
        success: true,
        data: category,
        message: 'Category updated successfully'
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteCategory(id) {
    try {
      const category = await Category.findByPk(id);
      
      if (!category) {
        throw new Error('Category not found');
      }

      // Verificar si tiene productos asociados
      const productsCount = await Product.count({
        where: { 
          category_id: id,
          is_active: true 
        }
      });

      if (productsCount > 0) {
        throw new Error(`Cannot delete category. It has ${productsCount} active products associated.`);
      }

      // Soft delete
      await category.update({ is_active: false });

      return {
        success: true,
        message: 'Category deleted successfully'
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new CategoryService();