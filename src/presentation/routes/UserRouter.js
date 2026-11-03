const express = require('express');

/**
 * UserRouter
 * Configuración de rutas para la administración de usuarios (Exclusivo Administrador).
 */
class UserRouter {
  constructor(userController, authMiddleware, roleMiddleware) {
    this.userController = userController;
    this.authMiddleware = authMiddleware;
    this.roleMiddleware = roleMiddleware;
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    // Exclusivo para usuarios autenticados con rol 'admin'
    this.router.use(this.authMiddleware.handle());
    this.router.use(this.roleMiddleware.handle());

    this.router.get('/', this.userController.getAllUsers);
    this.router.post('/', this.userController.createUser);
    this.router.get('/:id', this.userController.getUserById);
    this.router.put('/:id', this.userController.updateUser);
    this.router.delete('/:id', this.userController.deleteUser);
  }

  getRouter() {
    return this.router;
  }
}

module.exports = UserRouter;
