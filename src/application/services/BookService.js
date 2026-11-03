const Book = require('../../domain/entities/Book');
const { ValidationError, NotFoundError, ConflictError } = require('../../domain/errors/DomainErrors');

/**
 * BookService
 * Gestión del catálogo, stock y búsqueda de libros en POO pura.
 */
class BookService {
  constructor(bookRepository) {
    this.bookRepository = bookRepository;
  }

  async getAllBooks(filter = {}) {
    return await this.bookRepository.listAll(filter);
  }

  async searchBooks(query) {
    if (!query || query.trim() === '') {
      return await this.bookRepository.listAll();
    }
    return await this.bookRepository.listAll({ search: query.trim() });
  }

  async getBookById(id) {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new NotFoundError(`Libro con ID ${id} no encontrado`);
    }
    return book;
  }

  async createBook(data) {
    const { isbn, titulo, autor, editorial, anioPublicacion, categoria, precioVenta, stockTotal, stockDisponible, stockVenta, stockPrestamo, resumen } = data;

    if (!isbn || !titulo || !autor) {
      throw new ValidationError('ISBN, Título y Autor son obligatorios');
    }

    const existing = await this.bookRepository.findByIsbn(isbn);
    if (existing) {
      throw new ConflictError(`Ya existe un libro registrado con el ISBN ${isbn}`);
    }

    const calculatedTotal = stockTotal !== undefined ? Number(stockTotal) : (Number(stockVenta || 0) + Number(stockPrestamo || 0) || 5);
    const calculatedDisponible = stockDisponible !== undefined ? Number(stockDisponible) : calculatedTotal;

    const book = new Book({
      isbn,
      titulo,
      autor,
      editorial: editorial || '',
      anioPublicacion: Number(anioPublicacion) || new Date().getFullYear(),
      categoria: categoria || 'General',
      precioVenta: Number(precioVenta) || 0,
      stockTotal: calculatedTotal,
      stockDisponible: calculatedDisponible,
      resumen: resumen || ''
    });

    return await this.bookRepository.create(book);
  }

  async updateBook(id, data) {
    const book = await this.getBookById(id);

    if (data.isbn && data.isbn !== book.isbn) {
      const existing = await this.bookRepository.findByIsbn(data.isbn);
      if (existing && existing.id !== Number(id)) {
        throw new ConflictError(`El ISBN ${data.isbn} ya está en uso por otro libro`);
      }
    }

    book.updateDetails(data);
    return await this.bookRepository.update(book);
  }

  async deleteBook(id) {
    await this.getBookById(id);
    return await this.bookRepository.delete(id);
  }
}

module.exports = BookService;
