import ISaleRepository from '../../domain/repositories/ISaleRepository.js';
import Sale from '../../domain/entities/Sale.js';
import SaleDetail from '../../domain/entities/SaleDetail.js';
import DatabaseConnection from '../database/DatabaseConnection.js';

class SqliteSaleRepository extends ISaleRepository {
  constructor() {
    super();
    this.db = DatabaseConnection.getInstance();
  }

  async findById(id) {
    const saleRow = await this.db.get(
      `SELECT v.*, u.nombre as usuario_nombre, u.identificacion as usuario_identificacion, u.email as usuario_email
       FROM ventas v
       INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
       WHERE v.id_venta = ?`,
      [id]
    );

    if (!saleRow) return null;

    const detailRows = await this.db.all(
      `SELECT dv.*, l.titulo as libro_titulo, l.autor as libro_autor, l.isbn as libro_isbn
       FROM detalle_ventas dv
       INNER JOIN libros l ON dv.id_libro = l.id_libro
       WHERE dv.id_venta = ?`,
      [id]
    );

    const detalles = detailRows.map(
      d =>
        new SaleDetail({
          id: d.id_detalle,
          ventaId: d.id_venta,
          libroId: d.id_libro,
          cantidad: d.cantidad,
          precioUnitario: d.precio_unitario,
          subtotal: d.subtotal,
          libroInfo: {
            titulo: d.libro_titulo,
            autor: d.libro_autor,
            isbn: d.libro_isbn
          }
        })
    );

    return new Sale({
      id: saleRow.id_venta,
      usuarioId: saleRow.id_usuario,
      fechaVenta: saleRow.fecha_venta,
      total: saleRow.total,
      detalles,
      usuarioInfo: {
        nombre: saleRow.usuario_nombre,
        identificacion: saleRow.usuario_identificacion,
        email: saleRow.usuario_email
      }
    });
  }

  async create(sale) {
    const saleResult = await this.db.run(
      `INSERT INTO ventas (id_usuario, fecha_venta, total)
       VALUES (?, ?, ?)`,
      [sale.usuarioId, sale.fechaVenta, sale.total]
    );

    const saleId = saleResult.lastID;

    for (const detail of sale.detalles) {
      await this.db.run(
        `INSERT INTO detalle_ventas (id_venta, id_libro, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          saleId,
          detail.libroId,
          detail.cantidad,
          detail.precioUnitario,
          detail.subtotal
        ]
      );
    }

    return this.findById(saleId);
  }

  async listAll() {
    const saleRows = await this.db.all(
      `SELECT id_venta FROM ventas ORDER BY id_venta DESC`
    );

    const sales = [];
    for (const row of saleRows) {
      const full = await this.findById(row.id_venta);
      if (full) sales.push(full);
    }
    return sales;
  }

  async findByUserId(usuarioId) {
    const rows = await this.db.all(
      'SELECT id_venta FROM ventas WHERE id_usuario = ? ORDER BY id_venta DESC',
      [usuarioId]
    );

    const sales = [];
    for (const r of rows) {
      const sale = await this.findById(r.id_venta);
      if (sale) sales.push(sale);
    }
    return sales;
  }

  async countByBookId(libroId) {
    const row = await this.db.get(
      'SELECT COUNT(*) as count FROM detalle_ventas WHERE id_libro = ?',
      [libroId]
    );
    return row?.count || 0;
  }

  async getMetrics() {
    const totalVentas = await this.db.get('SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total_monto FROM ventas');
    const totalLibrosVendidos = await this.db.get('SELECT COALESCE(SUM(cantidad), 0) as total_unidades FROM detalle_ventas');
    
    return {
      totalVentasCount: totalVentas?.count || 0,
      totalRecaudado: Math.round((totalVentas?.total_monto || 0) * 100) / 100,
      totalUnidadesVendidas: totalLibrosVendidos?.total_unidades || 0
    };
  }
}

export default SqliteSaleRepository;
