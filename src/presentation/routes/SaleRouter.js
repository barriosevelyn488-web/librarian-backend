import express from 'express';

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
    // Historial del usuario autenticado (con alias)
    this.router.get('/my-sales', this.saleController.getMySales);
    this.router.get('/my', this.saleController.getMySales);
    // Ver recibo/factura específica (con alias)
    this.router.get('/:id/receipt', this.saleController.getSaleById);
    this.router.get('/:id', this.saleController.getSaleById);

    // Listar todas las ventas (solo admin)
    this.router.get('/', this.roleMiddleware.handle(), this.saleController.getAllSales);
  }

  getRouter() {
    return this.router;
  }
}

export default SaleRouter;
