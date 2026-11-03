import express from 'express';

/**
 * ProfileRouter
 * Configuración de rutas de perfil de usuario en POO.
 */
class ProfileRouter {
  constructor(profileController, authMiddleware) {
    this.profileController = profileController;
    this.authMiddleware = authMiddleware;
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.use(this.authMiddleware.handle());
    this.router.get('/', this.profileController.getProfile);
    this.router.put('/', this.profileController.updateProfile);
  }

  getRouter() {
    return this.router;
  }
}

export default ProfileRouter;
