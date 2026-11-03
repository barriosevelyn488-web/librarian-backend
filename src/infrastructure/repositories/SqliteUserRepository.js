const IUserRepository = require('../../domain/repositories/IUserRepository');
const User = require('../../domain/entities/User');
const DatabaseConnection = require('../database/DatabaseConnection');

class SqliteUserRepository extends IUserRepository {
  constructor() {
    super();
    this.db = DatabaseConnection.getInstance();
  }

  _toEntity(row) {
    if (!row) return null;
    return new User({
      id: row.id_usuario,
      identificacion: row.identificacion,
      nombre: row.nombre,
      telefono: row.telefono,
      direccion: row.direccion,
      email: row.email,
      passwordHash: row.password_hash,
      rol: row.rol,
      creadoEn: row.creado_en
    });
  }

  async findById(id) {
    const row = await this.db.get(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [id]
    );
    return this._toEntity(row);
  }

  async findByEmail(email) {
    const row = await this.db.get(
      'SELECT * FROM usuarios WHERE LOWER(email) = LOWER(?)',
      [email]
    );
    return this._toEntity(row);
  }

  async findByIdentificacion(identificacion) {
    const row = await this.db.get(
      'SELECT * FROM usuarios WHERE identificacion = ?',
      [identificacion]
    );
    return this._toEntity(row);
  }

  async create(user) {
    const result = await this.db.run(
      `INSERT INTO usuarios (identificacion, nombre, telefono, direccion, email, password_hash, rol)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user.identificacion,
        user.nombre,
        user.telefono,
        user.direccion,
        user.email,
        user.passwordHash,
        user.rol
      ]
    );
    return this.findById(result.lastID);
  }

  async update(user) {
    await this.db.run(
      `UPDATE usuarios 
       SET nombre = ?, telefono = ?, direccion = ?, email = ?, rol = ?, identificacion = ?, password_hash = ?
       WHERE id_usuario = ?`,
      [
        user.nombre,
        user.telefono,
        user.direccion,
        user.email,
        user.rol,
        user.identificacion,
        user.passwordHash,
        user.id
      ]
    );
    return this.findById(user.id);
  }

  async delete(id) {
    const result = await this.db.run(
      'DELETE FROM usuarios WHERE id_usuario = ?',
      [id]
    );
    return result.changes > 0;
  }

  async listAll(filters = {}) {
    let sql = 'SELECT id_usuario, identificacion, nombre, telefono, direccion, email, rol, creado_en FROM usuarios WHERE 1=1';
    const params = [];

    if (filters.search) {
      const term = `%${filters.search.trim()}%`;
      sql += ' AND (nombre LIKE ? OR email LIKE ? OR identificacion LIKE ?)';
      params.push(term, term, term);
    }

    if (filters.rol) {
      sql += ' AND rol = ?';
      params.push(filters.rol);
    }

    sql += ' ORDER BY id_usuario DESC';

    const rows = await this.db.all(sql, params);
    return rows.map(r => this._toEntity(r));
  }

  async hasActiveLoansOrPurchases(id) {
    const activeLoans = await this.db.get(
      "SELECT COUNT(*) as count FROM prestamos WHERE id_usuario = ? AND estado != 'devuelto'",
      [id]
    );
    const purchases = await this.db.get(
      'SELECT COUNT(*) as count FROM ventas WHERE id_usuario = ?',
      [id]
    );

    return {
      hasActiveLoans: (activeLoans?.count || 0) > 0,
      activeLoansCount: activeLoans?.count || 0,
      hasPurchases: (purchases?.count || 0) > 0,
      purchasesCount: purchases?.count || 0
    };
  }
}

module.exports = SqliteUserRepository;
