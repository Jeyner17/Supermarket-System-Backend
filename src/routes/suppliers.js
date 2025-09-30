const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { validateSupplier } = require('../middleware/productValidation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.get('/', authenticateToken, supplierController.getAllSuppliers);
router.get('/:id', authenticateToken, supplierController.getSupplierById);

// Rutas protegidas (solo Administrador y Gerente)
router.post('/', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  validateSupplier, 
  supplierController.createSupplier
);

router.put('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  validateSupplier, 
  supplierController.updateSupplier
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  supplierController.deleteSupplier
);

module.exports = router;