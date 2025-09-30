const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { validateCategory } = require('../middleware/productValidation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.get('/', authenticateToken, categoryController.getAllCategories);
router.get('/:id', authenticateToken, categoryController.getCategoryById);

// Rutas protegidas (solo Administrador y Gerente)
router.post('/', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  validateCategory, 
  categoryController.createCategory
);

router.put('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  validateCategory, 
  categoryController.updateCategory
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  categoryController.deleteCategory
);

module.exports = router;