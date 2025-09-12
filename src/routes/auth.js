const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateUserCreation } = require('../middleware/validation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Rutas públicas
router.post('/login', validateLogin, authController.login);
router.get('/roles', authController.getRoles);

// Rutas protegidas
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/logout', authenticateToken, authController.logout);

// Rutas solo para administradores
router.post('/users', 
  authenticateToken, 
  authorizeRoles('Administrador'), 
  validateUserCreation, 
  authController.createUser
);

module.exports = router;