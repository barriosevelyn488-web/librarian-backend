const Loan = require('../../domain/entities/Loan');
const { ValidationError, NotFoundError, BusinessRuleError } = require('../../domain/errors/DomainErrors');

/**
 * LoanService
 * Gestión del ciclo de vida de préstamos y stock de préstamo.
 */
class LoanService {
  constructor(loanRepository, bookRepository, userRepository) {
    this.loanRepository = loanRepository;
    this.bookRepository = bookRepository;
    this.userRepository = userRepository;
  }

  async createLoan(data) {
    const { usuarioId, libroId, fechaTentativaDevolucion } = data;

    if (!usuarioId || !libroId || !fechaTentativaDevolucion) {
      throw new ValidationError('Usuario, libro y fecha tentativa de devolución son requeridos');
    }

    const user = await this.userRepository.findById(usuarioId);
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${usuarioId} no existe`);
    }

    const book = await this.bookRepository.findById(libroId);
    if (!book) {
      throw new NotFoundError(`Libro con ID ${libroId} no existe`);
    }

    if (!book.canBeLoaned()) {
      throw new BusinessRuleError(`El libro "${book.titulo}" no cuenta con unidades disponibles para préstamo`);
    }

    const fechaPrestamo = new Date().toISOString().split('T')[0];
    const loan = new Loan({
      usuarioId: Number(usuarioId),
      libroId: Number(libroId),
      fechaPrestamo,
      fechaTentativaDevolucion,
      estado: 'activo'
    });

    const createdLoan = await this.loanRepository.create(loan);
    book.decreaseStockForLoan();
    await this.bookRepository.update(book);

    return createdLoan;
  }

  async returnLoan(loanId) {
    const loan = await this.loanRepository.findById(loanId);
    if (!loan) {
      throw new NotFoundError(`Préstamo con ID ${loanId} no encontrado`);
    }

    if (loan.estado === 'devuelto') {
      throw new BusinessRuleError('Este préstamo ya ha sido registrado como devuelto previamente');
    }

    const fechaHoy = new Date().toISOString().split('T')[0];
    loan.markAsReturned(fechaHoy);
    const updatedLoan = await this.loanRepository.update(loan);

    const book = await this.bookRepository.findById(loan.libroId);
    if (book) {
      book.increaseStockOnReturn();
      await this.bookRepository.update(book);
    }

    return updatedLoan;
  }

  async getAllLoans(filter = {}) {
    return await this.loanRepository.listAll(filter);
  }

  async getLoansByUser(usuarioId) {
    return await this.loanRepository.findByUserId(usuarioId);
  }
}

module.exports = LoanService;
