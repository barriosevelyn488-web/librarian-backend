import express from 'express';

/**
 * BookRouter
 * Configuración de rutas de libros con protección RBAC en POO.
 */
class BookRouter {
  constructor(bookController, authMiddleware, roleMiddleware) {
    this.bookController = bookController;
    this.authMiddleware = authMiddleware;
    this.roleMiddleware = roleMiddleware;
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    // Rutas públicas
    this.router.get('/', this.bookController.getAll);
    this.router.get('/search', this.bookController.search);
    this.router.get('/:id', this.bookController.getById);

    // Rutas protegidas solo para rol 'admin'
    this.router.post('/', this.authMiddleware.handle(), this.roleMiddleware.handle(), this.bookController.create);
    this.router.put('/:id', this.authMiddleware.handle(), this.roleMiddleware.handle(), this.bookController.update);
    this.router.delete('/:id', this.authMiddleware.handle(), this.roleMiddleware.handle(), this.bookController.delete);
  }

  getRouter() {
    return this.router;
  }
}

export default BookRouter;
