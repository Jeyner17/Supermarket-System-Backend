require('dotenv').config();

module.exports = {
  "development": {
    "username": process.env.DB_USER || "database_user",
    "password": process.env.DB_PASSWORD || "database_secure_password",
    "database": process.env.DB_NAME || "database_db",
    "host": process.env.DB_HOST || "127.0.0.1",
    "port": parseInt(process.env.DB_PORT) || 5432,
    "dialect": "postgres",
    "logging": console.log
  },
  "test": {
    "username": process.env.DB_USER || "database_user",
    "password": process.env.DB_PASSWORD || "database_secure_password", 
    "database": process.env.DB_TEST_NAME || "database_test_db",
    "host": process.env.DB_HOST || "127.0.0.1",
    "port": parseInt(process.env.DB_PORT) || 5432,
    "dialect": "postgres",
    "logging": false
  },
  "production": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port": parseInt(process.env.DB_PORT) || 5432,
    // "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "logging": false,
    "pool": {
      "max": 5,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    },
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
};