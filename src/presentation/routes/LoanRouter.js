import express from 'express';

/**
 * LoanRouter
 * Configuración de rutas de préstamos en POO.
 */
class LoanRouter {
  constructor(loanController, authMiddleware, roleMiddleware) {
    this.loanController = loanController;
    this.authMiddleware = authMiddleware;
    this.roleMiddleware = roleMiddleware;
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    // Todas las operaciones de préstamos requieren autenticación
    this.router.use(this.authMiddleware.handle());

    // Rutas para clientes y admin
    this.router.post('/', this.loanController.createLoan);
    this.router.get('/my-loans', this.loanController.getMyLoans);
    this.router.get('/my', this.loanController.getMyLoans);
    this.router.patch('/:id/return', this.loanController.returnLoan);
    this.router.post('/:id/return', this.loanController.returnLoan);

    // Rutas de administración general
    this.router.get('/', this.roleMiddleware.handle(), this.loanController.getAllLoans);
  }

  getRouter() {
    return this.router;
  }
}

export default LoanRouter;
