const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

const getProfile = async (req, res, next) => {
  try {
    const result = await authService.getUserProfile(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const result = await authService.createUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getRoles = async (req, res, next) => {
  try {
    const result = await authService.getAllRoles();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  // En una implementación más compleja, invalidaríamos el token en una blacklist
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

module.exports = {
  login,
  getProfile,
  createUser,
  getRoles,
  logout
};