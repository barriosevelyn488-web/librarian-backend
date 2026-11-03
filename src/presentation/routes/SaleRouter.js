const express = require('express');

/**
 * SaleRouter
 * Configuración de rutas de ventas y pedidos en POO.
 */
class SaleRouter {
  constructor(saleController, authMiddleware, roleMiddleware) {
    this.saleController = saleController;
    this.authMiddleware = authMiddleware;
    this.roleMiddleware = roleMiddleware;
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.use(this.authMiddleware.handle());

    // Crear compra (cliente o admin)
    this.router.post('/', this.saleController.processSale);
    // Historial del usuario autenticado
    this.router.get('/my-sales', this.saleController.getMySales);
    // Ver recibo/factura específica
    this.router.get('/:id', this.saleController.getSaleById);

    // Listar todas las ventas (solo admin)
    this.router.get('/', this.roleMiddleware.handle(), this.saleController.getAllSales);
  }

  getRouter() {
    return this.router;
  }
}

module.exports = SaleRouter;
