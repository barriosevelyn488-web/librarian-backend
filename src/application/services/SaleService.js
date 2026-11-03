const Sale = require('../../domain/entities/Sale');
const SaleDetail = require('../../domain/entities/SaleDetail');
const { ValidationError, NotFoundError, BusinessRuleError } = require('../../domain/errors/DomainErrors');

/**
 * SaleService
 * Procesamiento de ventas multilibro con validación de stock y pasarela de pago (POO).
 */
class SaleService {
  constructor(saleRepository, bookRepository, userRepository, paymentGateway) {
    this.saleRepository = saleRepository;
    this.bookRepository = bookRepository;
    this.userRepository = userRepository;
    this.paymentGateway = paymentGateway;
  }

  async processSale(data) {
    const { usuarioId, items, paymentMethod = 'tarjeta_paypal' } = data;

    if (!usuarioId) {
      throw new ValidationError('El ID del usuario/cliente es obligatorio');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError('La venta debe incluir al menos un libro en el carrito');
    }

    const user = await this.userRepository.findById(usuarioId);
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const saleDetails = [];
    const booksToUpdate = [];
    let totalCalculado = 0;

    for (const item of items) {
      const { libroId, cantidad } = item;
      const qty = Number(cantidad);

      if (!libroId || isNaN(qty) || qty <= 0) {
        throw new ValidationError('Cada elemento debe contener libroId válido y cantidad mayor a cero');
      }

      const book = await this.bookRepository.findById(libroId);
      if (!book) {
        throw new NotFoundError(`Libro con ID ${libroId} no existe en catálogo`);
      }

      if (!book.canBeSold(qty)) {
        throw new BusinessRuleError(`Stock insuficiente para el libro "${book.titulo}". Disponible: ${book.stockDisponible}, Solicitado: ${qty}`);
      }

      const subtotal = book.precioVenta * qty;
      totalCalculado += subtotal;

      saleDetails.push(new SaleDetail({
        libroId: book.id,
        cantidad: qty,
        precioUnitario: book.precioVenta,
        subtotal
      }));

      book.decreaseStockForSale(qty);
      booksToUpdate.push(book);
    }

    // Procesar pago a través de la pasarela inyectada (Strategy Pattern)
    let paymentResult = null;
    if (this.paymentGateway) {
      paymentResult = await this.paymentGateway.processPayment({
        amount: totalCalculado,
        currency: 'USD',
        customerEmail: user.email,
        description: `Compra de ${items.length} libros en Acme Store`
      });

      if (!paymentResult.success) {
        throw new BusinessRuleError(`Error al procesar el pago: ${paymentResult.error}`);
      }
    }

    const fechaVenta = new Date().toISOString().split('T')[0];
    const sale = new Sale({
      usuarioId: Number(usuarioId),
      fechaVenta,
      total: totalCalculado,
      detalles: saleDetails
    });

    const createdSale = await this.saleRepository.create(sale);

    // Actualizar inventario de libros
    for (const book of booksToUpdate) {
      await this.bookRepository.update(book);
    }

    const saleJson = createdSale.toJSON();
    if (paymentResult) {
      saleJson.pago = paymentResult;
    }

    return saleJson;
  }

  async getAllSales() {
    return await this.saleRepository.listAll();
  }

  async getSalesByUser(usuarioId) {
    return await this.saleRepository.findByUserId(usuarioId);
  }

  async getSaleById(saleId) {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new NotFoundError(`Venta con ID ${saleId} no encontrada`);
    }
    return sale;
  }
}

module.exports = SaleService;
