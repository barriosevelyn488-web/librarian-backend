import IBookRepository from '../../domain/repositories/IBookRepository.js';
import Book from '../../domain/entities/Book.js';
import DatabaseConnection from '../database/DatabaseConnection.js';

class SqliteBookRepository extends IBookRepository {
  constructor() {
    super();
    this.db = DatabaseConnection.getInstance();
  }

  _toEntity(row) {
    if (!row) return null;
    return new Book({
      id: row.id_libro,
      isbn: row.isbn,
      titulo: row.titulo,
      autor: row.autor,
      editorial: row.editorial,
      anioPublicacion: row.anio_publicacion,
      precioVenta: row.precio_venta,
      stockTotal: row.stock_total,
      stockDisponible: row.stock_disponible,
      resumen: row.resumen,
      creadoEn: row.creado_en
    });
  }

  async findById(id) {
    const row = await this.db.get(
      'SELECT * FROM libros WHERE id_libro = ?',
      [id]
    );
    return this._toEntity(row);
  }

  async findByIsbn(isbn) {
    const row = await this.db.get(
      'SELECT * FROM libros WHERE UPPER(isbn) = UPPER(?)',
      [isbn]
    );
    return this._toEntity(row);
  }

  async listAll(filters = {}) {
    let sql = 'SELECT * FROM libros WHERE 1=1';
    const params = [];

    if (filters.search) {
      const term = `%${filters.search.trim()}%`;
      sql += ' AND (titulo LIKE ? OR autor LIKE ? OR isbn LIKE ? OR editorial LIKE ?)';
      params.push(term, term, term, term);
    }

    if (filters.autor) {
      sql += ' AND autor LIKE ?';
      params.push(`%${filters.autor.trim()}%`);
    }

    if (filters.availableOnly === true || filters.availableOnly === 'true') {
      sql += ' AND stock_disponible > 0';
    }

    sql += ' ORDER BY titulo ASC';

    const rows = await this.db.all(sql, params);
    return rows.map(r => this._toEntity(r));
  }

  async create(book) {
    const result = await this.db.run(
      `INSERT INTO libros (isbn, titulo, autor, editorial, anio_publicacion, precio_venta, stock_total, stock_disponible, resumen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        book.isbn,
        book.titulo,
        book.autor,
        book.editorial,
        book.anioPublicacion,
        book.precioVenta,
        book.stockTotal,
        book.stockDisponible,
        book.resumen
      ]
    );
    return this.findById(result.lastID);
  }

  async update(book) {
    await this.db.run(
      `UPDATE libros 
       SET isbn = ?, titulo = ?, autor = ?, editorial = ?, anio_publicacion = ?, 
           precio_venta = ?, stock_total = ?, stock_disponible = ?, resumen = ?
       WHERE id_libro = ?`,
      [
        book.isbn,
        book.titulo,
        book.autor,
        book.editorial,
        book.anioPublicacion,
        book.precioVenta,
        book.stockTotal,
        book.stockDisponible,
        book.resumen,
        book.id
      ]
    );
    return this.findById(book.id);
  }

  async delete(id) {
    const result = await this.db.run(
      'DELETE FROM libros WHERE id_libro = ?',
      [id]
    );
    return result.changes > 0;
  }

  async hasActiveLoansOrSales(id) {
    const activeLoans = await this.db.get(
      "SELECT COUNT(*) as count FROM prestamos WHERE id_libro = ? AND estado != 'devuelto'",
      [id]
    );
    const salesCount = await this.db.get(
      'SELECT COUNT(*) as count FROM detalle_ventas WHERE id_libro = ?',
      [id]
    );
    return {
      hasActiveLoans: (activeLoans?.count || 0) > 0,
      activeLoansCount: activeLoans?.count || 0,
      hasSales: (salesCount?.count || 0) > 0,
      salesCount: salesCount?.count || 0
    };
  }
}

export default SqliteBookRepository;
