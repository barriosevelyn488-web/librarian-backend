const ILoanRepository = require('../../domain/repositories/ILoanRepository');
const Loan = require('../../domain/entities/Loan');
const DatabaseConnection = require('../database/DatabaseConnection');

class SqliteLoanRepository extends ILoanRepository {
  constructor() {
    super();
    this.db = DatabaseConnection.getInstance();
  }

  _toEntity(row) {
    if (!row) return null;
    const loan = new Loan({
      id: row.id_prestamo,
      usuarioId: row.id_usuario,
      libroId: row.id_libro,
      fechaPrestamo: row.fecha_prestamo,
      fechaTentativaDevolucion: row.fecha_tentativa_devolucion,
      fechaDevolucionReal: row.fecha_devolucion_real,
      estado: row.estado,
      notas: row.notas
    });

    loan.usuario = row.usuario_nombre ? {
      id: row.id_usuario,
      nombre: row.usuario_nombre,
      identificacion: row.usuario_identificacion,
      email: row.usuario_email,
      telefono: row.usuario_telefono
    } : null;

    loan.libro = row.libro_titulo ? {
      id: row.id_libro,
      isbn: row.libro_isbn,
      titulo: row.libro_titulo,
      autor: row.libro_autor
    } : null;

    return loan;
  }

  async findById(id) {
    const row = await this.db.get(
      `SELECT p.*, 
              u.nombre as usuario_nombre, u.identificacion as usuario_identificacion, u.email as usuario_email, u.telefono as usuario_telefono,
              l.titulo as libro_titulo, l.autor as libro_autor, l.isbn as libro_isbn
       FROM prestamos p
       INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
       INNER JOIN libros l ON p.id_libro = l.id_libro
       WHERE p.id_prestamo = ?`,
      [id]
    );
    return this._toEntity(row);
  }

  async create(loan) {
    const result = await this.db.run(
      `INSERT INTO prestamos (id_usuario, id_libro, fecha_prestamo, fecha_tentativa_devolucion, fecha_devolucion_real, estado, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        loan.usuarioId,
        loan.libroId,
        loan.fechaPrestamo,
        loan.fechaTentativaDevolucion,
        loan.fechaDevolucionReal,
        loan.estado,
        loan.notas
      ]
    );
    return this.findById(result.lastID);
  }

  async update(loan) {
    await this.db.run(
      `UPDATE prestamos 
       SET fecha_devolucion_real = ?, estado = ?, notas = ?
       WHERE id_prestamo = ?`,
      [
        loan.fechaDevolucionReal,
        loan.estado,
        loan.notas,
        loan.id
      ]
    );
    return this.findById(loan.id);
  }

  async listAll(filters = {}) {
    let sql = `
      SELECT p.*, 
             u.nombre as usuario_nombre, u.identificacion as usuario_identificacion, u.email as usuario_email, u.telefono as usuario_telefono,
             l.titulo as libro_titulo, l.autor as libro_autor, l.isbn as libro_isbn
      FROM prestamos p
      INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
      INNER JOIN libros l ON p.id_libro = l.id_libro
      WHERE 1=1
    `;
    const params = [];

    if (filters.estado) {
      sql += ' AND p.estado = ?';
      params.push(filters.estado);
    }

    if (filters.usuarioId) {
      sql += ' AND p.id_usuario = ?';
      params.push(filters.usuarioId);
    }

    sql += ' ORDER BY p.id_prestamo DESC';

    const rows = await this.db.all(sql, params);
    return rows.map(r => this._toEntity(r));
  }

  async findByUserId(usuarioId) {
    return this.listAll({ usuarioId });
  }

  async countActiveByBookId(libroId) {
    const row = await this.db.get(
      "SELECT COUNT(*) as count FROM prestamos WHERE id_libro = ? AND estado != 'devuelto'",
      [libroId]
    );
    return row?.count || 0;
  }

  async getMetrics() {
    const totalLoans = await this.db.get('SELECT COUNT(*) as count FROM prestamos');
    const activeLoans = await this.db.get("SELECT COUNT(*) as count FROM prestamos WHERE estado = 'activo'");
    const returnedLoans = await this.db.get("SELECT COUNT(*) as count FROM prestamos WHERE estado = 'devuelto'");
    const delayedLoans = await this.db.get("SELECT COUNT(*) as count FROM prestamos WHERE estado = 'retrasado'");

    return {
      total: totalLoans?.count || 0,
      activos: activeLoans?.count || 0,
      devueltos: returnedLoans?.count || 0,
      retrasados: delayedLoans?.count || 0
    };
  }
}

module.exports = SqliteLoanRepository;
