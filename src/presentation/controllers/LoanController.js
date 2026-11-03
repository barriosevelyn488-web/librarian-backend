/**
 * LoanController
 * Controlador para la gestión de préstamos y devoluciones de libros (POO).
 */
class LoanController {
  constructor(loanService) {
    this.loanService = loanService;
    this.createLoan = this.createLoan.bind(this);
    this.getAllLoans = this.getAllLoans.bind(this);
    this.getMyLoans = this.getMyLoans.bind(this);
    this.returnLoan = this.returnLoan.bind(this);
  }

  async createLoan(req, res, next) {
    try {
      // Si el rol es cliente, el usuarioId se toma automáticamente del token autenticado
      const usuarioId = req.user.rol === 'admin' && req.body.usuarioId ? req.body.usuarioId : req.user.id;

      const loan = await this.loanService.createLoan({
        usuarioId,
        libroId: req.body.libroId,
        fechaTentativaDevolucion: req.body.fechaTentativaDevolucion
      });

      return res.status(201).json({
        success: true,
        message: 'Préstamo registrado exitosamente',
        data: loan.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllLoans(req, res, next) {
    try {
      const { estado } = req.query;
      const loans = await this.loanService.getAllLoans({ estado });

      return res.status(200).json({
        success: true,
        count: loans.length,
        data: loans.map(l => l.toJSON())
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyLoans(req, res, next) {
    try {
      const loans = await this.loanService.getLoansByUser(req.user.id);
      return res.status(200).json({
        success: true,
        count: loans.length,
        data: loans.map(l => l.toJSON())
      });
    } catch (error) {
      next(error);
    }
  }

  async returnLoan(req, res, next) {
    try {
      const updatedLoan = await this.loanService.returnLoan(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Devolución del libro registrada exitosamente',
        data: updatedLoan.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LoanController;
