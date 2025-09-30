const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const supplierRoutes = require('./suppliers');

// Configurar rutas principales
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);

// Ruta de salud del sistema
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Supermercado API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    sprint: '2 - CRUD Products'
  });
});

module.exports = router;