const jwt = require('jsonwebtoken');
const { User, Role } = require('../../db/models');

class AuthService {
  async login(username, password) {
    try {
      // Buscar usuario con contraseña incluida
      const user = await User.scope('withPassword').findOne({
        where: { username },
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      if (!user || !user.is_active) {
        throw new Error('Invalid credentials');
      }

      // Validar contraseña
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          role: user.role.name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Retornar datos sin contraseña
      const userData = user.toSafeObject();
      userData.role = user.role.name;

      return {
        success: true,
        token,
        user: userData
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      if (!user) {
        throw new Error('User not found');
      }

      const userData = user.toSafeObject();
      userData.role = user.role.name;
      userData.permissions = user.role.permissions;

      return {
        success: true,
        user: userData
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createUser(userData) {
    try {
      // Verificar que el rol existe
      const role = await Role.findByPk(userData.role_id);
      if (!role) {
        throw new Error('Invalid role specified');
      }

      const user = await User.create({
        ...userData,
        password_hash: userData.password // Se hasheará automáticamente en el hook
      });

      const userWithRole = await User.findByPk(user.id, {
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      const safeUser = userWithRole.toSafeObject();
      safeUser.role = userWithRole.role.name;

      return {
        success: true,
        user: safeUser
      };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Username or email already exists');
      }
      throw new Error(error.message);
    }
  }

  async getAllRoles() {
    try {
      const roles = await Role.findAll({
        attributes: ['id', 'name', 'description']
      });

      return {
        success: true,
        roles
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new AuthService();