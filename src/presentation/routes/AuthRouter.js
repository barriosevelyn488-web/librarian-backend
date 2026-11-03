const express = require('express');

/**
 * AuthRouter
 * Configuración de rutas de autenticación envuelta en clase POO.
 */
class AuthRouter {
  constructor(authController, authMiddleware, rateLimiter) {
    this.authController = authController;
    this.authMiddleware = authMiddleware;
    this.rateLimiter = rateLimiter;
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post('/register', this.rateLimiter, this.authController.register);
    this.router.post('/login', this.rateLimiter, this.authController.login);
    this.router.post('/logout', this.authController.logout);
    this.router.get('/me', this.authMiddleware.handle(), this.authController.me);
  }

  getRouter() {
    return this.router;
  }
}

module.exports = AuthRouter;
