/**
 * BookController
 * Controlador para operaciones de libros (crear, editar, listar, buscar, eliminar).
 */
class BookController {
  constructor(bookService) {
    this.bookService = bookService;
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.search = this.search.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async getAll(req, res, next) {
    try {
      const { categoria, disponibleVenta, disponiblePrestamo } = req.query;
      const books = await this.bookService.getAllBooks({
        categoria,
        disponibleVenta: disponibleVenta === 'true',
        disponiblePrestamo: disponiblePrestamo === 'true'
      });

      return res.status(200).json({
        success: true,
        count: books.length,
        data: books.map(b => b.toJSON())
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { q } = req.query;
      const books = await this.bookService.searchBooks(q || '');

      return res.status(200).json({
        success: true,
        count: books.length,
        data: books.map(b => b.toJSON())
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const book = await this.bookService.getBookById(req.params.id);
      return res.status(200).json({
        success: true,
        data: book.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newBook = await this.bookService.createBook(req.body);
      return res.status(201).json({
        success: true,
        message: 'Libro registrado exitosamente en el catálogo',
        data: newBook.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updatedBook = await this.bookService.updateBook(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Libro actualizado correctamente',
        data: updatedBook.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.bookService.deleteBook(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Libro eliminado satisfactoriamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default BookController;
