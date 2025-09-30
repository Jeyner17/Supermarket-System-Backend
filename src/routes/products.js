const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProduct, validateProductUpdate, validateStockUpdate } = require('../middleware/productValidation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Rutas públicas (solo lectura para cajeros)
router.get('/', authenticateToken, productController.getAllProducts);
router.get('/stats', authenticateToken, productController.getProductStats);
router.get('/low-stock', authenticateToken, productController.getLowStockProducts);
router.get('/expiring', authenticateToken, productController.getExpiringProducts);
router.get('/:id', authenticateToken, productController.getProductById);

// Rutas protegidas (solo Administrador y Gerente)
router.post('/', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  validateProduct, 
  productController.createProduct
);

router.put('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  validateProductUpdate, 
  productController.updateProduct
);

router.patch('/:id/stock', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  validateStockUpdate, 
  productController.updateStock
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  productController.deleteProduct
);

router.post('/:id/restore', 
  authenticateToken, 
  authorizeRoles('Administrador'), 
  productController.restoreProduct
);

module.exports = router;