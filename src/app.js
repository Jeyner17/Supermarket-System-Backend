// File: backend/src/app.js (VERSIÓN CORREGIDA)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Importar configuraciones
const { syncDatabase } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false // Desactivar para desarrollo
}));

// CORS configurado
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Rutas principales
app.use('/api', routes);

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware de manejo de errores
app.use(errorHandler);

// ✅ MANEJADOR 404 CORREGIDO (SIN ASTERISCO)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Función para inicializar el servidor
const startServer = async () => {
  try {
    // Sincronizar base de datos
    await syncDatabase();
    
    // Crear directorio de logs si no existe
    const fs = require('fs');
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    
    // Crear directorio de uploads si no existe
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Mapache API Server running on port ${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔒 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    logger.error('Server startup failed', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Inicializar si se ejecuta directamente
if (require.main === module) {
  startServer();
}

module.exports = app;