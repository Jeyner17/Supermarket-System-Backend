const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');

// Configurar rutas principales
router.use('/auth', authRoutes);

// Ruta de salud del sistema
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mapache API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

module.exports = router;